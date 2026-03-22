import { promises as fs } from 'fs'
import { join } from 'path'

const DATA_FILE = join(process.cwd(), 'server/data/youtube-posts.json')
const CACHE_MAX_AGE = 60 * 60 * 1000 // 1 hour

interface YouTubePost {
  id: string
  title: string
  description: string
  link: string
  date: string
  thumbnail: string
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10))
  const startDate = query.startDate ? new Date(query.startDate as string) : null
  const endDate = query.endDate ? new Date(query.endDate as string) : null
  const search = (query.search as string)?.toLowerCase() || ''
  const refresh = query.refresh === 'true'

  try {
    let posts: YouTubePost[] = []
    let shouldFetch = refresh

    // Check if cache exists and is fresh
    if (!shouldFetch) {
      try {
        const stat = await fs.stat(DATA_FILE)
        const age = Date.now() - stat.mtimeMs
        if (age > CACHE_MAX_AGE) {
          shouldFetch = true
        }
      } catch {
        shouldFetch = true
      }
    }

    if (!shouldFetch) {
      try {
        const data = await fs.readFile(DATA_FILE, 'utf-8')
        posts = JSON.parse(data)
      } catch {
        shouldFetch = true
      }
    }

    if (shouldFetch) {
      const config = useRuntimeConfig()
      const channelId = config.youtubeChannelId || 'UCxxxxxxxxxxx'
      const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`

      try {
        const xml = await $fetch<string>(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        })

        posts = parseYouTubeFeed(xml)

        // Save cache
        const dataDir = join(process.cwd(), 'server/data')
        await fs.mkdir(dataDir, { recursive: true })
        await fs.writeFile(DATA_FILE, JSON.stringify(posts, null, 2))
      } catch {
        // Fallback to stale cache if fetch fails
        try {
          const data = await fs.readFile(DATA_FILE, 'utf-8')
          posts = JSON.parse(data)
        } catch {}
      }
    }

    let filteredPosts = posts

    if (startDate) {
      filteredPosts = filteredPosts.filter((post) => new Date(post.date) >= startDate)
    }
    if (endDate) {
      filteredPosts = filteredPosts.filter((post) => new Date(post.date) <= endDate)
    }
    if (search) {
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(search) ||
          post.description.toLowerCase().includes(search)
      )
    }

    filteredPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

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
      statusMessage: `Failed to fetch YouTube posts: ${error.message}`,
    })
  }
})

function parseYouTubeFeed(xml: string): YouTubePost[] {
  const posts: YouTubePost[] = []
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g

  let match
  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1]

    const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)
    const titleMatch = entry.match(/<title>([^<]+)<\/title>/)
    const publishedMatch = entry.match(/<published>([^<]+)<\/published>/)
    const linkMatch = entry.match(/<link[^>]+href="([^"]+)"/)
    const descriptionMatch = entry.match(/<media:description>([^<]*)<\/media:description>/)

    if (videoIdMatch && titleMatch && publishedMatch) {
      const videoId = videoIdMatch[1]
      const rawDescription = descriptionMatch ? descriptionMatch[1] : ''
      const description = rawDescription
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .substring(0, 200)

      posts.push({
        id: videoId,
        title: titleMatch[1]
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'"),
        description,
        link: linkMatch ? linkMatch[1] : `https://www.youtube.com/watch?v=${videoId}`,
        date: publishedMatch[1],
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      })
    }
  }

  return posts
}
