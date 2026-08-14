<script setup>
  import {
    Document24Regular,
    Image24Regular,
    Video24Regular,
    ArrowDownload24Regular,
    Tag24Regular,
    Play24Regular,
    Pin24Filled
  } from '@vicons/fluent'
  import { useRoute, useRouter } from 'vue-router'
  import { useNewsStore } from '@/store/modules/index.js'
  import { AppPaths } from '@/utils/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import { UIBackButton } from '@/components/index.js'
  import CalendarAltIcon from '@/assets/icons/calendarAlt.svg'
  import EyeIcon from '@/assets/icons/eye.svg'
  import LikeIcon from '@/assets/icons/Like.svg'
  import DisLikeIcon from '@/assets/icons/disLike.svg'
  import CommentIcon from '@/assets/icons/comment.svg'

  const { t } = i18n.global

  const getCategoryName = (cat) =>
    cat.name?.[i18n.global.locale] || Object.values(cat.name ?? {})[0] || ''

  const route = useRoute()
  const router = useRouter()
  const store = useNewsStore()

  const goBack = () => router.push(Utils.routeChatPathMaker(AppPaths.News))

  onMounted(async () => {
    const isAvailable = await store._show(route.params.id)
    if (!isAvailable) goBack()
  })

  const news = computed(() => store.instance)

  const reactions = computed(() => [
    { icon: EyeIcon, count: news.value?.views_count ?? 0 },
    { icon: LikeIcon, count: news.value?.likes_count ?? 0 },
    { icon: DisLikeIcon, count: news.value?.dislikes_count ?? 0 },
    { icon: CommentIcon, count: news.value?.comments_count ?? 0 }
  ])

  const translation = computed(() => {
    const tr = news.value?.translations ?? []
    return tr.find((t) => t.locale === i18n.global.locale) || tr.find((t) => t.title) || tr[0] || {}
  })

  const DOC_EXTS = ['pdf', 'doc', 'docx']
  const isViewable = (item) => !DOC_EXTS.includes(item.path?.split('.').pop()?.toLowerCase() ?? '')

  const sortedMedia = computed(() =>
    [...(news.value?.media ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  )

  const sliderMedia = computed(() => sortedMedia.value.filter(isViewable))

  const activeMediaIndex = ref(0)
  const showGallery = ref(false)
  const activeMedia = computed(() => sliderMedia.value[activeMediaIndex.value])

  const getExt = (item) => item.path?.split('.').pop()?.toLowerCase() ?? ''
  const mediaIcon = (item) => {
    const ext = getExt(item)
    if (item.type === 'video') return Video24Regular
    if (DOC_EXTS.includes(ext)) return Document24Regular
    return Image24Regular
  }
  const mediaColor = (item) => {
    const ext = getExt(item)
    if (item.type === 'video') return '#E7000A'
    if (DOC_EXTS.includes(ext)) return '#1279F0'
    return '#74788d'
  }
  const hexToRgba = (hex, alpha) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  const activeMediaColor = computed(() => mediaColor(activeMedia.value ?? {}))
  const mediaLabel = (item) => {
    const ext = getExt(item)
    if (item.type === 'video') return t('newsPage.video')
    if (DOC_EXTS.includes(ext)) return ext.toUpperCase()
    return t('newsPage.image')
  }

  const downloadAll = async () => {
    for (let i = 0; i < sortedMedia.value.length; i++) {
      Utils.downloadFileByUrl(sortedMedia.value[i].path, '_blank')
    }
  }
</script>

<template>
  <UIPageContent>
    <!-- Back Button -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 pt-4 w-full">
      <UIBackButton @click="goBack" />
    </div>

    <n-spin :show="store.loading">
      <!-- ── Title + Meta ─────────────────────────────────────────────────────── -->
      <div class="max-w-6xl mx-auto px-4 sm:px-6 mt-4">
        <!-- Title -->
        <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-textColor0 leading-tight mb-4">
          {{ translation.title }}
        </h1>

        <!-- Meta row: date · status · pin · reactions · categories -->
        <div
          class="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-3 mb-6 pb-6 border-b border-surface-line"
          style="color: #344054"
        >
          <!-- Date -->
          <div class="flex items-center gap-1.5 text-sm">
            <n-icon size="15"><CalendarAltIcon /></n-icon>
            {{ news?.published_at ? Utils.timeOnlyDate(news.published_at) : '' }}
          </div>

          <!-- Pin badge -->
          <div
            v-if="news?.is_pinned"
            class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-section border border-surface-line"
          >
            <n-icon size="12" color="#FDC700"><Pin24Filled /></n-icon>
            <span class="text-xs font-semibold text-[#FDC700]">{{ $t('newsPage.pinned') }}</span>
          </div>

          <!-- Reactions -->
          <div class="flex flex-wrap items-center gap-3 sm:gap-6">
            <span v-for="(r, idx) in reactions" :key="idx" class="flex items-center gap-1 text-sm">
              <n-icon size="15"><component :is="r.icon" /></n-icon>
              {{ r.count }}
            </span>
          </div>

          <!-- Categories -->
          <template v-if="news?.categories?.length">
            <span
              v-for="cat in news.categories"
              :key="cat.id"
              class="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full"
            >
              <n-icon size="11"><Tag24Regular /></n-icon>
              {{ getCategoryName(cat) }}
            </span>
          </template>
        </div>
      </div>

      <!-- ── Hero Media ───────────────────────────────────────────────────────── -->
      <div v-if="sliderMedia.length" class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="relative rounded-2xl overflow-hidden shadow-xl group">
          <!-- Main display -->
          <div class="relative h-[220px] sm:h-[340px] md:h-[460px] lg:h-[580px] bg-surface-section overflow-hidden">
            <img
              v-if="activeMedia.type === 'image'"
              :src="activeMedia.path"
              :alt="translation.title"
              class="w-full h-full object-cover transition-all duration-500"
            />
            <video
              v-else
              :src="activeMedia.path"
              :key="activeMedia.id"
              class="w-full h-full object-cover"
              controls
              preload="metadata"
            />

            <!-- Gradient overlay (only for images) -->
            <div
              v-if="activeMedia.type === 'image'"
              class="absolute inset-0 bg-gradient-to-t from-dark/70 via-dark/15 to-transparent pointer-events-none"
            />

            <!-- Counter -->
            <!-- <div
              class="absolute top-4 right-4 px-3 py-1.5 bg-dark/60 backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1.5"
            >
              <n-icon size="16">
                <component :is="mediaIcon(activeMedia.type)" />
              </n-icon>
              {{ activeMediaIndex + 1 }} / {{ sliderMedia.length }}
            </div> -->

            <!-- Gallery button -->
            <!-- <button
              @click="showGallery = true"
              class="absolute top-4 left-4 px-3 py-1.5 bg-dark/60 backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1.5 hover:bg-dark/80 transition-colors"
            >
              <n-icon size="13"><EyeIcon /></n-icon>
              {{ $t('newsPage.viewAll') }}
            </button> -->
          </div>

          <!-- Thumbnail strip (shown on hover of the main display) -->
          <div
            v-if="sliderMedia.length > 1"
            class="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 w-full sm:w-auto px-2 sm:px-0 max-w-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300"
          >
            <div
              class="flex gap-2 sm:gap-4 border backdrop-blur-sm rounded-2xl p-2 sm:p-4 shadow-lg overflow-x-auto"
              :style="{
                backgroundColor: hexToRgba(activeMediaColor, 0.15),
                borderColor: hexToRgba(activeMediaColor, 0.6)
              }"
            >
              <button
                v-for="(item, idx) in sliderMedia"
                :key="item.id"
                @click="activeMediaIndex = idx"
                class="h-14 w-24 sm:h-20 sm:w-36 rounded-xl overflow-hidden border-[1px] transition-all duration-200 shrink-0 relative"
                :class="
                  activeMediaIndex === idx
                    ? 'border-primary scale-105 shadow-lg'
                    : 'border-transparent opacity-60 hover:opacity-100'
                "
              >
                <img
                  v-if="item.type === 'image'"
                  :src="item.path"
                  class="w-full h-full object-cover cursor-pointer"
                />
                <template v-else>
                  <video
                    :src="item.path"
                    class="w-full h-full object-cover cursor-pointer"
                    preload="metadata"
                    muted
                  />
                  <div class="absolute inset-0 flex items-center justify-center bg-dark/40">
                    <n-icon size="18" color="#ffffff"><Play24Regular /></n-icon>
                  </div>
                </template>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Content Area ────────────────────────────────────────────────────── -->
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div class="flex flex-col sm:flex-row gap-8 items-start">
          <!-- ── Article ───────────────────────────────────────────────────── -->
          <article class="flex-1 min-w-0">
            <!-- HTML content -->
            <div class="news-content text-textColor0">
              <span v-html="translation.content" />
            </div>
          </article>

          <!-- ── Media Sidebar (disabled for now — see ViewPage.vue script) ────
          <aside v-if="sortedMedia.length" class="w-72 shrink-0 sticky top-6">
            <div
              class="bg-surface-section border border-surface-line rounded-xl overflow-hidden shadow-sm"
            >
              <div
                class="px-4 py-3.5 border-b border-surface-line bg-surface-ground/60 flex items-center gap-2"
              >
                <n-icon size="16" class="text-primary"><Document24Regular /></n-icon>
                <h3 class="text-sm font-semibold text-textColor0 flex-1">
                  {{ $t('newsPage.media') }}
                </h3>
                <span class="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                  {{ sortedMedia.length }}
                </span>
              </div>

              <ul class="divide-y divide-surface-line">
                <li
                  v-for="(item, idx) in sortedMedia"
                  :key="item.id"
                  class="flex items-center gap-3 px-4 py-3 hover:bg-surface-ground/50 transition-colors group"
                >
                  <span class="text-xs font-bold text-textColor3 w-4 shrink-0 tabular-nums">
                    {{ idx + 1 }}
                  </span>
                  <n-icon size="20" :color="mediaColor(item)" class="shrink-0">
                    <component :is="mediaIcon(item)" />
                  </n-icon>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-medium text-textColor0 leading-snug">
                      {{ mediaLabel(item) }} #{{ idx + 1 }}
                    </p>
                  </div>
                  <n-icon
                    @click="() => Utils.downloadFileByUrl(item.path, '_blank')"
                    class="size-[15px] text-textColor3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <ArrowDownload24Regular />
                  </n-icon>
                </li>
              </ul>

              <div class="px-4 py-3 border-t border-surface-line">
                <n-button type="primary" ghost size="small" class="w-full" @click="downloadAll">
                  <template #icon><ArrowDownload24Regular /></template>
                  {{ $t('newsPage.downloadAll') }}
                </n-button>
              </div>
            </div>
          </aside>
          ─────────────────────────────────────────────────────────────────── -->
        </div>
      </div>
    </n-spin>

    <!-- ── Gallery Modal ──────────────────────────────────────────────────── -->
    <n-modal v-model:show="showGallery" :mask-closable="true">
      <div class="bg-dark rounded-2xl overflow-hidden w-[90vw] max-w-4xl mx-auto" @click.stop>
        <div class="grid grid-cols-2 gap-1 m-1 rounded-xl overflow-hidden">
          <template v-for="(item, idx) in sliderMedia" :key="item.id">
            <n-image
              v-if="item.type === 'image'"
              :src="item.path"
              object-fit="cover"
              :img-props="{
                class: 'size-full'
              }"
              class="w-full h-52"
              :class="idx === 0 && sliderMedia.length % 2 !== 0 ? 'col-span-2 h-72' : ''"
            />
            <video
              v-else
              :src="item.path"
              controls
              preload="metadata"
              class="w-full h-52 object-cover bg-black"
              :class="idx === 0 && sortedMedia.length % 2 !== 0 ? 'col-span-2 h-72' : ''"
            />
          </template>
        </div>
      </div>
    </n-modal>
  </UIPageContent>
</template>

<style scoped>
  .news-content {
    line-height: 1.85;
    font-size: 0.9375rem;
  }

  .news-content :deep(h2) {
    font-size: 1.3rem;
    font-weight: 700;
    margin: 2rem 0 0.75rem;
  }

  .news-content :deep(h3) {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 1.5rem 0 0.5rem;
  }

  .news-content :deep(p) {
    margin-bottom: 1rem;
    white-space: pre-wrap;
  }

  .news-content :deep(ul),
  .news-content :deep(ol) {
    padding-left: 1.5rem;
    margin-bottom: 1.25rem;
  }

  .news-content :deep(li) {
    margin-bottom: 0.4rem;
  }

  .news-content :deep(blockquote) {
    border-left: 4px solid var(--primary-color);
    padding: 0.85rem 1.25rem;
    margin: 1.75rem 0;
    background: rgba(18, 121, 240, 0.06);
    border-radius: 0 0.5rem 0.5rem 0;
    font-style: italic;
  }

  .news-content :deep(strong) {
    font-weight: 700;
  }

  .news-content :deep(img) {
    max-width: 100%;
    border-radius: 0.5rem;
    margin: 0.75rem 0;
  }
</style>
