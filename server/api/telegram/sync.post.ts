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
  const config = useRuntimeConfig();
  const channelUsername = config.telegramChannel || 'elzodxon';
  
  // Get query params - how many pages to fetch (default 5, max 20)
  const query = getQuery(event);
  const pagesToFetch = Math.min(20, Math.max(1, Number(query.pages) || 5));

  try {
    const allPosts: TelegramPost[] = [];
    let beforeId: string | null = null;
    let pagesLoaded = 0;

    // Fetch multiple pages
    for (let i = 0; i < pagesToFetch; i++) {
      const url = beforeId 
        ? `https://t.me/s/${channelUsername}?before=${beforeId}`
        : `https://t.me/s/${channelUsername}`;
      
      console.log(`Fetching page ${i + 1}: ${url}`);
      
      const html = await $fetch<string>(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });

      // Parse posts from this page
      const posts = parsePostsFromHtml(html, channelUsername);
      
      if (posts.length === 0) {
        console.log('No more posts found, stopping');
        break;
      }
      
      allPosts.push(...posts);
      pagesLoaded++;
      
      // Find the oldest post ID for next page
      // Posts are already sorted newest first, so last one is oldest
      const oldestPost = posts[posts.length - 1];
      beforeId = oldestPost.id;
      
      // Check if there's a "load more" link
      const hasMoreMatch = html.match(/href="[^"]*before=(\d+)"/);
      if (!hasMoreMatch) {
        console.log('No more pages available');
        break;
      }
      
      // Small delay to be nice to Telegram servers
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Ensure data directory exists
    const dataDir = join(process.cwd(), 'server/data');
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }

    // Load existing posts to merge
    let existingPosts: TelegramPost[] = [];
    try {
      const existingData = await fs.readFile(DATA_FILE, 'utf-8');
      existingPosts = JSON.parse(existingData);
    } catch {
      // File doesn't exist yet
    }

    // Merge posts - use a Map to deduplicate by ID
    const postMap = new Map<string, TelegramPost>();
    
    // Add existing posts first
    for (const post of existingPosts) {
      postMap.set(post.id, post);
    }
    
    // Add/update with new posts
    for (const post of allPosts) {
      postMap.set(post.id, post);
    }

    // Convert back to array and sort by date (newest first)
    const mergedPosts = Array.from(postMap.values());
    mergedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Save to file
    await fs.writeFile(DATA_FILE, JSON.stringify(mergedPosts, null, 2));

    return {
      success: true,
      message: `Fetched ${pagesLoaded} pages, ${allPosts.length} posts. Total: ${mergedPosts.length} posts`,
      newPosts: allPosts.length,
      totalPosts: mergedPosts.length,
      pagesLoaded,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to sync Telegram posts: ${error.message}`,
    });
  }
});

function parsePostsFromHtml(html: string, channelUsername: string): TelegramPost[] {
  const posts: TelegramPost[] = [];
  const seenIds = new Set<string>();
  
  // Match posts with text content
  const regex = /data-post="([^"]+)"[\s\S]*?class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>[\s\S]*?datetime="([^"]+)"[\s\S]*?<span class="tgme_widget_message_views">([^<]*)<\/span>/g;
  
  let match;
  while ((match = regex.exec(html)) !== null) {
    const fullPostId = match[1];
    const textContent = match[2];
    const dateStr = match[3];
    const views = match[4];
    
    const postNumber = fullPostId.split('/')[1] || fullPostId;
    
    // Skip duplicates
    if (seenIds.has(postNumber)) continue;
    seenIds.add(postNumber);
    
    // Extract image from before the text
    const postSection = html.substring(Math.max(0, match.index - 3000), match.index + match[0].length);
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
  
  // Sort by ID descending (newest first)
  posts.sort((a, b) => Number(b.id) - Number(a.id));
  
  return posts;
}
