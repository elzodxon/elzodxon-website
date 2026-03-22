<template>
  <main>
    <AppHeader class="mb-8" title="Feed" :description="description" />

    <!-- Filter pills -->
    <div class="flex items-center gap-2 mb-6 flex-wrap">
      <button
        v-for="filter in filters"
        :key="filter.value"
        class="px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer"
        :class="
          selected === filter.value
            ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
        "
        @click="selectFilter(filter.value)"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Feed list -->
    <div class="space-y-3">
      <AppFeedCard
        v-for="post in allPosts"
        :key="post.id"
        :post="post"
      />
    </div>

    <!-- Empty state -->
    <p
      v-if="allPosts.length === 0 && !pending"
      class="text-sm text-gray-400 dark:text-gray-500 text-center py-12"
    >
      No posts yet.
    </p>

    <!-- Load more -->
    <div v-if="hasMore" class="flex items-center justify-center mt-6">
      <UButton
        label="Load more"
        variant="soft"
        color="gray"
        :loading="loadingMore"
        @click="loadMore"
      />
    </div>
  </main>
</template>

<script lang="ts" setup>
const description = 'Everything I share across platforms.'
useSeoMeta({
  title: 'Feed | Elzodxon Sharofaddinov',
  description,
  ogTitle: 'Feed | Elzodxon Sharofaddinov',
  ogDescription: description,
})

const filters = [
  { label: 'All', value: '' },
  { label: 'Telegram', value: 'telegram' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'YouTube', value: 'youtube' },
]

const selected = ref('')
const currentPage = ref(1)
const limit = 12
const loadingMore = ref(false)
const allPosts = ref<any[]>([])
const hasMore = ref(false)

const { data, pending } = await useFetch('/api/feed', {
  query: { limit, page: 1 },
})

allPosts.value = data.value?.posts || []
hasMore.value = data.value?.pagination?.hasNextPage || false

async function selectFilter(value: string) {
  selected.value = value
  currentPage.value = 1
  const res = await $fetch<any>('/api/feed', {
    query: { limit, page: 1, platform: value || undefined },
  })
  allPosts.value = res.posts || []
  hasMore.value = res.pagination?.hasNextPage || false
}

async function loadMore() {
  loadingMore.value = true
  currentPage.value++
  const res = await $fetch<any>('/api/feed', {
    query: { limit, page: currentPage.value, platform: selected.value || undefined },
  })
  allPosts.value = [...allPosts.value, ...(res.posts || [])]
  hasMore.value = res.pagination?.hasNextPage || false
  loadingMore.value = false
}
</script>
