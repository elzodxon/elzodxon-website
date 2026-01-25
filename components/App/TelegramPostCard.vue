<template>
  <a
    :href="post.link"
    target="_blank"
    rel="noopener noreferrer"
    class="group block p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
  >
    <div class="flex items-start gap-4">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-2">
          <Icon
            name="lucide:send"
            class="w-4 h-4 text-gray-400 dark:text-gray-500"
          />
          <time
            class="text-xs text-gray-400 dark:text-gray-500"
            :datetime="post.date"
          >
            {{ formatDate(post.date) }}
          </time>
          <span v-if="post.views" class="text-xs text-gray-400 dark:text-gray-500">
            · {{ post.views }} views
          </span>
        </div>
        <h3
          v-if="post.title"
          class="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary-600 mb-1"
        >
          {{ post.title }}
        </h3>
        <p
          v-if="post.description"
          class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3"
        >
          {{ post.description }}
        </p>
      </div>
      <div v-if="post.image" class="flex-shrink-0">
        <img
          :src="post.image"
          :alt="post.title || 'Telegram post image'"
          class="w-20 h-20 object-cover rounded-lg"
          loading="lazy"
        />
      </div>
    </div>
  </a>
</template>

<script setup>
defineProps({
  post: {
    type: Object,
    required: true,
  },
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  // Show time only (e.g., "14:30")
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};
</script>
