import { promises as fs } from 'fs';
import { join } from 'path';

interface Talk {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'youtube' | 'instagram' | 'image';
  videoId?: string;
  thumbnail?: string;
  instagramUrl?: string;
  image?: string;
}

const DATA_FILE = join(process.cwd(), 'server/data/talks.json');

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Talk ID is required',
    });
  }

  try {
    let talks: Talk[] = [];

    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      talks = JSON.parse(data);
    } catch {
      throw createError({
        statusCode: 404,
        statusMessage: 'No talks available.',
      });
    }

    // Find the talk by ID
    const talk = talks.find((t) => t.id === id);

    if (!talk) {
      throw createError({
        statusCode: 404,
        statusMessage: `Talk with ID ${id} not found`,
      });
    }

    // Sort talks by date for navigation
    const sortedTalks = [...talks].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const currentIndex = sortedTalks.findIndex((t) => t.id === id);
    const prevTalk = currentIndex > 0 ? sortedTalks[currentIndex - 1] : null;
    const nextTalk =
      currentIndex < sortedTalks.length - 1 ? sortedTalks[currentIndex + 1] : null;

    return {
      talk,
      navigation: {
        prev: prevTalk ? { id: prevTalk.id, title: prevTalk.title } : null,
        next: nextTalk ? { id: nextTalk.id, title: nextTalk.title } : null,
      },
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch talk: ${error.message}`,
    });
  }
});
