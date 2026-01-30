<template>
  <main class="min-h-screen">
    <!-- Loading state -->
    <div v-if="pending" class="animate-pulse">
      <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
      <div class="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-500 dark:text-red-400 mb-4">
        {{ error.message || "Failed to load talk" }}
      </p>
      <NuxtLink to="/talks">
        <UButton color="primary" variant="soft">
          Back to Talks
        </UButton>
      </NuxtLink>
    </div>

    <!-- Talk content -->
    <article v-else-if="talk" class="max-w-3xl mx-auto">
      <!-- Back link -->
      <NuxtLink
        to="/talks"
        class="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-8"
      >
        <Icon name="lucide:arrow-left" class="w-4 h-4" />
        Back to all talks
      </NuxtLink>

      <!-- Talk header -->
      <header class="mb-6">
        <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Icon :name="typeIcon" class="w-4 h-4" :class="typeIconClass" />
          <span
            class="px-2 py-0.5 rounded text-xs font-medium"
            :class="typeBadgeClass"
          >
            {{ typeBadgeText }}
          </span>
          <time :datetime="talk.date">
            {{ formatDate(talk.date) }}
          </time>
        </div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {{ talk.title }}
        </h1>
      </header>

      <!-- Media content -->
      <div class="mb-8">
        <!-- YouTube embed -->
        <div v-if="talk.type === 'youtube' && talk.videoId" class="relative w-full rounded-xl overflow-hidden bg-black" style="padding-bottom: 56.25%;">
          <iframe
            :src="`https://www.youtube.com/embed/${talk.videoId}`"
            class="absolute top-0 left-0 w-full h-full"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>

        <!-- Instagram embed placeholder / Image -->
        <div v-else-if="talk.type === 'instagram'" class="rounded-xl overflow-hidden">
          <img
            v-if="talk.image"
            :src="talk.image"
            :alt="talk.title"
            class="w-full h-auto rounded-xl"
          />
          <div v-else class="aspect-square bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
            <Icon name="lucide:instagram" class="w-24 h-24 text-white" />
          </div>
        </div>

        <!-- Image -->
        <div v-else-if="talk.type === 'image' && talk.image" class="rounded-xl overflow-hidden">
          <img
            :src="talk.image"
            :alt="talk.title"
            class="w-full h-auto rounded-xl"
          />
        </div>
      </div>

      <!-- Description -->
      <div class="prose dark:prose-invert max-w-none mb-8">
        <p class="text-lg leading-relaxed whitespace-pre-wrap">{{ talk.description }}</p>
      </div>

      <!-- External links -->
      <div class="pt-8 border-t border-gray-200 dark:border-gray-800 space-y-3">
        <a
          v-if="talk.type === 'youtube' && talk.videoId"
          :href="`https://www.youtube.com/watch?v=${talk.videoId}`"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
        >
          <Icon name="lucide:youtube" class="w-4 h-4" />
          Watch on YouTube
        </a>
        <a
          v-if="talk.type === 'instagram' && talk.instagramUrl"
          :href="talk.instagramUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400"
        >
          <Icon name="lucide:instagram" class="w-4 h-4" />
          View on Instagram
        </a>
      </div>

      <!-- Navigation -->
      <nav
        v-if="navigation"
        class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800"
      >
        <div class="grid grid-cols-2 gap-4">
          <!-- Previous talk -->
          <div v-if="navigation.prev">
            <NuxtLink
              :to="`/talks/${navigation.prev.id}`"
              class="group block p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
            >
              <span class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                ← Newer
              </span>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 line-clamp-2">
                {{ navigation.prev.title }}
              </span>
            </NuxtLink>
          </div>
          <div v-else></div>

          <!-- Next talk -->
          <div v-if="navigation.next" class="text-right">
            <NuxtLink
              :to="`/talks/${navigation.next.id}`"
              class="group block p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
            >
              <span class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                Older →
              </span>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 line-clamp-2">
                {{ navigation.next.title }}
              </span>
            </NuxtLink>
          </div>
        </div>
      </nav>
    </article>
  </main>
</template>

<script setup>
const route = useRoute();
const { id } = route.params;

// Fetch talk
const { data, pending, error } = await useAsyncData(
  `talk-${id}`,
  () => $fetch(`/api/talks/${id}`)
);

const talk = computed(() => data.value?.talk || null);
const navigation = computed(() => data.value?.navigation || null);

// Type helpers
const typeIcon = computed(() => {
  switch (talk.value?.type) {
    case 'youtube': return 'lucide:youtube';
    case 'instagram': return 'lucide:instagram';
    default: return 'lucide:image';
  }
});

const typeIconClass = computed(() => {
  switch (talk.value?.type) {
    case 'youtube': return 'text-red-500';
    case 'instagram': return 'text-pink-500';
    default: return 'text-gray-500';
  }
});

const typeBadgeClass = computed(() => {
  switch (talk.value?.type) {
    case 'youtube': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    case 'instagram': return 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400';
    default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
});

const typeBadgeText = computed(() => {
  switch (talk.value?.type) {
    case 'youtube': return 'YouTube';
    case 'instagram': return 'Instagram';
    default: return 'Photo';
  }
});

// SEO
useSeoMeta({
  title: computed(() =>
    talk.value ? `${talk.value.title} | Talks` : "Talk"
  ),
  description: computed(() =>
    talk.value ? talk.value.description?.substring(0, 160) : ""
  ),
  ogImage: computed(() => {
    if (talk.value?.type === 'youtube' && talk.value?.videoId) {
      return `https://i.ytimg.com/vi/${talk.value.videoId}/maxresdefault.jpg`;
    }
    return talk.value?.image || undefined;
  }),
});

// Helpers
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
</script>
