<script setup>
  import {
    CalendarClock16Regular,
    Document24Regular,
    ArrowLeft24Regular,
    Image24Regular,
    Video24Regular,
    ArrowDownload24Regular,
    Eye24Regular,
    Tag24Regular,
    Play24Regular,
    DocumentEdit24Regular,
    Globe24Regular,
    Archive24Regular,
    Pin24Filled,
    ThumbLike16Regular,
    ThumbDislike16Regular,
    Chat24Regular
  } from '@vicons/fluent'
  import { useRoute, useRouter } from 'vue-router'
  import { useNewsStore } from '@/store/modules/index.js'
  import { AppPaths } from '@/utils/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import dayjs from 'dayjs'

  const getCategoryName = (cat) => cat.name?.[i18n.global.locale] || Object.values(cat.name ?? {})[0] || ''

  const route = useRoute()
  const router = useRouter()
  const store = useNewsStore()

  const goBack = () => router.push(Utils.routeChatPathMaker(AppPaths.News))

  onMounted(async () => {
    const isAvailable = await store._show(route.params.id)
    if (!isAvailable) goBack()
  })

  const news = computed(() => store.instance)

  const translation = computed(() => {
    const tr = news.value?.translations ?? []
    return tr.find((t) => t.locale === i18n.global.locale) || tr.find((t) => t.title) || tr[0] || {}
  })


  const sortedMedia = computed(() =>
    [...(news.value?.media ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  )

  const activeMediaIndex = ref(0)
  const showGallery = ref(false)
  const activeMedia = computed(() => sortedMedia.value[activeMediaIndex.value])

  const mediaIcon = (type) => (type === 'video' ? Video24Regular : Image24Regular)
  const mediaColor = (type) => (type === 'video' ? '#E7000A' : '#74788d')

  const statusMeta = {
    0: { icon: DocumentEdit24Regular, color: '#FDC700', labelKey: 'newsPage.statusDraft' },
    1: { icon: Globe24Regular, color: '#2dcb73', labelKey: 'newsPage.statusPublished' },
    2: { icon: Archive24Regular, color: '#74788d', labelKey: 'newsPage.statusArchived' }
  }
  const currentStatus = computed(() => statusMeta[news.value?.status] ?? statusMeta[0])
</script>

<template>
  <div class="min-h-screen bg-surface-ground">
    <!-- Back Button -->
    <div class="max-w-6xl mx-auto px-6 pt-6">
      <button
        class="cursor-pointer inline-flex items-center gap-2 text-sm text-textColor3 hover:text-primary transition-colors group"
        @click="goBack"
      >
        <n-icon size="18" class="group-hover:-translate-x-1 transition-transform">
          <ArrowLeft24Regular />
        </n-icon>
        {{ $t('newsPage.backToNews') }}
      </button>
    </div>

    <n-spin :show="store.loading">
    <!-- ── Hero Media ───────────────────────────────────────────────────────── -->
    <div v-if="sortedMedia.length" class="max-w-6xl mx-auto px-6 mt-4">
      <div class="relative rounded-2xl overflow-hidden shadow-xl">
        <!-- Main display -->
        <div class="relative h-[480px] bg-surface-section overflow-hidden">
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
          <div
            class="absolute top-4 right-4 px-3 py-1.5 bg-dark/60 backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1.5"
          >
            <n-icon size="13">
              <component :is="mediaIcon(activeMedia.type)" />
            </n-icon>
            {{ activeMediaIndex + 1 }} / {{ sortedMedia.length }}
          </div>

          <!-- Gallery button -->
          <button
            @click="showGallery = true"
            class="absolute top-4 left-4 px-3 py-1.5 bg-dark/60 backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1.5 hover:bg-dark/80 transition-colors"
          >
            <n-icon size="13"><Eye24Regular /></n-icon>
            {{ $t('newsPage.viewAll') }}
          </button>
        </div>

        <!-- Thumbnail strip -->
        <div
          v-if="sortedMedia.length > 1"
          class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
        >
          <button
            v-for="(item, idx) in sortedMedia"
            :key="item.id"
            @click="activeMediaIndex = idx"
            class="h-14 w-20 rounded-lg overflow-hidden border-2 transition-all duration-200 shrink-0 relative"
            :class="
              activeMediaIndex === idx
                ? 'border-primary scale-105 shadow-lg'
                : 'border-white/40 opacity-60 hover:opacity-100'
            "
          >
            <img v-if="item.type === 'image'" :src="item.path" class="w-full h-full object-cover" />
            <template v-else>
              <video :src="item.path" class="w-full h-full object-cover" preload="metadata" muted />
              <div class="absolute inset-0 flex items-center justify-center bg-dark/40">
                <n-icon size="18" color="#ffffff"><Play24Regular /></n-icon>
              </div>
            </template>
          </button>
        </div>
      </div>
    </div>

    <!-- ── Content Area ────────────────────────────────────────────────────── -->
    <div class="max-w-6xl mx-auto px-6 py-8">
      <div class="flex gap-8 items-start">
        <!-- ── Article ───────────────────────────────────────────────────── -->
        <article class="flex-1 min-w-0">
          <!-- Categories -->
          <div v-if="news?.categories?.length" class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="cat in news.categories"
              :key="cat.id"
              class="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full"
            >
              <n-icon size="11"><Tag24Regular /></n-icon>
              {{ getCategoryName(cat) }}
            </span>
          </div>

          <!-- Title -->
          <h1 class="text-3xl font-bold text-textColor0 leading-tight mb-5">
            {{ translation.title }}
          </h1>

          <!-- Meta row: date · status · pin · reactions -->
          <div class="flex flex-wrap items-center gap-3 mb-8 pb-8 border-b border-surface-line">
            <!-- Date -->
            <div class="flex items-center gap-1.5 text-sm text-textColor3">
              <n-icon size="15"><CalendarClock16Regular /></n-icon>
              {{ news?.published_at ? dayjs(news.published_at).format('MMMM D, YYYY HH:mm') : '' }}
            </div>

            <!-- Status badge -->
            <div
              v-if="currentStatus"
              class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-section border border-surface-line"
            >
              <n-icon size="12" :color="currentStatus.color">
                <component :is="currentStatus.icon" />
              </n-icon>
              <span class="text-xs font-semibold" :style="{ color: currentStatus.color }">
                {{ $t(currentStatus.labelKey) }}
              </span>
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
            <div class="flex items-center gap-4 ml-auto">
              <span class="flex items-center gap-1 text-sm text-textColor3">
                <n-icon size="15"><Eye24Regular /></n-icon>
                {{ news?.views_count ?? 0 }}
              </span>
              <span class="flex items-center gap-1 text-sm" style="color: #2dcb73">
                <n-icon size="15" color="#2dcb73"><ThumbLike16Regular /></n-icon>
                {{ news?.likes_count ?? 0 }}
              </span>
              <span class="flex items-center gap-1 text-sm" style="color: #e7000a">
                <n-icon size="15" color="#E7000A"><ThumbDislike16Regular /></n-icon>
                {{ news?.dislikes_count ?? 0 }}
              </span>
              <span class="flex items-center gap-1 text-sm text-textColor3">
                <n-icon size="15"><Chat24Regular /></n-icon>
                {{ news?.comments_count ?? 0 }}
              </span>
            </div>
          </div>

          <!-- HTML content -->
          <div class="news-content text-textColor0">
            <span v-html="translation.content" />
          </div>
        </article>

        <!-- ── Media Sidebar ──────────────────────────────────────────────── -->
        <aside v-if="sortedMedia.length" class="w-72 shrink-0 sticky top-6">
          <div
            class="bg-surface-section border border-surface-line rounded-xl overflow-hidden shadow-sm"
          >
            <!-- Header -->
            <div
              class="px-4 py-3.5 border-b border-surface-line bg-surface-ground/60 flex items-center gap-2"
            >
              <n-icon size="16" class="text-primary"><Document24Regular /></n-icon>
              <h3 class="text-sm font-semibold text-textColor0 flex-1">{{ $t('newsPage.media') }}</h3>
              <span class="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                {{ sortedMedia.length }}
              </span>
            </div>

            <!-- Media list -->
            <ul class="divide-y divide-surface-line">
              <li
                v-for="(item, idx) in sortedMedia"
                :key="item.id"
                class="flex items-center gap-3 px-4 py-3 hover:bg-surface-ground/50 transition-colors group cursor-pointer"
                @click="
                  () => {
                    activeMediaIndex = idx
                    showGallery = false
                  }
                "
              >
                <span class="text-xs font-bold text-textColor3 w-4 shrink-0 tabular-nums">
                  {{ idx + 1 }}
                </span>
                <n-icon size="20" :color="mediaColor(item.type)" class="shrink-0">
                  <component :is="mediaIcon(item.type)" />
                </n-icon>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-textColor0 leading-snug">
                    {{ item.type === 'video' ? $t('newsPage.video') : $t('newsPage.image') }} #{{ idx + 1 }}
                  </p>
                </div>
                <n-icon
                  size="15"
                  class="text-textColor3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <ArrowDownload24Regular />
                </n-icon>
              </li>
            </ul>

            <!-- Download all -->
            <div class="px-4 py-3 border-t border-surface-line">
              <n-button type="primary" ghost size="small" class="w-full">
                <template #icon><ArrowDownload24Regular /></template>
                {{ $t('newsPage.downloadAll') }}
              </n-button>
            </div>
          </div>
        </aside>
      </div>
    </div>

    </n-spin>

    <!-- ── Gallery Modal ──────────────────────────────────────────────────── -->
    <n-modal v-model:show="showGallery" :mask-closable="true">
      <div class="bg-dark rounded-2xl overflow-hidden w-[90vw] max-w-4xl mx-auto" @click.stop>
        <div class="grid grid-cols-2 gap-1 m-1 rounded-xl overflow-hidden">
          <template v-for="(item, idx) in sortedMedia" :key="item.id">
            <n-image
              v-if="item.type === 'image'"
              :src="item.path"
              object-fit="cover"
              :img-props="{
                class: 'size-full'
              }"
              class="w-full h-52"
              :class="idx === 0 && sortedMedia.length % 2 !== 0 ? 'col-span-2 h-72' : ''"
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
  </div>
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
