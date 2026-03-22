<template>
  <NuxtLink :to="article._path" class="group block p-4 -mx-4 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
    <article>
      <div class="flex items-center gap-2 mb-1.5">
        <time class="text-xs text-gray-400 dark:text-gray-500">
          {{ formatDate(article.date) }}
        </time>
        <span class="text-xs text-gray-300 dark:text-gray-600">&middot;</span>
        <span class="text-xs text-gray-400 dark:text-gray-500">{{ readingTime(article) }}</span>
      </div>
      <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {{ article.title }}
      </h2>
      <p v-if="article.description" class="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
        {{ article.description }}
      </p>
    </article>
  </NuxtLink>
</template>

<script setup>
defineProps({
  article: {
    type: Object,
    required: true,
  },
});

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function readingTime(article) {
  const words = (article.description || '').split(/\s+/).length + 200 // rough estimate
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min read`
}
</script>
