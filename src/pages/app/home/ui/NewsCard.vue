<script setup>
  /**
   * Figma "Welcome" (node 3257:112508) — "Yangiliklar" kartasi.
   *
   * Ma'lumot mavjud `GET /v1/chat/news` dan (`status=1` — chop etilganlar).
   * Muqova, sarlavha, ko'rishlar soni va sana mantiqi `pages/chat/news`
   * sahifasi bilan bir xil bo'lishi uchun o'sha yerdan ko'chirildi.
   */
  import { useAccountStore, useHomeStore } from '@/store/modules/index.js'
  import HomePanel from './HomePanel.vue'
  import { AppPaths, Utils, useAppSetting } from '@/utils/index.js'
  import i18n from '@/i18n/index.js'
  import NewsIcon from '@/assets/icons/News.svg'
  import { Eye16Filled } from '@vicons/fluent'

  const store = useHomeStore()
  const accountStore = useAccountStore()
  const router = useRouter()

  // Hujjatlar (pdf/doc) muqova bo'la olmaydi — `chat/news/ui/Table.vue` dagidek.
  const DOC_EXTS = ['pdf', 'doc', 'docx']
  const coverOf = (row) => {
    const media = [...(row.media ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    const item = media.find(
      (m) => !DOC_EXTS.includes(m.path?.split('.').pop()?.toLowerCase() ?? '')
    )
    return item?.path || useAppSetting.noAvailableImage
  }

  // `chat/news/ViewPage.vue` dagi tarjima tanlash tartibi.
  const titleOf = (row) => {
    const tr = row.translations ?? []
    const found = tr.find((t) => t.locale === i18n.global.locale) || tr.find((t) => t.title) || {}
    return found.title || ''
  }

  // `chat/news/ui/Table.vue:94` — 9300 → "9.3K"
  const formatCount = (n) => {
    n = n ?? 0
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return `${n}`
  }

  // Ro'yxat sahifasi chat moduli ruxsatiga bog'liq (`layouts/data/navigations.js`
  // dagi "Yangiliklar" menyusi bilan bir xil) — ruxsat yo'q bo'lsa "Batafsil"
  // havolasi umuman chizilmaydi.
  const canOpenList = computed(() => accountStore.checkPermission(accountStore.pn.chat))

  const onDetail = () => {
    router.push(Utils.routeChatPathMaker(AppPaths.News))
  }
</script>

<template>
  <HomePanel
    :icon="NewsIcon"
    :title="$t('homePage.news')"
    :action-text="canOpenList ? $t('homePage.more') : null"
    @action="onDetail"
  >
    <div v-if="store.news.length" class="flex flex-col gap-3">
      <div v-for="item in store.news" :key="item.id" class="flex items-start gap-4">
        <div class="relative h-[67px] w-[120px] shrink-0 overflow-hidden rounded-lg">
          <img
            :src="coverOf(item)"
            alt=""
            class="h-full w-full object-cover"
            @error="Utils.onImgError"
          />
          <span
            class="absolute top-1 right-1 flex items-center gap-0.5 rounded bg-black/45 px-1 py-0.5 text-[10px] leading-3 font-medium text-white"
          >
            <n-icon :size="10"><Eye16Filled /></n-icon>
            {{ formatCount(item.views_count) }}
          </span>
        </div>

        <div class="flex min-w-0 flex-1 flex-col gap-2">
          <p class="line-clamp-2 text-[16px] leading-5 font-semibold text-fig-text-primary">
            {{ titleOf(item) }}
          </p>
          <p class="text-[12px] leading-4 text-fig-text-tertiary">
            {{ Utils.timeOnlyDate(item.published_at) }}
          </p>
        </div>
      </div>
    </div>

    <p v-else class="text-[14px] leading-5 text-fig-text-tertiary">
      {{ $t('content.no-data') }}
    </p>
  </HomePanel>
</template>
