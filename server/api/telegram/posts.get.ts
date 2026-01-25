import { promises as fs } from 'fs';
import { join } from 'path';

interface TelegramPost {
  id: string;
  description: string;
  link: string;
  date: string;
  image: string | null;
  views: string | null;
}

const DATA_FILE = join(process.cwd(), 'server/data/telegram-posts.json');

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  
  // Pagination params
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  
  // Date filter params
  const startDate = query.startDate ? new Date(query.startDate as string) : null;
  const endDate = query.endDate ? new Date(query.endDate as string) : null;
  
  // Search query
  const search = (query.search as string)?.toLowerCase() || '';

  try {
    // Try to read from cache file
    let posts: TelegramPost[] = [];
    
    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      posts = JSON.parse(data);
    } catch {
      // File doesn't exist, try to sync first
      const config = useRuntimeConfig();
      const channelUsername = config.telegramChannel || 'elzodxon';
      
      // Fetch from Telegram directly as fallback
      const url = `https://t.me/s/${channelUsername}`;
      const html = await $fetch<string>(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      posts = parsePostsFromHtml(html, channelUsername);
      
      // Save to file for next time
      const dataDir = join(process.cwd(), 'server/data');
      try {
        await fs.mkdir(dataDir, { recursive: true });
        await fs.writeFile(DATA_FILE, JSON.stringify(posts, null, 2));
      } catch {
        // Ignore write errors
      }
    }

    // Apply filters
    let filteredPosts = posts;

    // Date filtering
    if (startDate) {
      filteredPosts = filteredPosts.filter(post => new Date(post.date) >= startDate);
    }
    if (endDate) {
      filteredPosts = filteredPosts.filter(post => new Date(post.date) <= endDate);
    }

    // Search filtering
    if (search) {
      filteredPosts = filteredPosts.filter(post => 
        post.description.toLowerCase().includes(search)
      );
    }

    // Sort by date (newest first)
    filteredPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate pagination
    const total = filteredPosts.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedPosts = filteredPosts.slice(offset, offset + limit);

    return {
      posts: paginatedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch Telegram posts: ${error.message}`,
    });
  }
});

function parsePostsFromHtml(html: string, channelUsername: string): TelegramPost[] {
  const posts: TelegramPost[] = [];
  
  const regex = /data-post="([^"]+)"[\s\S]*?class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>[\s\S]*?datetime="([^"]+)"[\s\S]*?<span class="tgme_widget_message_views">([^<]*)<\/span>/g;
  
  let match;
  while ((match = regex.exec(html)) !== null) {
    const fullPostId = match[1];
    const textContent = match[2];
    const dateStr = match[3];
    const views = match[4];
    
    const postNumber = fullPostId.split('/')[1] || fullPostId;
    
    const postSection = html.substring(Math.max(0, match.index - 2000), match.index + match[0].length);
    const imageMatch = postSection.match(/background-image:url\('([^']+)'\)/);
    const image = imageMatch ? imageMatch[1] : null;
    
    const description = textContent
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#33;/g, "!")
      .replace(/&#036;/g, "$")
      .trim();
    
    if (description) {
      posts.push({
        id: postNumber,
        description,
        link: `https://t.me/${fullPostId}`,
        date: dateStr,
        image,
        views,
      });
    }
  }
  
  return posts.reverse();
}
