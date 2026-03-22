<template>
  <div class="space-y-6">
    <div class="space-y-4">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
        Hi, It is Elzodxon.
      </h1>
      <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
        I'm a product builder and software engineer based in Tashkent, Uzbekistan. I'm the founder of
        <a href="https://aisha.group" target="_blank" class="underline decoration-gray-400 hover:decoration-primary-500 transition-colors">Aisha AI</a>
        — an all-in-one AI voice agents and analytics platform that helps businesses understand their customers through call analysis.
      </p>
      <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
        I'm studying Software Engineering at
        <a href="https://aut-edu.uz" target="_blank" class="underline decoration-gray-400 hover:decoration-primary-500 transition-colors">AUT</a>
        (American University of Technology) on a 100% "Tech Innovators" scholarship. Before that, I co-founded
        <a href="https://unicraft.uz" target="_blank" class="underline decoration-gray-400 hover:decoration-primary-500 transition-colors">Unicraft</a>,
        a platform connecting applicants with students from Harvard, Princeton, Oxford, and 100+ universities worldwide.
      </p>
      <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
        I've been building for the web since 2018 — starting as a frontend developer, then leading teams at
        UIC Group, Imkon Uzbekistan, and Commeta, managing 10+ developers and shipping fintech, e-commerce, and education products.
        I also taught frontend development at Co-Learning Center for 4 years and mentored at IQ Education.
      </p>
      <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
        Beyond work, I volunteer as a guest speaker at the U.S. Embassy in Tashkent, UzGeeks, and Qizlar Akademiyasi, and mentored at IT Park Uzbekistan's President Tech Award.
        I'm an active open-source contributor on GitHub and help organize the VueJS Uzbekistan community.
      </p>
      <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
        When I'm not building, I'm probably playing chess, swimming, or in a CS2 match. I share my thoughts on tech, startups, and building in Uzbekistan on my
        <a href="https://t.me/elzodxon" target="_blank" class="underline decoration-gray-400 hover:decoration-primary-500 transition-colors">Telegram channel</a>.
      </p>
    </div>

    <div class="flex items-center gap-3">
      <NuxtLink
        v-for="link in socialLinks"
        :key="link.icon"
        :to="link.url"
        target="_blank"
        external
        :aria-label="link.name"
        class="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200"
      >
        <Icon :name="link.icon" class="w-[18px] h-[18px]" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const title = "Elzodxon Sharofaddinov";
const description = "Elzodxon Sharofaddinov — founder of Aisha AI, co-founder of Unicraft, software engineer, and speaker. Building AI products in Tashkent, Uzbekistan.";

useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
});

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Elzodxon Sharofaddinov",
        "url": "https://elzodxon.uz",
        "image": "https://elzodxon.uz/elzodxon-sharofaddinov.jpeg",
        "jobTitle": "Founder & AI Product Builder",
        "worksFor": { "@type": "Organization", "name": "Aisha AI" },
        "alumniOf": { "@type": "EducationalOrganization", "name": "American University of Technology" },
        "sameAs": [
          "https://twitter.com/elzodxon_me",
          "https://github.com/elzodxon",
          "https://www.linkedin.com/in/elzodxon/",
          "https://t.me/elzodxon",
          "https://instagram.com/elzodxon_me"
        ]
      }),
    },
  ],
});

const socialLinks = [
  { name: "Twitter", url: "https://twitter.com/elzodxon_me", icon: "mdi:twitter" },
  { name: "GitHub", url: "https://github.com/elzodxon", icon: "mdi:github" },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/elzodxon/", icon: "mdi:linkedin" },
  { name: "Telegram", url: "https://t.me/elzodxon", icon: "mdi:telegram" },
  { name: "Instagram", url: "https://instagram.com/elzodxon_me", icon: "mdi:instagram" },
];
</script>
