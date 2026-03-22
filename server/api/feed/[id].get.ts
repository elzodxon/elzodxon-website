import { promises as fs } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'server/data')

async function readJsonFile<T>(filename: string): Promise<T[]> {
  try {
    const data = await fs.readFile(join(DATA_DIR, filename), 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing post ID' })
  }

  const [telegramPosts, linkedinPosts, youtubePosts] = await Promise.all([
    readJsonFile<any>('telegram-posts.json'),
    readJsonFile<any>('linkedin-posts.json'),
    readJsonFile<any>('youtube-posts.json'),
  ])

  // Search in telegram
  if (id.startsWith('tg-')) {
    const postId = id.replace('tg-', '')
    const post = telegramPosts.find((p: any) => p.id === postId)
    if (post) {
      return {
        id: `tg-${post.id}`,
        platform: 'telegram',
        type: post.image ? 'image' : 'text',
        text: post.description || '',
        link: post.link || '',
        date: post.date || '',
        ...(post.image ? { media: { type: 'image', url: post.image } } : {}),
        ...(post.views ? { engagement: { views: post.views } } : {}),
      }
    }
  }

  // Search in youtube
  if (id.startsWith('yt-')) {
    const videoId = id.replace('yt-', '')
    const post = youtubePosts.find((p: any) => p.id === videoId)
    if (post) {
      return {
        id: `yt-${post.id}`,
        platform: 'youtube',
        type: 'video',
        title: post.title || '',
        text: post.description || '',
        link: post.link || '',
        date: post.date || '',
        media: { type: 'video', url: post.thumbnail || '' },
      }
    }
  }

  // Search in linkedin
  if (id.startsWith('li-')) {
    const postId = id.replace('li-', '')
    const post = linkedinPosts.find((p: any) => p.id === postId)
    if (post) {
      return {
        id: `li-${post.id}`,
        platform: 'linkedin',
        type: 'text',
        text: post.text || '',
        link: post.link || '',
        date: post.date || '',
        ...((post.likes || post.comments) ? {
          engagement: {
            ...(post.likes != null ? { likes: post.likes } : {}),
            ...(post.comments != null ? { comments: post.comments } : {}),
          },
        } : {}),
      }
    }
  }

  throw createError({ statusCode: 404, statusMessage: 'Post not found' })
})
