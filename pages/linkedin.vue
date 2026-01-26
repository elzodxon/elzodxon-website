<template>
  <main class="min-h-screen">
    <AppHeader class="mb-8" title="LinkedIn Posts" :description="description" />

    <!-- Loading state -->
    <div v-if="pending" class="space-y-4">
      <div
        v-for="i in 5"
        :key="i"
        class="p-4 rounded-lg border border-gray-200 dark:border-gray-800 animate-pulse"
      >
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-500 dark:text-red-400 mb-4">
        {{ error.message || "Failed to load LinkedIn posts" }}
      </p>
      <UButton color="primary" variant="soft" @click="refresh">
        Try Again
      </UButton>
    </div>

    <!-- Posts grouped by date -->
    <div v-else-if="posts && posts.length > 0">
      <div class="space-y-8 mb-8">
        <div v-for="(group, dateKey) in groupedPosts" :key="dateKey">
          <!-- Date Header -->
          <h2
            class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 sticky top-16 bg-gray-50 dark:bg-black py-2 z-10"
          >
            {{ formatDateHeader(dateKey) }}
          </h2>
          <!-- Posts for this date -->
          <div class="space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-800">
            <AppLinkedInPostCard
              v-for="post in group"
              :key="post.id || post.link"
              :post="post"
            />
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination && pagination.totalPages > 1"
        class="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-6"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of
          {{ pagination.total }} posts
        </p>
        <div class="flex items-center gap-2">
          <UButton
            color="gray"
            variant="ghost"
            :disabled="!pagination.hasPrevPage"
            @click="goToPage(pagination.page - 1)"
          >
            Previous
          </UButton>
          <div class="flex items-center gap-1">
            <UButton
              v-for="pageNum in visiblePages"
              :key="pageNum"
              :color="pageNum === pagination.page ? 'primary' : 'gray'"
              :variant="pageNum === pagination.page ? 'soft' : 'ghost'"
              size="sm"
              @click="goToPage(pageNum)"
            >
              {{ pageNum }}
            </UButton>
          </div>
          <UButton
            color="gray"
            variant="ghost"
            :disabled="!pagination.hasNextPage"
            @click="goToPage(pagination.page + 1)"
          >
            Next
          </UButton>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400 mb-4">No posts found.</p>
      <div class="flex justify-center gap-2">
        <UButton color="primary" variant="soft" @click="syncPosts(10)" :loading="syncing">
          Sync from LinkedIn
        </UButton>
        <UButton color="gray" variant="soft" @click="syncPosts(30)" :loading="syncing">
          Load more (30 posts)
        </UButton>
      </div>
    </div>

    <!-- Sync buttons (floating) -->
    <div class="fixed bottom-6 right-6 flex flex-col gap-2">
      <UTooltip text="Load more posts (30 posts)">
        <UButton
          color="gray"
          variant="solid"
          icon="i-heroicons-arrow-down"
          size="lg"
          :loading="syncing"
          @click="syncPosts(30)"
        />
      </UTooltip>
      <UTooltip text="Sync latest posts from LinkedIn">
        <UButton
          color="primary"
          variant="solid"
          icon="i-heroicons-arrow-path"
          size="lg"
          :loading="syncing"
          @click="syncPosts(10)"
        />
      </UTooltip>
    </div>
  </main>
</template>

<script setup>
const description =
  "Latest updates and thoughts from my LinkedIn profile. Follow along for professional insights and updates.";

useSeoMeta({
  title: "LinkedIn Posts | Elzodxon Sharofaddinov",
  description,
});

// State
const currentPage = ref(1);
const syncing = ref(false);

// Build query params
const queryParams = computed(() => ({
  page: currentPage.value,
  limit: 20,
}));

// Fetch posts
const { data, pending, error, refresh } = await useAsyncData(
  "linkedin-posts",
  () => $fetch("/api/linkedin/posts", { query: queryParams.value }),
  {
    watch: [currentPage],
  }
);

const posts = computed(() => data.value?.posts || []);
const pagination = computed(() => data.value?.pagination || null);

// Group posts by date
const groupedPosts = computed(() => {
  const groups = {};
  for (const post of posts.value) {
    const dateKey = new Date(post.date).toISOString().split("T")[0]; // YYYY-MM-DD
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(post);
  }
  return groups;
});

// Format date header
const formatDateHeader = (dateKey) => {
  const date = new Date(dateKey + "T00:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
};

// Visible page numbers for pagination
const visiblePages = computed(() => {
  if (!pagination.value) return [];
  const { page, totalPages } = pagination.value;
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// Methods
const goToPage = (page) => {
  currentPage.value = page;
};

const syncPosts = async (posts = 10) => {
  syncing.value = true;
  try {
    const result = await $fetch("/api/linkedin/sync", { 
      method: "POST",
      query: { posts }
    });
    console.log("Sync result:", result);
    await refresh();
  } catch (err) {
    console.error("Failed to sync:", err);
  } finally {
    syncing.value = false;
  }
};
</script>
