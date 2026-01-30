<template>
  <main class="min-h-screen">
    <AppHeader class="mb-8" title="Talks & Appearances" :description="description" />

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
        {{ error.message || "Failed to load talks" }}
      </p>
      <UButton color="primary" variant="soft" @click="refresh">
        Try Again
      </UButton>
    </div>

    <!-- Talks grouped by date -->
    <div v-else-if="talks && talks.length > 0">
      <div class="space-y-8 mb-8">
        <div v-for="(group, dateKey) in groupedTalks" :key="dateKey">
          <!-- Date Header -->
          <h2
            class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 sticky top-16 bg-gray-50 dark:bg-black py-2 z-10"
          >
            {{ formatDateHeader(dateKey) }}
          </h2>
          <!-- Talks for this date -->
          <div class="space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-800">
            <AppTalkCard
              v-for="talk in group"
              :key="talk.id"
              :talk="talk"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12">
      <Icon name="lucide:mic" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400 mb-4">No talks or appearances yet.</p>
      <p class="text-sm text-gray-400 dark:text-gray-500">
        Add your interviews, podcasts, and media appearances to showcase here.
      </p>
    </div>
  </main>
</template>

<script setup>
const description =
  "Interviews, podcasts, and media appearances where I share my story and insights.";

useSeoMeta({
  title: "Talks & Appearances | Elzodxon Sharofaddinov",
  description,
});

// Fetch talks
const { data, pending, error, refresh } = await useAsyncData(
  "talks",
  () => $fetch("/api/talks")
);

const talks = computed(() => data.value?.talks || []);

// Group talks by date
const groupedTalks = computed(() => {
  const groups = {};
  for (const talk of talks.value) {
    const dateKey = new Date(talk.date).toISOString().split("T")[0]; // YYYY-MM-DD
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(talk);
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
</script>
