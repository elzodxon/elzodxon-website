<template>
  <main>
    <div v-if="post">
      <article>
        <!-- Video title -->
        <h1 v-if="post.title" class="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {{ post.title }}
        </h1>

        <!-- Post content -->
        <p class="whitespace-pre-line text-gray-800 dark:text-gray-200 leading-relaxed">
          {{ post.text }}
        </p>

        <!-- Media -->
        <div v-if="mediaUrl && !mediaUrl.includes('emoji')" class="mt-4">
          <img
            v-if="post.type !== 'video'"
            :src="mediaUrl"
            :alt="post.title || 'Post'"
            class="rounded-lg w-full"
            loading="lazy"
          />
          <a v-else :href="post.link" target="_blank" rel="noopener" class="block relative group">
            <img :src="mediaUrl" :alt="post.title || 'Video'" class="rounded-lg w-full" loading="lazy" />
            <div class="absolute inset-0 flex items-center justify-center">
              <Icon name="heroicons:play-circle-20-solid" class="w-14 h-14 text-white drop-shadow-lg opacity-90 group-hover:opacity-100 transition" />
            </div>
          </a>
        </div>

        <!-- Meta -->
        <div class="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
          <span>{{ formatDate(post.date) }}</span>
          <template v-if="engagementValue">
            <span>&middot;</span>
            <span class="flex items-center gap-1">
              <Icon :name="post.platform === 'telegram' ? 'heroicons:eye-20-solid' : 'heroicons:heart-20-solid'" class="w-4 h-4" />
              {{ engagementValue }}
            </span>
          </template>
          <a :href="post.link" target="_blank" rel="noopener" class="ml-auto flex items-center gap-1.5 text-gray-400 hover:text-primary-500 transition">
            <Icon :name="platformIcon" class="w-4 h-4" />
            <span class="text-xs">View original</span>
          </a>
        </div>
      </article>

      <div class="mt-8">
        <UButton label="&larr; Back to Feed" to="/feed" variant="link" color="gray" />
      </div>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <p class="text-sm text-gray-400">Post not found.</p>
      <UButton label="Back to Feed" to="/feed" variant="link" color="gray" class="mt-4" />
    </div>
  </main>
</template>

<script lang="ts" setup>
const route = useRoute()
const postId = route.params.id as string

const { data: post, error } = await useFetch(`/api/feed/${postId}`)

const mediaUrl = computed(() => {
  const m = post.value?.media
  if (!m) return null
  const url = typeof m === 'string' ? m : m.url
  if (!url) return null
  return url.startsWith('//') ? 'https:' + url : url
})

const engagementValue = computed(() => {
  const e = post.value?.engagement
  if (!e) return null
  if (e.views) return String(e.views)
  if (e.likes) return String(e.likes)
  return null
})

const platformIcon = computed(() => {
  const map: Record<string, string> = { telegram: 'mdi:telegram', linkedin: 'mdi:linkedin', youtube: 'mdi:youtube' }
  return map[post.value?.platform] || 'mdi:link'
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

const postTitle = computed(() => {
  if (!post.value) return 'Post | Elzodxon'
  if (post.value.title) return `${post.value.title} | Elzodxon`
  const text = post.value.text || ''
  return `${text.substring(0, 60).trim()}... | Elzodxon`
})

const postDescription = computed(() => {
  if (!post.value) return ''
  return (post.value.text || '').substring(0, 160)
})

useSeoMeta({
  title: postTitle,
  description: postDescription,
  ogTitle: postTitle,
  ogDescription: postDescription,
})
</script>
