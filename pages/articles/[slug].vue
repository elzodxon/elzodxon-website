<template>
  <main>
    <article v-if="doc">
      <!-- Article header -->
      <header class="mb-8">
        <div class="flex items-center gap-2 mb-3">
          <time class="text-xs text-gray-400 dark:text-gray-500">
            {{ formatDate(doc.date) }}
          </time>
          <span class="text-xs text-gray-300 dark:text-gray-600">&middot;</span>
          <span class="text-xs text-gray-400 dark:text-gray-500">{{ readingTime }}</span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {{ doc.title }}
        </h1>
        <p v-if="doc.description" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {{ doc.description }}
        </p>
      </header>

      <!-- Article body -->
      <div class="prose dark:prose-invert prose-sm prose-gray max-w-none
        prose-headings:font-semibold prose-headings:tracking-tight
        prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline
        prose-blockquote:not-italic prose-blockquote:border-primary-500
        prose-pre:bg-gray-900 prose-pre:rounded-lg
        prose-img:rounded-lg
        prose-code:text-primary-600 dark:prose-code:text-primary-400 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none">
        <ContentRenderer :value="doc" />
      </div>

      <!-- Footer -->
      <div class="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <UButton label="&larr; All Articles" to="/articles" variant="link" color="gray" />
        <a
          :href="`https://t.me/share/url?url=https://elzodxon.uz${doc._path}&text=${encodeURIComponent(doc.title)}`"
          target="_blank"
          rel="noopener"
          class="text-xs text-gray-400 hover:text-primary-500 transition flex items-center gap-1.5"
        >
          <Icon name="mdi:telegram" class="w-4 h-4" />
          Share
        </a>
      </div>
    </article>
  </main>
</template>

<script setup>
const route = useRoute();
const { slug } = route.params;

const { data: doc } = await useAsyncData(`article-${slug}`, () =>
  queryContent(`/articles/${slug}`).findOne()
);

const readingTime = computed(() => {
  if (!doc.value?.body) return '1 min read'
  const text = JSON.stringify(doc.value.body)
  const words = text.split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / 250))
  return `${minutes} min read`
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const title = computed(() => doc.value?.title ? `${doc.value.title} | Elzodxon Sharofaddinov` : 'Elzodxon Sharofaddinov');
const description = computed(() => doc.value?.description || '');

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: `https://elzodxon.uz/articles/${slug}`,
  ogImage: `https://elzodxon.uz/elzodxon-sharofaddinov.jpeg`,
  twitterCard: 'summary_large_image',
  articleAuthor: 'Elzodxon Sharofaddinov',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": doc.value?.title || '',
        "description": doc.value?.description || '',
        "datePublished": doc.value?.date || '',
        "author": {
          "@type": "Person",
          "name": "Elzodxon Sharofaddinov",
          "url": "https://elzodxon.uz"
        },
        "publisher": {
          "@type": "Person",
          "name": "Elzodxon Sharofaddinov"
        }
      }),
    },
  ],
})
</script>

<style>
.prose h2 a,
.prose h3 a {
  @apply no-underline;
}
</style>
