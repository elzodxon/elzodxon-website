import { promises as fs } from 'fs';
import { join } from 'path';

interface LinkedInPost {
  id: string;
  text: string;
  date: string;
  link: string;
  image: string | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
}

const DATA_FILE = join(process.cwd(), 'server/data/linkedin-posts.json');

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
    let posts: LinkedInPost[] = [];
    
    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      posts = JSON.parse(data);
    } catch {
      // File doesn't exist, return empty array
      return {
        posts: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
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
        post.text.toLowerCase().includes(search)
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
      statusMessage: `Failed to fetch LinkedIn posts: ${error.message}`,
    });
  }
});
