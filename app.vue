<script setup>
useSeoMeta({
  ogSiteName: 'Elzodxon Sharofaddinov',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterSite: '@elzodxon_me',
  twitterCreator: '@elzodxon_me',
  ogImage: '/elzodxon-sharofaddinov.jpeg',
});
</script>

<template>
  <NuxtLoadingIndicator color="#14b8a6" />
  <AppNavbar />
  <div class="h-28"></div>
  <UContainer>
    <NuxtPage />
  </UContainer>
  <div class="h-8"></div>
  <AppFooter />
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(5px);
}
</style>
