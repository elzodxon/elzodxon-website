<template>
  <main>
    <AppHeader class="mb-8" title="Articles" :description="description" />
    <div class="space-y-6">
      <AppArticleCard
        v-for="(article, id) in articles"
        :key="id"
        :article="article"
      />
    </div>
    <p v-if="!articles?.length" class="text-sm text-gray-400 text-center py-12">
      No articles yet.
    </p>
  </main>
</template>

<script setup>
const description = "Long-form thoughts on building products, startups, and engineering.";
useSeoMeta({
  title: "Articles | Elzodxon Sharofaddinov",
  description,
  ogTitle: "Articles | Elzodxon Sharofaddinov",
  ogDescription: description,
});

const { data: articles } = await useAsyncData("all-articles", () =>
  queryContent("/articles")
    .sort({ date: -1 })
    .find()
);
</script>
