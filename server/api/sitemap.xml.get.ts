import { promises as fs } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'server/data')
const BASE_URL = 'https://elzodxon.uz'

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
  setResponseHeader(event, 'content-type', 'application/xml')

  // Static pages
  const staticPages = [
    { url: '/', changefreq: 'weekly', priority: '1.0' },
    { url: '/feed', changefreq: 'daily', priority: '0.9' },
    { url: '/cv', changefreq: 'monthly', priority: '0.8' },
    { url: '/articles', changefreq: 'weekly', priority: '0.8' },
    { url: '/books', changefreq: 'monthly', priority: '0.6' },
    { url: '/lab', changefreq: 'monthly', priority: '0.5' },
    { url: '/whats-in-my-bag', changefreq: 'monthly', priority: '0.5' },
    { url: '/bookmarks', changefreq: 'monthly', priority: '0.5' },
  ]

  // Dynamic feed posts
  const [telegramPosts, youtubePosts] = await Promise.all([
    readJsonFile<any>('telegram-posts.json'),
    readJsonFile<any>('youtube-posts.json'),
  ])

  const feedUrls: { url: string; lastmod: string; changefreq: string; priority: string }[] = []

  for (const post of telegramPosts) {
    const slug = generateSlug(post.description || '', post.id, 'telegram')
    feedUrls.push({
      url: `/feed/${slug}`,
      lastmod: post.date ? new Date(post.date).toISOString().split('T')[0] : '',
      changefreq: 'monthly',
      priority: '0.4',
    })
  }

  for (const post of youtubePosts) {
    const slug = generateSlug(post.title || post.description || '', post.id, 'youtube')
    feedUrls.push({
      url: `/feed/${slug}`,
      lastmod: post.date ? new Date(post.date).toISOString().split('T')[0] : '',
      changefreq: 'monthly',
      priority: '0.4',
    })
  }

  // Get article paths
  let articleUrls: { url: string; changefreq: string; priority: string }[] = []
  try {
    const articlesDir = join(process.cwd(), 'content/articles')
    const files = await fs.readdir(articlesDir)
    articleUrls = files
      .filter(f => f.endsWith('.md'))
      .map(f => ({
        url: `/articles/${f.replace(/\.md$/, '')}`,
        changefreq: 'monthly',
        priority: '0.7',
      }))
  } catch {}

  const allUrls = [
    ...staticPages.map(p => `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`),
    ...articleUrls.map(p => `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`),
    ...feedUrls.map(p => `  <url>
    <loc>${BASE_URL}${p.url}</loc>${p.lastmod ? `\n    <lastmod>${p.lastmod}</lastmod>` : ''}
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`),
  ]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.join('\n')}
</urlset>`
})
