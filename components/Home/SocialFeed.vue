<template>
  <div v-if="posts?.length">
    <h2 class="uppercase text-xs font-semibold text-gray-400 mb-4">
      LATEST UPDATES
    </h2>
    <div class="space-y-3">
      <FeedFeedCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
      />
    </div>
    <div class="flex items-center justify-center mt-4 text-sm">
      <UButton
        label="All Updates &rarr;"
        to="/feed"
        variant="link"
        color="gray"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
const { data } = await useFetch('/api/feed', {
  query: { limit: 6 },
})

const posts = computed(() => data.value?.posts || [])
</script>
