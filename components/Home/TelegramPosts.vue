<template>
  <div v-if="posts?.length">
    <h2 class="uppercase text-xs font-semibold text-gray-400 mb-4">
      TELEGRAM CHANNEL
    </h2>
    <div class="space-y-3">
      <div
        v-for="post in posts"
        :key="post.id"
        class="p-3 rounded-lg ring-1 ring-gray-200 dark:ring-white/10 bg-white/80 dark:bg-gray-900/50"
      >
        <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
          {{ post.description }}
        </p>
        <div v-if="post.image && !post.image.includes('emoji')" class="mt-2">
          <img
            :src="post.image.startsWith('//') ? 'https:' + post.image : post.image"
            :alt="'Post ' + post.id"
            class="rounded-md max-h-48 object-cover w-full"
            loading="lazy"
          />
        </div>
        <div class="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
          <span>{{ formatDate(post.date) }}</span>
          <span>&middot;</span>
          <span class="flex items-center gap-1">
            <Icon name="heroicons:eye-20-solid" class="w-3.5 h-3.5" />
            {{ post.views }}
          </span>
          <a
            :href="post.link"
            target="_blank"
            rel="noopener"
            class="ml-auto text-gray-400 hover:text-primary-500 transition"
          >
            <Icon name="mdi:telegram" class="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
    <div class="flex items-center justify-center mt-4 text-sm">
      <UButton
        label="More on Telegram &rarr;"
        to="https://t.me/elzodxon"
        target="_blank"
        variant="link"
        color="gray"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
const { data } = await useFetch('/api/telegram/posts', {
  query: { limit: 8 },
})

const posts = computed(() => data.value?.posts || [])

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>
