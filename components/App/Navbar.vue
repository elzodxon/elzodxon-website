<template>
  <div ref="headerRef" :style="styles" class="fixed top-0 w-full z-50">
    <nav class="mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
      <div
        class="flex items-center justify-between my-4 px-4 py-2 text-sm font-medium text-gray-800 rounded-2xl shadow-lg bg-white/80 shadow-gray-800/5 ring-1 backdrop-blur-xl dark:bg-gray-900/80 dark:text-gray-200 dark:ring-white/10 ring-gray-900/5"
      >
        <!-- Logo / Name -->
        <ULink
          to="/"
          class="flex items-center gap-2.5 group shrink-0"
        >
          <NuxtImg
            src="/elzodxon-sharofaddinov.jpeg"
            alt="Elzodxon"
            class="rounded-full h-8 w-8 ring-1 ring-gray-200 dark:ring-white/10 transition-all duration-300 group-hover:ring-primary-500/50 group-hover:ring-2"
            sizes="32px"
            format="webp"
          />
          <span class="hidden sm:block font-semibold text-gray-900 dark:text-white tracking-tight">
            Elzodxon
          </span>
        </ULink>

        <!-- Desktop Navigation -->
        <ul class="hidden md:flex items-center gap-1">
          <li v-for="item in items" :key="item.path">
            <ULink
              :to="item.path"
              class="relative px-3 py-2 flex items-center gap-1.5 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              :class="$route.path === item.path ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10' : ''"
            >
              <Icon aria-hidden="true" :name="item.icon" class="w-4 h-4" />
              <span class="text-xs font-medium">{{ item.label }}</span>
            </ULink>
          </li>
        </ul>

        <!-- Right side: theme toggle + mobile menu -->
        <div class="flex items-center gap-1">
          <AppThemeToggle />

          <!-- Mobile menu button -->
          <button
            class="md:hidden relative p-2 flex items-center justify-center rounded-lg transition hover:bg-gray-100 dark:hover:bg-white/5"
            @click="mobileOpen = !mobileOpen"
          >
            <Icon
              aria-hidden="true"
              :name="mobileOpen ? 'heroicons:x-mark-20-solid' : 'heroicons:bars-3-20-solid'"
              class="w-5 h-5"
            />
            <span class="sr-only">Menu</span>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="mobileOpen"
          class="md:hidden mt-1 px-3 py-2 rounded-xl bg-white/80 shadow-lg shadow-gray-800/5 ring-1 backdrop-blur-xl dark:bg-gray-900/80 dark:ring-white/10 ring-gray-900/5"
        >
          <ul class="grid grid-cols-2 gap-1">
            <li v-for="item in items" :key="item.path">
              <ULink
                :to="item.path"
                class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                :class="$route.path === item.path ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10' : ''"
                @click="mobileOpen = false"
              >
                <Icon aria-hidden="true" :name="item.icon" class="w-5 h-5" />
                <span class="text-sm font-medium">{{ item.name }}</span>
              </ULink>
            </li>
          </ul>
        </div>
      </Transition>
    </nav>
  </div>
</template>

<script setup>
import { useFixedHeader } from 'vue-use-fixed-header'

const headerRef = ref(null);
const { styles } = useFixedHeader(headerRef);
const mobileOpen = ref(false);

const route = useRoute();
watch(() => route.path, () => {
  mobileOpen.value = false;
});

const items = [
  { name: "Projects", label: "Projects", path: "/projects", icon: "solar:folder-with-files-outline" },
  { name: "Articles", label: "Articles", path: "/articles", icon: "solar:document-add-outline" },
  { name: "Lab", label: "Lab", path: "/lab", icon: "heroicons:beaker" },
  { name: "Bag", label: "Bag", path: "/whats-in-my-bag", icon: "solar:backpack-outline" },
  { name: "Bookmarks", label: "Saves", path: "/bookmarks", icon: "solar:bookmark-linear" },
];
</script>
