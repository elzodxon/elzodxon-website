<template>
  <div>
    <h2 class="uppercase text-xs font-semibold text-gray-400 mb-6">
      RECENT TELEGRAM POSTS
    </h2>
    <div v-if="pending" class="space-y-4">
      <div
        v-for="i in 3"
        :key="i"
        class="p-4 rounded-lg border border-gray-200 dark:border-gray-800 animate-pulse"
      >
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    </div>
    <div v-else-if="posts && posts.length > 0" class="space-y-4">
      <AppTelegramPostCard
        v-for="post in posts.slice(0, 3)"
        :key="post.id || post.link"
        :post="post"
      />
      <div class="flex items-center justify-center mt-6 text-sm">
        <UButton
          label="All Telegram Posts &rarr;"
          to="/telegram"
          variant="link"
          color="gray"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const { data, pending } = await useAsyncData(
  "telegram-posts-home",
  () => $fetch("/api/telegram/posts", { query: { limit: 3 } }),
  {
    // Don't throw error on homepage, just show nothing
    onError: () => {},
  }
);

const posts = computed(() => data.value?.posts || []);
</script>
