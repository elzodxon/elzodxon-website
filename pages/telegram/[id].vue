<template>
  <main class="min-h-screen">
    <!-- Loading state -->
    <div v-if="pending" class="animate-pulse">
      <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-500 dark:text-red-400 mb-4">
        {{ error.message || "Failed to load post" }}
      </p>
      <NuxtLink to="/telegram">
        <UButton color="primary" variant="soft">
          Back to Posts
        </UButton>
      </NuxtLink>
    </div>

    <!-- Post content -->
    <article v-else-if="post" class="max-w-2xl mx-auto">
      <!-- Back link -->
      <NuxtLink
        to="/telegram"
        class="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-8"
      >
        <Icon name="lucide:arrow-left" class="w-4 h-4" />
        Back to all posts
      </NuxtLink>

      <!-- Post header -->
      <header class="mb-8">
        <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Icon name="lucide:send" class="w-4 h-4" />
          <time :datetime="post.date">
            {{ formatDate(post.date) }}
          </time>
          <span v-if="post.views">· {{ post.views }} views</span>
        </div>
      </header>

      <!-- Post image -->
      <div v-if="post.image" class="mb-8">
        <img
          :src="post.image"
          :alt="'Post image'"
          class="w-full rounded-lg shadow-lg"
          loading="lazy"
        />
      </div>

      <!-- Post content -->
      <div class="prose dark:prose-invert max-w-none">
        <p class="text-lg leading-relaxed whitespace-pre-wrap">{{ post.description }}</p>
      </div>

      <!-- Original link -->
      <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
        <a
          :href="post.link"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
        >
          <Icon name="lucide:external-link" class="w-4 h-4" />
          View original on Telegram
        </a>
      </div>

      <!-- Navigation -->
      <nav
        v-if="navigation"
        class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800"
      >
        <div class="grid grid-cols-2 gap-4">
          <!-- Previous post -->
          <div v-if="navigation.prev">
            <NuxtLink
              :to="`/telegram/${navigation.prev.id}`"
              class="group block p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
            >
              <span class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                ← Newer
              </span>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 line-clamp-2">
                {{ truncate(navigation.prev.description, 80) }}
              </span>
            </NuxtLink>
          </div>
          <div v-else></div>

          <!-- Next post -->
          <div v-if="navigation.next" class="text-right">
            <NuxtLink
              :to="`/telegram/${navigation.next.id}`"
              class="group block p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
            >
              <span class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                Older →
              </span>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 line-clamp-2">
                {{ truncate(navigation.next.description, 80) }}
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

// Fetch post
const { data, pending, error } = await useAsyncData(
  `telegram-post-${id}`,
  () => $fetch(`/api/telegram/posts/${id}`)
);

const post = computed(() => data.value?.post || null);
const navigation = computed(() => data.value?.navigation || null);

// SEO
useSeoMeta({
  title: computed(() =>
    post.value
      ? `${truncate(post.value.description, 60)} | Telegram`
      : "Telegram Post"
  ),
  description: computed(() =>
    post.value ? truncate(post.value.description, 160) : ""
  ),
  ogImage: computed(() => post.value?.image || undefined),
});

// Helpers
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const truncate = (text, length) => {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + "...";
};
</script>
