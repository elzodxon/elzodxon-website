<template>
  <div class="p-3 rounded-lg ring-1 ring-gray-200 dark:ring-white/10 bg-white/80 dark:bg-gray-900/50 hover:ring-gray-300 dark:hover:ring-white/20 transition-all cursor-pointer" @click="navigateToPost">
    <!-- Video type -->
    <template v-if="post.type === 'video'">
      <div class="relative group">
        <img
          v-if="mediaUrl"
          :src="mediaUrl"
          :alt="post.title || 'Video thumbnail'"
          class="rounded-md w-full"
          loading="lazy"
        />
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Icon
            name="heroicons:play-circle-20-solid"
            class="w-10 h-10 text-white drop-shadow-lg opacity-90 group-hover:opacity-100 transition"
          />
        </div>
      </div>
      <p v-if="post.title" class="mt-2 text-sm font-medium text-gray-800 dark:text-gray-100">
        {{ post.title }}
      </p>
      <p v-if="post.text" class="mt-1 whitespace-pre-line text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
        {{ post.text }}
      </p>
    </template>

    <!-- Image type -->
    <template v-else-if="post.type === 'image'">
      <div v-if="mediaUrl && !mediaUrl.includes('emoji')" class="mb-2">
        <img
          :src="mediaUrl"
          :alt="post.title || 'Post ' + post.id"
          class="rounded-md w-full"
          loading="lazy"
        />
      </div>
      <p v-if="post.text" class="whitespace-pre-line text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
        {{ post.text }}
      </p>
    </template>

    <!-- Text type -->
    <template v-else>
      <p class="whitespace-pre-line text-sm text-gray-700 dark:text-gray-300 line-clamp-4">
        {{ post.text }}
      </p>
    </template>

    <!-- Footer (all cards) -->
    <div class="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
      <span>{{ relativeDate(post.date) }}</span>
      <template v-if="engagementValue">
        <span>&middot;</span>
        <span class="flex items-center gap-1">
          <Icon :name="engagementIcon" class="w-3.5 h-3.5" />
          {{ engagementValue }}
        </span>
      </template>
      <span
        class="ml-auto transition"
        :class="platformLinkClass"
      >
        <Icon :name="platformIcon" class="w-3.5 h-3.5" />
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
const router = useRouter()

const props = defineProps<{
  post: any
}>()

function navigateToPost() {
  router.push(`/feed/${props.post.slug || props.post.id}`)
}

const mediaUrl = computed(() => {
  const m = props.post.media
  if (!m) return null
  const url = typeof m === 'string' ? m : m.url
  if (!url) return null
  return url.startsWith('//') ? 'https:' + url : url
})

const engagementValue = computed(() => {
  const e = props.post.engagement
  if (!e) return null
  if (typeof e === 'number') return formatNumber(e)
  if (e.views) return String(e.views)
  if (e.likes) return formatNumber(e.likes)
  return null
})

function relativeDate(dateStr: string) {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)

  if (diffMin < 60) return `${diffMin}m ago`
  if (diffH < 24) return `${diffH}h ago`
  if (diffD < 7) return `${diffD}d ago`

  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

const engagementIcon = computed(() => {
  if (props.post.platform === 'telegram') return 'heroicons:eye-20-solid'
  return 'heroicons:heart-20-solid'
})

const platformIcon = computed(() => {
  const map: Record<string, string> = {
    telegram: 'mdi:telegram',
    linkedin: 'mdi:linkedin',
    youtube: 'mdi:youtube',
  }
  return map[props.post.platform] || 'mdi:link'
})

const platformLinkClass = computed(() => {
  const map: Record<string, string> = {
    telegram: 'text-gray-400 hover:text-sky-500',
    linkedin: 'text-gray-400 hover:text-[#0A66C2]',
    youtube: 'text-gray-400 hover:text-red-500',
  }
  return map[props.post.platform] || 'text-gray-400 hover:text-primary-500'
})
</script>
