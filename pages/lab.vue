<template>
  <main>
    <AppHeader class="mb-8" title="Experiments" :description="description" />
    <p class="text-sm text-gray-400 dark:text-gray-500 text-center py-12">
      Coming soon.
    </p>
  </main>
</template>

<script setup>
const description = "Things I'm building, breaking, and learning from.";
useSeoMeta({
  title: "Experiments | Elzodxon Sharofaddinov",
  description,
  ogTitle: "Experiments | Elzodxon Sharofaddinov",
  ogDescription: description,
});
</script>
