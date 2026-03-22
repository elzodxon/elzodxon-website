import { promises as fs } from 'fs'
import { join } from 'path'

const DATA_FILE = join(process.cwd(), 'server/data/linkedin-posts.json')

interface LinkedInPost {
  id: string
  text: string
  link: string
  date: string
  likes?: number
  comments?: number
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10))
  const startDate = query.startDate ? new Date(query.startDate as string) : null
  const endDate = query.endDate ? new Date(query.endDate as string) : null
  const search = (query.search as string)?.toLowerCase() || ''

  try {
    let posts: LinkedInPost[] = []

    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8')
      posts = JSON.parse(data)
    } catch {
      // No data file yet — return empty
      return {
        posts: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
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
        post.text.toLowerCase().includes(search)
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
      statusMessage: `Failed to fetch LinkedIn posts: ${error.message}`,
    })
  }
})
