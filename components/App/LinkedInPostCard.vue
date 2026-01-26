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
            name="lucide:linkedin"
            class="w-4 h-4 text-blue-600 dark:text-blue-400"
          />
          <time
            class="text-xs text-gray-400 dark:text-gray-500"
            :datetime="post.date"
          >
            {{ formatDate(post.date) }}
          </time>
        </div>
        <p
          v-if="post.text"
          class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3"
        >
          {{ post.text }}
        </p>
        <div v-if="hasEngagement" class="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
          <span v-if="post.likes !== null" class="flex items-center gap-1">
            <Icon name="lucide:heart" class="w-3 h-3" />
            {{ post.likes }}
          </span>
          <span v-if="post.comments !== null" class="flex items-center gap-1">
            <Icon name="lucide:message-circle" class="w-3 h-3" />
            {{ post.comments }}
          </span>
          <span v-if="post.shares !== null" class="flex items-center gap-1">
            <Icon name="lucide:share-2" class="w-3 h-3" />
            {{ post.shares }}
          </span>
        </div>
      </div>
      <div v-if="post.image" class="flex-shrink-0">
        <img
          :src="post.image"
          alt="LinkedIn post image"
          class="w-20 h-20 object-cover rounded-lg"
          loading="lazy"
        />
      </div>
    </div>
  </a>
</template>

<script setup>
const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
});

const hasEngagement = computed(() => {
  return props.post.likes !== null || props.post.comments !== null || props.post.shares !== null;
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
