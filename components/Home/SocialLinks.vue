<template>
  <div class="py-2">
    <h2 class="uppercase text-xs font-semibold text-gray-400 mb-2">FIND ME ON</h2>
    <div class="flex items-center gap-4">
      <NuxtLink
        v-for="link in links"
        :key="link.icon"
        :to="link.url"
        target="_blank"
        external
        class="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
      >
        <Icon :name="link.icon" class="w-5 h-5"></Icon>
        <span class="text-sm">{{ link.name }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
const links = [
  {
    name: "Twitter",
    url: "https://twitter.com/elzodxon_me",
    icon: "mdi:twitter",
  },
  {
    name: "GitHub",
    url: "https://github.com/elzodxon",
    icon: "mdi:github",
  },
  {
    name: "Linkedin",
    url: "https://www.linkedin.com/in/elzodxon/",
    icon: "mdi:linkedin",
  },
  {
    name: "Telegram",
    url: "https://t.me/elzodxon",
    icon: "mdi:telegram",
  },
];
</script>
