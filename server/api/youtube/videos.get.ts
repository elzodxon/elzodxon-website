import { promises as fs } from 'fs';
import { join } from 'path';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  videoId: string;
  thumbnail: string;
  publishedAt: string;
  duration: string;
  views: string;
}

const DATA_FILE = join(process.cwd(), 'server/data/youtube-videos.json');

export default defineEventHandler(async () => {
  try {
    let videos: YouTubeVideo[] = [];

    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      videos = JSON.parse(data);
    } catch {
      return {
        videos: [],
        total: 0,
      };
    }

    // Sort by date (newest first)
    videos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return {
      videos,
      total: videos.length,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch YouTube videos: ${error.message}`,
    });
  }
});
