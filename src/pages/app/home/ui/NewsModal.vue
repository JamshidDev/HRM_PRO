<script setup>
  /**
   * Bosh sahifadagi yangilikni katta ko'rinishda ochish.
   *
   * Figma "Asosiy" bo'limida yangilik uchun alohida maket yo'q, shuning uchun
   * oyna loyihaning mavjud `UIModal` qolipida — ichidagi tipografiya va
   * ranglar bosh sahifa tokenlariga (`fig-*`) mos.
   *
   * Ma'lumot ro'yxatdan (`GET /v1/news`) keladi: mobil API'da bitta yangilikni
   * olish uchun alohida endpoint yo'q, shu sababli modal ro'yxat elementidagi
   * maydonlar bilan cheklanadi.
   */
  import { useAccountStore, useHomeStore } from '@/store/modules/index.js'
  import { UIModal } from '@/components/index.js'
  import { AppPaths, Utils, useAppSetting } from '@/utils/index.js'
  import i18n from '@/i18n/index.js'
  import { Eye16Filled } from '@vicons/fluent'
  import CalendarAltIcon from '@/assets/icons/calendarAlt.svg'

  const store = useHomeStore()
  const accountStore = useAccountStore()
  const router = useRouter()

  const visible = computed({
    get: () => Boolean(store.activeNews),
    set: (v) => {
      if (!v) store.closeNews()
    }
  })

  const item = computed(() => store.activeNews ?? {})

  // Tarjima tanlash — `NewsCard.vue` bilan bir xil moslashuvchan tartib:
  // mobil API tayyor matn beradi, CMS ko'rinishi esa `translations[]`.
  const translation = computed(() => {
    const tr = item.value.translations ?? []
    return tr.find((t) => t.locale === i18n.global.locale) || tr.find((t) => t.title) || {}
  })

  const title = computed(() =>
    typeof item.value.title === 'string' && item.value.title
      ? item.value.title
      : translation.value.title || ''
  )

  const body = computed(() => {
    const raw =
      item.value.content ||
      translation.value.content ||
      item.value.short_description ||
      translation.value.short_description ||
      ''
    return raw
  })

  const DOC_EXTS = ['pdf', 'doc', 'docx']
  const isViewable = (media) => {
    const src = media.url || media.path || ''
    return !DOC_EXTS.includes(src.split('?')[0].split('.').pop()?.toLowerCase() ?? '')
  }

  // Modalda barcha rasmlar ko'rsatiladi (kartada faqat birinchisi).
  const images = computed(() => {
    const media = [...(item.value.media ?? [])]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .filter(isViewable)
      .map((m) => m.url || m.path)
      .filter(Boolean)
    if (media.length) return media
    const single = item.value.image || item.value.cover
    return single ? [single] : []
  })

  const canOpenFullPage = computed(() => accountStore.checkPermission(accountStore.pn.chat))

  const onOpenFullPage = () => {
    const id = item.value.id
    store.closeNews()
    router.push(Utils.routeChatPathMaker(`${AppPaths.News}${AppPaths.View}/${id}`))
  }
</script>

<template>
  <UIModal
    v-model:visible="visible"
    :width="800"
    height="80vh"
    :persistent="false"
    fullscreen-on-mobile
    :title="$t('homePage.news')"
  >
    <div class="flex flex-col gap-4">
      <img
        v-for="(src, index) in images"
        :key="index"
        :src="src || useAppSetting.noAvailableImage"
        alt=""
        class="max-h-[420px] w-full rounded-2xl object-cover"
        @error="Utils.onImgError"
      />

      <h2 class="text-[24px] leading-[30px] font-semibold text-fig-text-primary">
        {{ title }}
      </h2>

      <div class="flex flex-wrap items-center gap-4 text-[12px] leading-4 text-fig-text-tertiary">
        <span class="flex items-center gap-1.5">
          <span class="flex h-4 w-4 items-center justify-center"><CalendarAltIcon /></span>
          {{ Utils.timeOnlyDate(item.published_at) }}
        </span>
        <span v-if="item.views_count != null" class="flex items-center gap-1.5">
          <n-icon :size="14"><Eye16Filled /></n-icon>
          {{ item.views_count }}
        </span>
      </div>

      <!-- Matn wangEditor'dan HTML bo'lib keladi. Klass nomiga tegilmasin:
           global `.w-e-viewer` uslublari shunga bog'langan. -->
      <div v-if="body" class="w-e-viewer text-fig-text-secondary" v-html="body"></div>
      <p v-else class="text-[14px] leading-5 text-fig-text-tertiary">
        {{ $t('content.no-data') }}
      </p>
    </div>

    <template #footer>
      <div v-if="canOpenFullPage" class="flex justify-end px-4 pb-4">
        <n-button type="primary" @click="onOpenFullPage">
          {{ $t('homePage.more') }}
        </n-button>
      </div>
    </template>
  </UIModal>
</template>
