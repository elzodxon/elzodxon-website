<template>
  <main>
    <AppHeader class="mb-8" title="Books" :description="description" />

    <!-- Filter by status -->
    <div class="flex items-center gap-2 mb-6">
      <button
        v-for="f in statusFilters"
        :key="f.value"
        class="px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer"
        :class="activeFilter === f.value
          ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
          : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'"
        @click="activeFilter = f.value"
      >
        {{ f.label }}
        <span class="ml-1 text-gray-400 dark:text-gray-500">{{ f.count }}</span>
      </button>
    </div>

    <!-- Currently Reading (featured) -->
    <div v-if="activeFilter === 'all' || activeFilter === 'reading'" class="mb-8">
      <div v-for="book in currentlyReading" :key="book.id" class="p-4 rounded-xl ring-1 ring-primary-200 dark:ring-primary-500/20 bg-primary-50/50 dark:bg-primary-500/5 mb-3">
        <div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ book.title }}</p>
              <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400">Reading now</span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ book.author }}</p>
            <p v-if="book.note" class="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">"{{ book.note }}"</p>
            <div v-if="book.progress" class="mt-2">
              <div class="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>Progress</span>
                <span>{{ book.progress }}%</span>
              </div>
              <div class="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div class="h-full bg-primary-500 rounded-full transition-all" :style="{ width: book.progress + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Book list -->
    <div class="space-y-2">
      <div
        v-for="book in filteredBooks"
        :key="book.id"
        class="group flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-200"
      >
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ book.title }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{{ book.author }}</p>
          <p v-if="book.note" class="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">"{{ book.note }}"</p>
        </div>
        <span
          class="shrink-0 mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full"
          :class="statusClass(book.status)"
        >
          {{ book.status === 'finished' ? 'Finished' : 'Want to read' }}
        </span>
      </div>
    </div>

    <p v-if="filteredBooks.length === 0 && currentlyReading.length === 0" class="text-sm text-gray-400 text-center py-8">
      No books in this category.
    </p>
  </main>
</template>

<script setup>
const description = "Books that shaped my thinking, or are shaping it right now.";
useSeoMeta({
  title: "Books | Elzodxon Sharofaddinov",
  description,
  ogTitle: "Books | Elzodxon Sharofaddinov",
  ogDescription: description,
});

const activeFilter = ref('all')

const books = [
  // Currently reading
  {
    id: 1,
    title: "The Psychology of Money",
    author: "Morgan Housel",
    status: "reading",
    emoji: "💰",
    progress: 65,
    note: "Wealth is what you don't see.",
  },
  // Finished
  {
    id: 2,
    title: "Atomic Habits",
    author: "James Clear",
    status: "finished",
    emoji: "⚡",
    note: "Small changes, remarkable results.",
  },
  {
    id: 3,
    title: "Zero to One",
    author: "Peter Thiel",
    status: "finished",
    emoji: "🚀",
    note: "Every moment in business happens only once.",
  },
  {
    id: 4,
    title: "The Lean Startup",
    author: "Eric Ries",
    status: "finished",
    emoji: "🔬",
    note: "Build, measure, learn.",
  },
  {
    id: 5,
    title: "Deep Work",
    author: "Cal Newport",
    status: "finished",
    emoji: "🧠",
    note: "Focus is the new IQ.",
  },
  {
    id: 6,
    title: "Rework",
    author: "Jason Fried & DHH",
    status: "finished",
    emoji: "🔧",
  },
  // Want to read
  {
    id: 7,
    title: "Shoe Dog",
    author: "Phil Knight",
    status: "want",
    emoji: "👟",
  },
  {
    id: 8,
    title: "The Hard Thing About Hard Things",
    author: "Ben Horowitz",
    status: "want",
    emoji: "💪",
  },
  {
    id: 9,
    title: "Blitzscaling",
    author: "Reid Hoffman",
    status: "want",
    emoji: "⚡",
  },
  {
    id: 10,
    title: "The Innovator's Dilemma",
    author: "Clayton Christensen",
    status: "want",
    emoji: "💡",
  },
];

const currentlyReading = computed(() => books.filter(b => b.status === 'reading'))

const filteredBooks = computed(() => {
  const nonReading = books.filter(b => b.status !== 'reading')
  if (activeFilter.value === 'all') return nonReading
  if (activeFilter.value === 'reading') return []
  return nonReading.filter(b => b.status === activeFilter.value)
})

const statusFilters = computed(() => [
  { label: 'All', value: 'all', count: books.length },
  { label: 'Reading', value: 'reading', count: books.filter(b => b.status === 'reading').length },
  { label: 'Finished', value: 'finished', count: books.filter(b => b.status === 'finished').length },
  { label: 'Want to read', value: 'want', count: books.filter(b => b.status === 'want').length },
])

function statusClass(status) {
  switch (status) {
    case "finished":
      return "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400";
    case "want":
      return "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400";
    default:
      return "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400";
  }
}
</script>
