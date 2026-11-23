<script setup>
  // Ochiq modul sahifasi: nomi, tavsifi va imkoniyatlari (Google uchun alohida URL).
  import i18n from '@/i18n/index.js'
  import { useRoute } from 'vue-router'
  import { AppPaths } from '@/utils/index.js'
  import { setSeo, SEO_SITE } from '@/utils/seo.js'
  import PublicHeader from './ui/PublicHeader.vue'
  import { MODULES, UI, PLAY_URL, findModule, pageLang } from './modulesData.js'

  const route = useRoute()
  const lang = computed(() => pageLang(i18n.global.locale))
  const ui = computed(() => UI[lang.value])
  const mod = computed(() => findModule(route.params.slug))
  const others = computed(() => MODULES.filter((m) => m.slug !== route.params.slug))

  watchEffect(() => {
    const m = mod.value
    if (!m) return
    const url = `${SEO_SITE}${AppPaths.Modules}/${m.slug}`
    setSeo({
      title: `${m.title[lang.value]} — HRM PRO`,
      description: `${m.short[lang.value]} ${m.features[lang.value].slice(0, 3).join('; ')}.`,
      path: `${AppPaths.Modules}/${m.slug}`,
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': m.play ? 'MobileApplication' : 'WebApplication',
            name: m.title[lang.value],
            url: m.play ? PLAY_URL : url,
            description: m.short[lang.value],
            applicationCategory: 'BusinessApplication',
            operatingSystem: m.play ? 'Android' : 'Web',
            featureList: m.features[lang.value],
            publisher: { '@id': `${SEO_SITE}/#organization` }
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'HRM PRO', item: `${SEO_SITE}/` },
              { '@type': 'ListItem', position: 2, name: ui.value.heading, item: `${SEO_SITE}${AppPaths.Modules}` },
              { '@type': 'ListItem', position: 3, name: m.title[lang.value], item: url }
            ]
          }
        ]
      }
    })
  })
</script>

<template>
  <div class="mod-bg min-h-screen w-full pt-[64px]">
    <PublicHeader :ui="ui" />
    <main class="mx-auto w-full max-w-[1200px] px-4 pb-12 pt-6 sm:px-6">
      <nav class="text-sm text-textColor2">
        <RouterLink :to="AppPaths.Modules" class="hover:text-primary">{{ ui.allModules }}</RouterLink>
        <span v-if="mod"> / {{ mod.title[lang] }}</span>
      </nav>

      <template v-if="mod">
        <div class="mod-card mt-4 p-6 sm:p-8">
          <div class="flex items-center gap-3">
            <span class="mod-icon"><n-icon size="26" :component="mod.icon" /></span>
            <h1 class="text-2xl font-bold text-textColor0 sm:text-3xl">{{ mod.title[lang] }}</h1>
          </div>
          <p class="mt-3 max-w-[760px] leading-relaxed text-textColor2">{{ mod.short[lang] }}</p>

          <h2 class="mt-6 text-lg font-semibold text-textColor0">{{ ui.features }}</h2>
          <ul class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <li v-for="f in mod.features[lang]" :key="f" class="flex gap-2 text-sm text-textColor1">
              <span class="text-primary">✓</span><span>{{ f }}</span>
            </li>
          </ul>

          <div class="mt-6 flex flex-wrap gap-3">
            <RouterLink :to="AppPaths.Login">
              <n-button type="primary">{{ ui.login }}</n-button>
            </RouterLink>
            <a v-if="mod.play" :href="PLAY_URL" target="_blank" rel="noopener">
              <n-button>{{ ui.download }}</n-button>
            </a>
          </div>
        </div>

        <h2 class="mt-8 text-lg font-semibold text-textColor0">{{ ui.otherModules }}</h2>
        <div class="mt-3 flex flex-wrap gap-2">
          <RouterLink
            v-for="m in others"
            :key="m.slug"
            :to="`${AppPaths.Modules}/${m.slug}`"
            class="mod-chip px-3 py-1.5 text-sm text-textColor1"
          >
            {{ m.title[lang] }}
          </RouterLink>
        </div>
      </template>
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
  }
  .mod-chip {
    border: 1px solid var(--color-surface-line);
    border-radius: 999px;
    background: var(--color-surface-section);
  }
  .mod-chip:hover {
    border-color: var(--color-primary, #2552eb);
  }
  .mod-icon {
    display: inline-flex;
    width: 48px;
    height: 48px;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: color-mix(in srgb, var(--color-primary, #2552eb) 12%, transparent);
    color: var(--color-primary, #2552eb);
  }
</style>
