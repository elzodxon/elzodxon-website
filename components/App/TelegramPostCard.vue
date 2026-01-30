<template>
  <NuxtLink
    :to="`/telegram/${post.id}`"
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
      <div class="flex-shrink-0 w-20 h-20">
        <img
          v-if="props.post.image && !imageFailed"
          ref="cardImageRef"
          :src="props.post.image"
          :alt="post.title || 'Telegram post'"
          class="w-20 h-20 object-cover rounded-lg bg-gray-100 dark:bg-gray-800"
          loading="lazy"
          @error="onImageError"
        />
        <div
          v-else
          class="w-20 h-20 rounded-lg bg-primary-500 flex items-center justify-center"
        >
          <Icon name="lucide:send" class="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
});

// Image handling
const imageFailed = ref(false);
const cardImageRef = ref(null);

const onImageError = () => {
  imageFailed.value = true;
};

// Check image on mount (handles SSR hydration issues)
onMounted(() => {
  if (cardImageRef.value) {
    if (cardImageRef.value.complete && cardImageRef.value.naturalHeight === 0) {
      imageFailed.value = true;
    }
  }
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
