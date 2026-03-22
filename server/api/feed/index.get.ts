import { promises as fs } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'server/data')

interface FeedPost {
  id: string
  platform: 'telegram' | 'linkedin' | 'youtube'
  type: 'text' | 'image' | 'video'
  title?: string
  text: string
  link: string
  date: string
  media?: {
    type: 'image' | 'video'
    url: string
  }
  engagement?: {
    views?: string | number
    likes?: number
    comments?: number
  }
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
  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10))
  const platform = (query.platform as string)?.toLowerCase() || ''
  const search = (query.search as string)?.toLowerCase() || ''

  try {
    // Read all cached data files in parallel
    const [telegramPosts, linkedinPosts, youtubePosts] = await Promise.all([
      readJsonFile<any>('telegram-posts.json'),
      readJsonFile<any>('linkedin-posts.json'),
      readJsonFile<any>('youtube-posts.json'),
    ])

    const posts: FeedPost[] = []

    // Normalize telegram posts
    for (const post of telegramPosts) {
      posts.push({
        id: `tg-${post.id}`,
        platform: 'telegram',
        type: post.image ? 'image' : 'text',
        text: post.description || '',
        link: post.link || '',
        date: post.date || '',
        ...(post.image
          ? { media: { type: 'image' as const, url: post.image } }
          : {}),
        ...(post.views
          ? { engagement: { views: post.views } }
          : {}),
      })
    }

    // Normalize linkedin posts
    for (const post of linkedinPosts) {
      posts.push({
        id: `li-${post.id}`,
        platform: 'linkedin',
        type: 'text',
        text: post.text || '',
        link: post.link || '',
        date: post.date || '',
        ...((post.likes || post.comments)
          ? {
              engagement: {
                ...(post.likes != null ? { likes: post.likes } : {}),
                ...(post.comments != null ? { comments: post.comments } : {}),
              },
            }
          : {}),
      })
    }

    // Normalize youtube posts
    for (const post of youtubePosts) {
      posts.push({
        id: `yt-${post.id}`,
        platform: 'youtube',
        type: 'video',
        title: post.title || '',
        text: post.description || '',
        link: post.link || '',
        date: post.date || '',
        media: {
          type: 'video',
          url: post.thumbnail || '',
        },
      })
    }

    // Filter by platform
    let filteredPosts = posts
    if (platform) {
      filteredPosts = filteredPosts.filter((post) => post.platform === platform)
    }

    // Filter by search
    if (search) {
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.text.toLowerCase().includes(search) ||
          (post.title && post.title.toLowerCase().includes(search))
      )
    }

    // Sort by date descending
    filteredPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Paginate
    const total = filteredPosts.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedPosts = filteredPosts.slice(offset, offset + limit)

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
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch unified feed: ${error.message}`,
    })
  }
})
