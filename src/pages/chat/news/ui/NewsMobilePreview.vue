<script setup>
  import { computed, ref, watch } from 'vue'
  import DOMPurify from 'dompurify'
  import { Pin24Filled, ArrowLeft24Filled, Image24Regular, Play24Filled } from '@vicons/fluent'
  import { useNewsStore, useNewsCategoryStore } from '@/store/modules/index.js'
  import { UIPhoneFrame } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import { isEditorContentEmpty } from '@/utils/EditorValidator.js'
  import { isImageFile, isVideoFile, useObjectUrls } from './useMediaPreview.js'
  import CalendarAltIcon from '@/assets/icons/calendarAlt.svg'
  import EyeIcon from '@/assets/icons/eye.svg'
  import LikeIcon from '@/assets/icons/Like.svg'
  import DisLikeIcon from '@/assets/icons/disLike.svg'
  import CommentIcon from '@/assets/icons/comment.svg'

  const props = defineProps({
    langIndex: {
      type: Number,
      default: 0
    }
  })

  const store = useNewsStore()
  const categoryStore = useNewsCategoryStore()

  const { previewSrc } = useObjectUrls()

  // Formadagi faol til preview'ni boshlaydi, lekin preview ichida til almashtirilsa
  // formaga qaytib ta'sir qilmaydi (tahrirlanayotgan maydon fokusi buzilmasin).
  const previewLang = ref(props.langIndex)
  watch(
    () => props.langIndex,
    (val) => {
      previewLang.value = val
    }
  )

  const langTabs = computed(() =>
    store.payload.translations.map((t, index) => ({ label: t.label, value: index }))
  )

  const translation = computed(() => store.payload.translations[previewLang.value] ?? {})

  const sanitizedContent = computed(() => DOMPurify.sanitize(translation.value.content ?? ''))
  const hasContent = computed(() => !isEditorContentEmpty(sanitizedContent.value))

  const media = computed(() => store.payload.media ?? [])

  const activeSlide = ref(0)
  const onSlideScroll = (e) => {
    const { scrollLeft, clientWidth } = e.target
    if (clientWidth) activeSlide.value = Math.round(scrollLeft / clientWidth)
  }

  watch(
    () => media.value.length,
    (len) => {
      if (activeSlide.value > len - 1) activeSlide.value = Math.max(len - 1, 0)
    }
  )

  const categoryNames = computed(() => {
    const ids = store.payload.categories ?? []
    return ids
      .map((id) => {
        const found = categoryStore.list.find((c) => c.id === id)
        if (!found) return null
        const name = found.name
        if (typeof name === 'string') return name
        return name?.[i18n.global.locale] || Object.values(name ?? {})[0] || null
      })
      .filter(Boolean)
  })

  const publishedAt = computed(() => Utils.timeOnlyDate(store.payload.published_at) ?? '')

  const reactions = [
    { icon: EyeIcon, count: 0 },
    { icon: LikeIcon, count: 0 },
    { icon: DisLikeIcon, count: 0 },
    { icon: CommentIcon, count: 0 }
  ]
</script>

<template>
  <div class="w-[340px]">
    <!-- ── Panel sarlavhasi ─────────────────────────────────────────────────── -->
    <div class="flex items-center gap-2 mb-2">
      <h3 class="text-sm font-semibold text-textColor0">{{ $t('newsPage.preview') }}</h3>
      <span class="text-xs text-textColor3">· {{ $t('newsPage.previewHint') }}</span>
    </div>

    <!-- ── Til almashtirgich ────────────────────────────────────────────────── -->
    <div class="flex items-center gap-1 mb-3 p-1 rounded-lg bg-surface-ground w-fit">
      <button
        v-for="tab in langTabs"
        :key="tab.value"
        type="button"
        class="px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer"
        :class="
          previewLang === tab.value
            ? 'bg-primary text-white'
            : 'text-textColor1 hover:bg-surface-line'
        "
        @click="previewLang = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ── Telefon ramkasi ──────────────────────────────────────────────────── -->
    <UIPhoneFrame screen-class="overflow-y-auto bg-white">
      <!-- ── Hero media ────────────────────────────────────────────────── -->
      <div class="relative">
        <div
          v-if="media.length"
          class="flex overflow-x-auto snap-x snap-mandatory news-preview-scroll"
          @scroll="onSlideScroll"
        >
          <div
            v-for="item in media"
            :key="item.id"
            class="w-full shrink-0 snap-center h-[220px] bg-[#101828]"
          >
            <img
              v-if="isImageFile(item)"
              :src="previewSrc(item)"
              class="w-full h-full object-cover"
              alt=""
            />
            <div v-else-if="isVideoFile(item)" class="relative w-full h-full">
              <video
                :src="previewSrc(item)"
                class="w-full h-full object-cover"
                preload="metadata"
                muted
              />
              <div class="absolute inset-0 flex items-center justify-center bg-black/30">
                <span
                  class="w-11 h-11 rounded-full bg-white/85 flex items-center justify-center"
                >
                  <n-icon size="20" color="#101828"><Play24Filled /></n-icon>
                </span>
              </div>
            </div>
            <div
              v-else
              class="w-full h-full flex flex-col items-center justify-center gap-1 bg-[#F2F4F7]"
            >
              <n-icon size="26" color="#98A2B3"><Image24Regular /></n-icon>
              <span class="text-[11px] text-[#98A2B3] px-3 text-center line-clamp-2">
                {{ item.name }}
              </span>
            </div>
          </div>
        </div>

        <div
          v-else
          class="h-[220px] flex flex-col items-center justify-center gap-1.5 bg-[#F2F4F7]"
        >
          <n-icon size="30" color="#98A2B3"><Image24Regular /></n-icon>
          <span class="text-[11px] text-[#98A2B3]">{{ $t('newsPage.noMedia') }}</span>
        </div>

        <!-- Media ustidagi gradient -->
        <div
          class="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/25 to-transparent pointer-events-none"
        />

        <!-- Back tugmasi -->
        <div
          class="absolute top-[42px] left-4 w-8 h-8 rounded-full bg-black/35 backdrop-blur-sm flex items-center justify-center"
        >
          <n-icon size="17" color="#ffffff"><ArrowLeft24Filled /></n-icon>
        </div>

        <!-- Pin badge -->
        <div
          v-if="store.payload.is_pinned"
          class="absolute top-[42px] right-4 flex items-center gap-1 px-2 py-1 rounded-full bg-black/35 backdrop-blur-sm"
        >
          <n-icon size="11" color="#FDC700"><Pin24Filled /></n-icon>
          <span class="text-[10px] font-semibold text-white">{{ $t('newsPage.pinned') }}</span>
        </div>

        <!-- Slayder nuqtachalari -->
        <div
          v-if="media.length > 1"
          class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5"
        >
          <i
            v-for="(item, idx) in media"
            :key="item.id"
            class="rounded-full transition-all duration-200"
            :class="
              activeSlide === idx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'
            "
          />
        </div>
      </div>

      <!-- ── Kontent varag'i ───────────────────────────────────────────── -->
      <div class="relative z-10 -mt-4 rounded-t-2xl bg-white px-4 pt-4 pb-5">
        <!-- Teglar -->
        <div v-if="categoryNames.length" class="flex flex-wrap gap-1.5 mb-2.5">
          <span
            v-for="name in categoryNames"
            :key="name"
            class="px-2 py-[3px] rounded-full bg-primary/10 text-primary text-[10px] font-semibold"
          >
            {{ name }}
          </span>
        </div>

        <!-- Sarlavha -->
        <h1
          class="text-[19px] font-bold leading-snug mb-2"
          :class="translation.title ? 'text-[#101828]' : 'text-[#98A2B3] italic font-medium'"
        >
          {{ translation.title || $t('newsPage.previewEmptyTitle') }}
        </h1>

        <!-- Sana + statistika -->
        <div class="flex items-center gap-3 text-[11px] text-[#667085] mb-3">
          <span class="flex items-center gap-1">
            <n-icon size="12"><CalendarAltIcon /></n-icon>
            {{ publishedAt }}
          </span>
          <span class="flex items-center gap-1">
            <n-icon size="12"><EyeIcon /></n-icon>
            0
          </span>
        </div>

        <!-- Qisqa tavsif -->
        <p
          v-if="translation.short_description"
          class="border-l-[3px] border-primary/60 pl-3 mb-4 text-[13px] leading-relaxed text-[#475467]"
        >
          {{ translation.short_description }}
        </p>

        <!-- Kontent -->
        <div v-if="hasContent" class="mobile-news-content" v-html="sanitizedContent" />
        <p v-else class="text-[13px] italic text-[#98A2B3]">
          {{ $t('newsPage.previewEmptyContent') }}
        </p>
      </div>

      <!-- ── Reaksiya bari ─────────────────────────────────────────────── -->
      <div
        class="sticky bottom-0 z-20 flex items-center gap-5 px-4 py-3 bg-white/95 backdrop-blur border-t border-[#EAECF0]"
      >
        <span
          v-for="(r, idx) in reactions"
          :key="idx"
          class="flex items-center gap-1 text-[12px] text-[#667085]"
        >
          <n-icon size="15"><component :is="r.icon" /></n-icon>
          {{ r.count }}
        </span>
      </div>
    </UIPhoneFrame>
  </div>
</template>

<style scoped>
  /* Telefon ekrani ichida scrollbar ko'rinmasin */
  .news-preview-scroll {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .news-preview-scroll::-webkit-scrollbar {
    display: none;
  }

  /* Ekran ichi doim light palette — admin panel dark rejimda bo'lsa ham */
  .mobile-news-content {
    font-size: 13px;
    line-height: 1.75;
    color: #344054;
    word-break: break-word;
  }

  .mobile-news-content :deep(h1),
  .mobile-news-content :deep(h2) {
    font-size: 15px;
    font-weight: 700;
    color: #101828;
    margin: 1.25rem 0 0.5rem;
  }

  .mobile-news-content :deep(h3) {
    font-size: 14px;
    font-weight: 600;
    color: #101828;
    margin: 1rem 0 0.4rem;
  }

  .mobile-news-content :deep(p),
  .mobile-news-content :deep(li) {
    white-space: pre-wrap;
  }

  .mobile-news-content :deep(p) {
    margin-bottom: 0.75rem;
  }

  .mobile-news-content :deep(ul),
  .mobile-news-content :deep(ol) {
    padding-left: 1.25rem;
    margin-bottom: 0.75rem;
    list-style: revert;
  }

  .mobile-news-content :deep(li) {
    margin-bottom: 0.3rem;
  }

  .mobile-news-content :deep(blockquote) {
    border-left: 3px solid var(--primary-color);
    padding: 0.6rem 0.9rem;
    margin: 1rem 0;
    background: rgba(18, 121, 240, 0.06);
    border-radius: 0 0.375rem 0.375rem 0;
    font-style: italic;
  }

  .mobile-news-content :deep(strong) {
    font-weight: 700;
    color: #101828;
  }

  .mobile-news-content :deep(a) {
    color: var(--primary-color);
    text-decoration: underline;
  }

  .mobile-news-content :deep(img),
  .mobile-news-content :deep(video) {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    margin: 0.5rem 0;
  }

  .mobile-news-content :deep(table) {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }

  .mobile-news-content :deep(td),
  .mobile-news-content :deep(th) {
    border: 1px solid #eaecf0;
    padding: 4px 6px;
  }
</style>
