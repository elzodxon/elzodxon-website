<template>
  <main class="min-h-screen">
    <AppHeader class="mb-8" title="Books" :description="description" />
    <ul class="space-y-2">
      <li v-for="book in books" :key="book.id">
        <div
          class="flex items-start gap-3 p-3 -m-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200"
        >
          <div
            class="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5 ring-1 ring-gray-200 dark:ring-white/10"
          >
            <Icon name="solar:book-outline" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-200">
              {{ book.title }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
              {{ book.author }}
            </p>
          </div>
          <span
            class="shrink-0 mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full"
            :class="statusClass(book.status)"
          >
            {{ book.status }}
          </span>
        </div>
      </li>
    </ul>
  </main>
</template>

<script setup>
const description = "Books that shaped my thinking.";
useSeoMeta({
  title: "Books | Elzodxon Sharofaddinov",
  description,
  ogTitle: "Books | Elzodxon Sharofaddinov",
  ogDescription: description,
});

const books = [
  {
    id: 1,
    title: "Atomic Habits",
    author: "James Clear",
    status: "Finished",
  },
  {
    id: 2,
    title: "Zero to One",
    author: "Peter Thiel",
    status: "Finished",
  },
  {
    id: 3,
    title: "The Lean Startup",
    author: "Eric Ries",
    status: "Finished",
  },
  {
    id: 4,
    title: "Deep Work",
    author: "Cal Newport",
    status: "Finished",
  },
  {
    id: 5,
    title: "The Psychology of Money",
    author: "Morgan Housel",
    status: "Reading",
  },
  {
    id: 6,
    title: "Shoe Dog",
    author: "Phil Knight",
    status: "Want to read",
  },
  {
    id: 7,
    title: "The Hard Thing About Hard Things",
    author: "Ben Horowitz",
    status: "Want to read",
  },
];

function statusClass(status) {
  switch (status) {
    case "Finished":
      return "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400";
    case "Reading":
      return "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400";
    case "Want to read":
      return "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400";
    default:
      return "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400";
  }
}
</script>
