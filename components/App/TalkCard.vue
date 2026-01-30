<template>
  <NuxtLink
    :to="`/talks/${talk.id}`"
    class="group block p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
  >
    <div class="flex items-start gap-4">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-2">
          <Icon
            :name="typeIcon"
            class="w-4 h-4"
            :class="typeIconClass"
          />
          <span
            class="text-xs px-1.5 py-0.5 rounded"
            :class="typeBadgeClass"
          >
            {{ typeBadgeText }}
          </span>
          <time
            class="text-xs text-gray-400 dark:text-gray-500"
            :datetime="talk.date"
          >
            {{ formatDate(talk.date) }}
          </time>
        </div>
        <h3
          class="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary-600 mb-1"
        >
          {{ talk.title }}
        </h3>
        <p
          v-if="talk.description"
          class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3"
        >
          {{ talk.description }}
        </p>
      </div>
      <div class="flex-shrink-0 w-40 h-24">
        <img
          v-if="thumbnailUrl && !imageFailed"
          ref="cardImageRef"
          :src="thumbnailUrl"
          :alt="talk.title"
          class="w-40 h-24 object-cover rounded-lg bg-gray-100 dark:bg-gray-800"
          loading="lazy"
          @error="onImageError"
        />
        <div
          v-else
          class="w-40 h-24 rounded-lg flex items-center justify-center"
          :class="fallbackBgClass"
        >
          <Icon :name="typeIcon" class="w-10 h-10 text-white" />
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  talk: {
    type: Object,
    required: true,
  },
});

const imageFailed = ref(false);
const cardImageRef = ref(null);

const thumbnailUrl = computed(() => {
  if (props.talk.type === 'youtube' && props.talk.thumbnail) {
    return props.talk.thumbnail;
  }
  if (props.talk.image) {
    return props.talk.image;
  }
  return null;
});

const typeIcon = computed(() => {
  switch (props.talk.type) {
    case 'youtube':
      return 'lucide:youtube';
    case 'instagram':
      return 'lucide:instagram';
    default:
      return 'lucide:image';
  }
});

const typeIconClass = computed(() => {
  switch (props.talk.type) {
    case 'youtube':
      return 'text-red-500';
    case 'instagram':
      return 'text-pink-500';
    default:
      return 'text-gray-400 dark:text-gray-500';
  }
});

const typeBadgeClass = computed(() => {
  switch (props.talk.type) {
    case 'youtube':
      return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    case 'instagram':
      return 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
});

const typeBadgeText = computed(() => {
  switch (props.talk.type) {
    case 'youtube':
      return 'YouTube';
    case 'instagram':
      return 'Instagram';
    default:
      return 'Photo';
  }
});

const fallbackBgClass = computed(() => {
  switch (props.talk.type) {
    case 'youtube':
      return 'bg-red-500';
    case 'instagram':
      return 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500';
    default:
      return 'bg-primary-500';
  }
});

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
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
</script>
