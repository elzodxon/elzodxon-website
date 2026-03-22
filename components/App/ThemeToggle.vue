<script setup>
const colorMode = useColorMode();

const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set() {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
  },
});
</script>

<template>
  <button
    class="relative p-2 flex items-center justify-center rounded-lg transition hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
    @click="isDark = !isDark"
  >
    <Icon
      aria-hidden="true"
      :name="isDark ? 'solar:sun-2-outline' : 'solar:moon-outline'"
      class="w-4.5 h-4.5"
    />
    <span class="sr-only">Toggle theme</span>
  </button>
</template>
