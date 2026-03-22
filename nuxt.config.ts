export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    "@nuxt/ui",
    "nuxt-icon",
    "@nuxtjs/google-fonts",
    "@nuxtjs/fontaine",
    "@nuxt/image",
    "@nuxt/content",
    "@nuxthq/studio",
    "@vueuse/nuxt"
  ],
  ui: {
    icons: ["heroicons", "lucide"],
  },
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      htmlAttrs: {
        lang: "en",
        class: "h-full",
      },
      bodyAttrs: {
        class: "antialiased bg-gray-50 dark:bg-black min-h-screen",
      },
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      ],
    },
  },
  content: {
    highlight: {
      theme: "github-dark",
    },
  },
  googleFonts: {
    display: "swap",
    families: {
      Inter: [400, 500, 600, 700, 800, 900],
    },
  },

  // Performance: Enable ISR for static content
  routeRules: {
    '/': { isr: 3600 }, // Cache homepage for 1 hour
    '/articles/**': { isr: 86400 }, // Cache articles for 24 hours
    '/projects': { isr: 3600 },
    '/projects/**': { isr: 86400 },
    '/lab': { isr: 3600 },
    '/whats-in-my-bag': { isr: 86400 },
    '/bookmarks': { isr: 86400 },
    '/feed': { isr: 1800 },
    '/sitemap.xml': { redirect: '/api/sitemap.xml' },
  },

  // Performance: Compress public assets
  nitro: {
    compressPublicAssets: true,
  },

  // Performance: Extract payload for smaller client bundles
  experimental: {
    payloadExtraction: 'deep',
  },

  // Telegram channel config
  runtimeConfig: {
    telegramChannel: 'elzodxon',
    youtubeChannelId: 'UCJVDJ7H48SHV0nVirSHs8MQ',
  },
});
