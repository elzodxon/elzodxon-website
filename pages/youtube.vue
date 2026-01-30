<template>
  <main class="min-h-screen">
    <AppHeader class="mb-8" title="YouTube Videos" :description="description" />

    <!-- Loading state -->
    <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="i in 4"
        :key="i"
        class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse"
      >
        <div class="aspect-video bg-gray-200 dark:bg-gray-700"></div>
        <div class="p-4">
          <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-500 dark:text-red-400 mb-4">
        {{ error.message || "Failed to load videos" }}
      </p>
      <UButton color="primary" variant="soft" @click="refresh">
        Try Again
      </UButton>
    </div>

    <!-- Videos grid -->
    <div v-else-if="videos && videos.length > 0">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AppYouTubeVideoCard
          v-for="video in videos"
          :key="video.id"
          :video="video"
        />
      </div>

      <!-- Subscribe CTA -->
      <div class="mt-12 text-center p-8 rounded-2xl bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20">
        <Icon name="lucide:youtube" class="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Subscribe to my channel
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Stay updated with my latest videos and content
        </p>
        <a
          href="https://youtube.com/@elzodxon?sub_confirmation=1"
          target="_blank"
          rel="noopener noreferrer"
        >
          <UButton color="red" size="lg">
            <Icon name="lucide:youtube" class="w-5 h-5 mr-2" />
            Subscribe on YouTube
          </UButton>
        </a>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12">
      <Icon name="lucide:youtube" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400 mb-4">No videos yet.</p>
      <a
        href="https://youtube.com/@elzodxon"
        target="_blank"
        rel="noopener noreferrer"
      >
        <UButton color="red" variant="soft">
          Visit my YouTube channel
        </UButton>
      </a>
    </div>
  </main>
</template>

<script setup>
const description =
  "Watch my latest YouTube videos - tutorials, vlogs, and more.";

useSeoMeta({
  title: "YouTube Videos | Elzodxon Sharofaddinov",
  description,
});

// Fetch videos
const { data, pending, error, refresh } = await useAsyncData(
  "youtube-videos",
  () => $fetch("/api/youtube/videos")
);

const videos = computed(() => data.value?.videos || []);
</script>
