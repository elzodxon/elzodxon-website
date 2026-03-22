<template>
  <main>
    <AppHeader class="mb-8" title="Bookmarks" :description="description" />
    <p class="text-sm text-gray-400 dark:text-gray-500 text-center py-12">
      Coming soon.
    </p>
  </main>
</template>

<script setup>
const description = "Awesome things I've found on the internet.";
useSeoMeta({
  title: "Bookmarks | Elzodxon Sharofaddinov",
  description,
  ogTitle: "Bookmarks | Elzodxon Sharofaddinov",
  ogDescription: description,
});
</script>
