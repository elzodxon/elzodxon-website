import { promises as fs } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'server/data')

function generateSlug(text: string, id: string, platform: string): string {
  const source = text || id
  const slug = source
    .toLowerCase()
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60)
    .replace(/-$/, '')
  return `${platform.substring(0, 2)}-${slug || id}`
}

async function readJsonFile<T>(filename: string): Promise<T[]> {
  try {
    const data = await fs.readFile(join(DATA_DIR, filename), 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'id')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing post slug' })
  }

  const [telegramPosts, linkedinPosts, youtubePosts] = await Promise.all([
    readJsonFile<any>('telegram-posts.json'),
    readJsonFile<any>('linkedin-posts.json'),
    readJsonFile<any>('youtube-posts.json'),
  ])

  // Search telegram
  for (const post of telegramPosts) {
    const postSlug = generateSlug(post.description || '', post.id, 'telegram')
    if (postSlug === slug || `tg-${post.id}` === slug) {
      return {
        id: `tg-${post.id}`,
        slug: postSlug,
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

  // Search youtube
  for (const post of youtubePosts) {
    const postSlug = generateSlug(post.title || post.description || '', post.id, 'youtube')
    if (postSlug === slug || `yt-${post.id}` === slug) {
      return {
        id: `yt-${post.id}`,
        slug: postSlug,
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

  // Search linkedin
  for (const post of linkedinPosts) {
    const postSlug = generateSlug(post.text || '', post.id, 'linkedin')
    if (postSlug === slug || `li-${post.id}` === slug) {
      return {
        id: `li-${post.id}`,
        slug: postSlug,
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
