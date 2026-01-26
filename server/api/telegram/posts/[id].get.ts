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
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Post ID is required',
    });
  }

  try {
    // Read posts from cache file
    let posts: TelegramPost[] = [];

    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      posts = JSON.parse(data);
    } catch {
      throw createError({
        statusCode: 404,
        statusMessage: 'No posts available. Please sync from Telegram first.',
      });
    }

    // Find the post by ID
    const post = posts.find((p) => p.id === id);

    if (!post) {
      throw createError({
        statusCode: 404,
        statusMessage: `Post with ID ${id} not found`,
      });
    }

    // Find adjacent posts for navigation
    const sortedPosts = [...posts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const currentIndex = sortedPosts.findIndex((p) => p.id === id);
    const prevPost = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null;
    const nextPost =
      currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null;

    return {
      post,
      navigation: {
        prev: prevPost ? { id: prevPost.id, description: prevPost.description } : null,
        next: nextPost ? { id: nextPost.id, description: nextPost.description } : null,
      },
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch post: ${error.message}`,
    });
  }
});
