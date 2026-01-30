import { promises as fs } from 'fs';
import { join } from 'path';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  url: string;
}

const DATA_FILE = join(process.cwd(), 'server/data/youtube-videos.json');

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Video ID is required',
    });
  }

  try {
    let videos: YouTubeVideo[] = [];

    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      videos = JSON.parse(data);
    } catch {
      throw createError({
        statusCode: 404,
        statusMessage: 'No videos available.',
      });
    }

    const video = videos.find((v) => v.id === id);

    if (!video) {
      throw createError({
        statusCode: 404,
        statusMessage: `Video with ID ${id} not found`,
      });
    }

    // Find adjacent videos for navigation
    const sortedVideos = [...videos].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    const currentIndex = sortedVideos.findIndex((v) => v.id === id);
    const prevVideo = currentIndex > 0 ? sortedVideos[currentIndex - 1] : null;
    const nextVideo =
      currentIndex < sortedVideos.length - 1 ? sortedVideos[currentIndex + 1] : null;

    return {
      video,
      navigation: {
        prev: prevVideo ? { id: prevVideo.id, title: prevVideo.title } : null,
        next: nextVideo ? { id: nextVideo.id, title: nextVideo.title } : null,
      },
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch video: ${error.message}`,
    });
  }
});
