<template>
  <main class="min-h-screen">
    <AppHeader class="mb-8" title="CV" :description="description" />

    <div class="space-y-12">
      <!-- EXPERIENCE -->
      <section>
        <h2 class="uppercase text-xs font-semibold text-gray-400 mb-4">Experience</h2>
        <div class="space-y-6">
          <div v-for="job in experience" :key="job.title + job.company">
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ job.title }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ job.company }}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500">{{ job.dates }}</p>
            <p v-if="job.description" class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ job.description }}</p>
          </div>
        </div>
      </section>

      <!-- EDUCATION -->
      <section>
        <h2 class="uppercase text-xs font-semibold text-gray-400 mb-4">Education</h2>
        <div class="space-y-6">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">Software Engineering</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">American University of Technology (AUT) · 100% "Tech Innovators" Scholarship · 3.6 GPA</p>
          </div>
        </div>
      </section>

      <!-- VOLUNTEERING -->
      <section>
        <h2 class="uppercase text-xs font-semibold text-gray-400 mb-4">Volunteering</h2>
        <div class="space-y-6">
          <div v-for="vol in volunteering" :key="vol.title + vol.org">
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ vol.title }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ vol.org }}</p>
            <p v-if="vol.dates" class="text-xs text-gray-400 dark:text-gray-500">{{ vol.dates }}</p>
            <p v-if="vol.description" class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ vol.description }}</p>
          </div>
        </div>
      </section>

      <!-- SKILLS -->
      <section>
        <h2 class="uppercase text-xs font-semibold text-gray-400 mb-4">Skills</h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="skill in skills"
            :key="skill"
            class="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400"
          >
            {{ skill }}
          </span>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
const description = "My professional journey.";
useSeoMeta({
  title: "CV | Elzodxon Sharofaddinov",
  description,
  ogTitle: "CV | Elzodxon Sharofaddinov",
  ogDescription: description,
});

const experience = [
  {
    title: "Founder",
    company: "Aisha AI · Full-time · Jun 2024 - Present · Tashkent",
    dates: "",
    description: "Building all-in-one AI Voice Agents and analytics platform",
  },
  {
    title: "Co-Founder & CTO",
    company: "Unicraft · Self-employed · Jan 2024 - Apr 2025",
    dates: "",
    description: "Created a platform for applicants and students. Gathered Uzbek students from Harvard, Princeton, Oxford, Duke, NYU, Georgetown, Birmingham and 100+ universities.",
  },
  {
    title: "Frontend Development Instructor",
    company: "Co-Learning Center · Jan 2021 - Dec 2024 · 4 years · Tashkent",
    dates: "",
    description: "",
  },
  {
    title: "Frontend Team Lead",
    company: "Commeta · Full-time · Oct 2023 - Apr 2024 · Tashkent",
    dates: "",
    description: "React.js, Nuxt.js",
  },
  {
    title: "Frontend Development Team Lead",
    company: "UIC Group · Full-time · May 2022 - Sep 2023 · Tashkent",
    dates: "",
    description: "Managed a team of 10+ developers. Shipped fintech, e-commerce, and education products. Implemented complex UI designs including dashboards, ERP systems, and CRMs.",
  },
  {
    title: "Frontend Development Team Lead",
    company: "Imkon Uzbekistan · Full-time · Aug 2021 - May 2022 · Tashkent",
    dates: "",
    description: "Led a team of 4+ developers. Worked on imkon.uz — a social network for Uzbekistan's professionals.",
  },
  {
    title: "Frontend Developer",
    company: "Imkon Uzbekistan · Nov 2020 - Aug 2021",
    dates: "",
    description: "Code refactoring, new module implementation using Nuxt 2.",
  },
  {
    title: "Frontend Development Mentor",
    company: "IQ Education · Contract · Feb 2021 - Aug 2021 · Tashkent",
    dates: "",
    description: "Taught 15 students JavaScript, Vue.js, and Nuxt.js. 10 of them secured jobs as Frontend Developers.",
  },
  {
    title: "Frontend Developer",
    company: "Interest.uz · Self-employed · Nov 2018 - Oct 2020",
    dates: "",
    description: "",
  },
];

const volunteering = [
  {
    title: "Guest Speaker",
    org: "UzGeeks",
    dates: "",
    description: '"Introduction to Nuxt 3 and usage in real-world"',
  },
  {
    title: "Guest Speaker",
    org: "Qizlar Akademiyasi",
    dates: "Jul 2025",
    description: "Spoke to 100+ girls about Startups and building with AI",
  },
  {
    title: "Guest Speaker",
    org: "U.S. Embassy in Tashkent",
    dates: "Jun 2025",
    description: "",
  },
  {
    title: "Mentor",
    org: "IT Park Uzbekistan",
    dates: "Oct 2025",
    description: "President Tech Award Mentor",
  },
];

const skills = [
  "Vue.js",
  "Nuxt.js",
  "React.js",
  "JavaScript",
  "TypeScript",
  "Python",
  "Team Management",
  "AI/ML",
  "Product Building",
  "Open Source",
];
</script>
