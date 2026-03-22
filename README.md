# elzodxon.uz

Personal website and social feed aggregator for Elzodxon Sharofaddinov.

Built with [Nuxt 3](https://nuxt.com), [Tailwind CSS](https://tailwindcss.com), and [@nuxt/ui](https://ui.nuxt.com).

## Features

- **Homepage** — Bio, social links, and introduction
- **Feed** — Unified social feed aggregating Telegram, LinkedIn, and YouTube posts with platform filters and SEO-friendly single post pages
- **Articles** — Long-form writing powered by Nuxt Content (Markdown)
- **CV** — Professional experience, education, volunteering, and skills
- **Books** — Reading list with progress tracking and status filters
- **Experiments** — Lab for side projects and experiments
- **SEO** — JSON-LD structured data, Open Graph meta, dynamic sitemap, robots.txt

## Tech Stack

- **Framework:** Nuxt 3 (SSR + ISR)
- **Styling:** Tailwind CSS + @nuxt/ui
- **Content:** @nuxt/content (Markdown/MDC)
- **Icons:** nuxt-icon (Solar, Heroicons, MDI)
- **Fonts:** Inter (Google Fonts)
- **Deployment:** PM2 + Nginx

## Social Feed Parsers

| Platform | Method | Posts |
|----------|--------|-------|
| Telegram | HTML scraper with pagination (`t.me/s/`) | ~400 posts |
| YouTube | RSS feed parser (`youtube.com/feeds/videos.xml`) | 15 latest videos |
| LinkedIn | Manual JSON (`server/data/linkedin-posts.json`) | Manual entry |

Posts are cached in `server/data/` with auto-refresh (30min for Telegram, 1hr for YouTube).

## Setup

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

```bash
# Build
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Or directly
node .output/server/index.mjs
```

## Environment

Configure in `nuxt.config.ts` under `runtimeConfig`:

- `telegramChannel` — Telegram channel username (default: `elzodxon`)
- `youtubeChannelId` — YouTube channel ID

## Project Structure

```
pages/
  index.vue          # Homepage
  feed/
    index.vue        # Social feed with filters
    [id].vue         # Single post page
  articles/
    index.vue        # Article listing
    [slug].vue       # Article detail
  cv.vue             # CV/Resume
  books.vue          # Reading list
  lab.vue            # Experiments
  bookmarks.vue      # Bookmarks
  whats-in-my-bag.vue

server/
  api/
    feed/            # Unified feed + single post API
    telegram/        # Telegram scraper
    youtube/         # YouTube RSS parser
    linkedin/        # LinkedIn posts API
    sitemap.xml.ts   # Dynamic sitemap
  data/              # Cached JSON files

content/
  articles/          # Markdown articles
```

## License

All rights reserved. (c) 2020-2026 Elzodxon Sharofaddinov.
