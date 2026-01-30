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

export default defineEventHandler(async () => {
  try {
    let talks: Talk[] = [];

    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      talks = JSON.parse(data);
    } catch {
      return {
        talks: [],
        total: 0,
      };
    }

    // Sort by date (newest first)
    talks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      talks,
      total: talks.length,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch talks: ${error.message}`,
    });
  }
});
