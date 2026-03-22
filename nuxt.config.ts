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
  },

  // Performance: Compress public assets
  nitro: {
    compressPublicAssets: true,
  },

  // Performance: Extract payload for smaller client bundles
  experimental: {
    payloadExtraction: 'deep',
  },

  // Performance: Optimize bundle splitting
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'nuxt-ui': ['@nuxt/ui'],
            'vue': ['vue', '@vue/runtime-core', '@vue/runtime-dom'],
          },
        },
      },
    },
  },

  // Image optimization settings
  image: {
    quality: 80,
    format: ['webp', 'avif', 'jpeg'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },
});
