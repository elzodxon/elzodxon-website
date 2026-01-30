<template>
  <div
    class="group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all hover:shadow-lg"
  >
    <!-- Thumbnail with play button -->
    <div class="relative aspect-video bg-gray-100 dark:bg-gray-900 cursor-pointer" @click="openVideo">
      <img
        :src="video.thumbnail"
        :alt="video.title"
        class="w-full h-full object-cover"
        loading="lazy"
      />
      <!-- Play button overlay -->
      <div class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
        <div class="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <Icon name="lucide:play" class="w-8 h-8 text-white ml-1" />
        </div>
      </div>
      <!-- Duration badge -->
      <span
        v-if="video.duration"
        class="absolute bottom-2 right-2 px-2 py-0.5 text-xs font-medium bg-black/80 text-white rounded"
      >
        {{ video.duration }}
      </span>
    </div>

    <!-- Video info -->
    <div class="p-4">
      <h3
        class="font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors cursor-pointer"
        @click="openVideo"
      >
        {{ video.title }}
      </h3>
      <p
        v-if="video.description"
        class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3"
      >
        {{ video.description }}
      </p>
      <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span v-if="video.views" class="flex items-center gap-1">
          <Icon name="lucide:eye" class="w-3.5 h-3.5" />
          {{ video.views }} views
        </span>
        <span class="flex items-center gap-1">
          <Icon name="lucide:calendar" class="w-3.5 h-3.5" />
          {{ formatDate(video.publishedAt) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  video: {
    type: Object,
    required: true,
  },
});

const openVideo = () => {
  window.open(`https://www.youtube.com/watch?v=${props.video.videoId}`, '_blank');
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
</script>
