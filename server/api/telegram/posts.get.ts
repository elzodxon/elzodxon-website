import { promises as fs } from 'fs'
import { join } from 'path'

const DATA_FILE = join(process.cwd(), 'server/data/telegram-posts.json')
const CACHE_MAX_AGE = 30 * 60 * 1000 // 30 minutes

interface TelegramPost {
  id: string
  description: string
  link: string
  date: string
  image: string | null
  views: string
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
    let posts: TelegramPost[] = []
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
      const channelUsername = config.telegramChannel || 'elzodxon'
      const url = `https://t.me/s/${channelUsername}`

      try {
        const html = await $fetch<string>(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        })

        posts = parsePostsFromHtml(html)

        // Save cache
        const dataDir = join(process.cwd(), 'server/data')
        await fs.mkdir(dataDir, { recursive: true })
        await fs.writeFile(DATA_FILE, JSON.stringify(posts, null, 2))
      } catch {
        // Fallback to stale cache if scrape fails
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
      filteredPosts = filteredPosts.filter((post) =>
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
      statusMessage: `Failed to fetch Telegram posts: ${error.message}`,
    })
  }
})

function parsePostsFromHtml(html: string): TelegramPost[] {
  const posts: TelegramPost[] = []
  const regex =
    /data-post="([^"]+)"[\s\S]*?class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>[\s\S]*?datetime="([^"]+)"[\s\S]*?<span class="tgme_widget_message_views">([^<]*)<\/span>/g

  let match
  while ((match = regex.exec(html)) !== null) {
    const fullPostId = match[1]
    const textContent = match[2]
    const dateStr = match[3]
    const views = match[4]

    const postNumber = fullPostId.split('/')[1] || fullPostId

    const postSection = html.substring(
      Math.max(0, match.index - 2000),
      match.index + match[0].length
    )
    const imageMatch = postSection.match(/background-image:url\('([^']+)'\)/)
    const image = imageMatch ? imageMatch[1] : null

    const description = textContent
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#33;/g, '!')
      .replace(/&#036;/g, '$')
      .trim()

    if (description) {
      posts.push({
        id: postNumber,
        description,
        link: `https://t.me/${fullPostId}`,
        date: dateStr,
        image,
        views,
      })
    }
  }

  return posts.reverse()
}
