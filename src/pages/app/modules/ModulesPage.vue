<script setup>
  // Ochiq «Modullar» sahifasi — Google uchun modullar va imkoniyatlar ro'yxati (login talab qilinmaydi).
  import i18n from '@/i18n/index.js'
  import { AppPaths } from '@/utils/index.js'
  import { setSeo, SEO_SITE } from '@/utils/seo.js'
  import PublicHeader from './ui/PublicHeader.vue'
  import { MODULES, UI, pageLang } from './modulesData.js'

  const lang = computed(() => pageLang(i18n.global.locale))
  const ui = computed(() => UI[lang.value])

  watchEffect(() => {
    setSeo({
      title: ui.value.pageTitle,
      description: ui.value.pageDescription,
      path: AppPaths.Modules,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: ui.value.heading,
        itemListElement: MODULES.map((m, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: m.title[lang.value],
          description: m.short[lang.value],
          url: `${SEO_SITE}${AppPaths.Modules}/${m.slug}`
        }))
      }
    })
  })
</script>

<template>
  <div class="mod-bg min-h-screen w-full pt-[64px]">
    <PublicHeader :ui="ui" />
    <main class="mx-auto w-full max-w-[1200px] px-4 pb-12 pt-8 sm:px-6">
      <h1 class="text-2xl font-bold text-textColor0 sm:text-3xl">{{ ui.heading }}</h1>
      <p class="mt-2 max-w-[760px] text-sm leading-relaxed text-textColor2 sm:text-base">{{ ui.lead }}</p>

      <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="m in MODULES"
          :key="m.slug"
          :to="`${AppPaths.Modules}/${m.slug}`"
          class="mod-card flex flex-col gap-3 p-5"
        >
          <span class="mod-icon"><n-icon size="24" :component="m.icon" /></span>
          <h2 class="text-base font-semibold text-textColor0">{{ m.title[lang] }}</h2>
          <p class="text-sm leading-relaxed text-textColor2">{{ m.short[lang] }}</p>
          <ul class="mt-1 flex flex-col gap-1 text-[13px] text-textColor2">
            <li v-for="f in m.features[lang].slice(0, 3)" :key="f" class="flex gap-2">
              <span class="text-primary">•</span><span>{{ f }}</span>
            </li>
          </ul>
          <span class="mt-auto pt-1 text-sm font-medium text-primary">{{ ui.more }} →</span>
        </RouterLink>
      </div>
    </main>
  </div>
</template>

<style scoped>
  .mod-bg {
    background: var(--color-surface-ground);
  }
  .mod-card {
    border: 1px solid var(--color-surface-line);
    border-radius: 16px;
    background: var(--color-surface-section);
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .mod-card:hover {
    border-color: var(--color-primary, #2552eb);
    box-shadow: 0 8px 24px -16px rgb(16 24 40 / 35%);
  }
  .mod-icon {
    display: inline-flex;
    width: 44px;
    height: 44px;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: color-mix(in srgb, var(--color-primary, #2552eb) 12%, transparent);
    color: var(--color-primary, #2552eb);
  }
</style>
