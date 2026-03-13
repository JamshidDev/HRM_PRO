<script setup>
  import { NIcon } from 'naive-ui'
  import {
    CalendarClock16Regular,
    ArrowRight24Filled,
    Play24Filled,
    DocumentEdit24Regular,
    Globe24Regular,
    Archive24Regular,
    Pin24Filled,
    Pin24Regular,
    Eye24Regular,
    ThumbLike16Regular,
    ThumbDislike16Regular,
    Delete24Regular,
    Edit24Regular,
    Image24Regular
  } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'
  import { AppPaths } from '@/utils/index.js'
  import { useRouter } from 'vue-router'
  import i18n from '@/i18n/index.js'
  import dayjs from 'dayjs'

  const MAX_TAGS = 2
  const { t } = i18n.global

  const localNews = defineModel({ type: Object, required: true })

  const emit = defineEmits(['remove'])

  const router = useRouter()

  const actionLoading = ref(false)

  // ── Translation ─────────────────────────────────────────────────────────────
  const translation = computed(() => {
    const tr = localNews.value.translations ?? []
    return tr.find((x) => x.locale === i18n.global.locale) || tr.find((x) => x.title) || tr[0] || {}
  })

  const title = computed(() => translation.value.title || '')
  const description = computed(() => translation.value.short_description || '')

  // ── Categories ───────────────────────────────────────────────────────────────
  const categories = computed(() => localNews.value.categories ?? [])
  const visibleTags = computed(() => categories.value.slice(0, MAX_TAGS))
  const hiddenTagCount = computed(() => Math.max(0, categories.value.length - MAX_TAGS))
  const getCategoryName = (cat) =>
    cat.name?.[i18n.global.locale] || Object.values(cat.name ?? {})[0] || ''

  // ── Status ───────────────────────────────────────────────────────────────────
  const statusMeta = {
    0: { icon: DocumentEdit24Regular, color: '#FDC700', labelKey: 'newsPage.statusDraft' },
    1: { icon: Globe24Regular, color: '#2dcb73', labelKey: 'newsPage.statusPublished' },
    2: { icon: Archive24Regular, color: '#94a3b8', labelKey: 'newsPage.statusArchived' }
  }

  const currentStatus = computed(() => statusMeta[localNews.value.status] ?? statusMeta[0])

  const statusDropdownOptions = computed(() =>
    Object.entries(statusMeta).map(([value, meta]) => ({
      key: Number(value),
      label: t(meta.labelKey),
      icon: () => h(NIcon, { size: 16, color: meta.color }, { default: () => h(meta.icon) })
    }))
  )

  const onStatusSelect = async (status) => {
    if (status === localNews.value.status || actionLoading.value) return
    const snapshot = { ...localNews.value }
    localNews.value = { ...localNews.value, status }
    try {
      actionLoading.value = true
      const fd = new FormData()
      fd.append('_method', 'PUT')
      fd.append('status', status)
      await $ApiService.newsService._update({ id: localNews.value.id, data: fd })
    } catch {
      localNews.value = snapshot
    } finally {
      actionLoading.value = false
    }
  }

  // ── Pin toggle ───────────────────────────────────────────────────────────────
  const onPinToggle = async () => {
    if (actionLoading.value) return
    const snapshot = { ...localNews.value }
    const is_pinned = !localNews.value.is_pinned
    localNews.value = { ...localNews.value, is_pinned }
    try {
      actionLoading.value = true
      const fd = new FormData()
      fd.append('_method', 'PUT')
      fd.append('is_pinned', is_pinned ? 1 : 0)
      await $ApiService.newsService._update({ id: localNews.value.id, data: fd })
    } catch {
      localNews.value = snapshot
    } finally {
      actionLoading.value = false
    }
  }

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const onEdit = () => {
    router.push(Utils.routeChatPathMaker(`${AppPaths.News}/${localNews.value.id}`))
  }

  // ── Delete ───────────────────────────────────────────────────────────────────
  const onDeleteConfirmed = async () => {
    try {
      actionLoading.value = true
      await $ApiService.newsService._delete({ id: localNews.value.id })
      emit('remove', localNews.value.id)
    } finally {
      actionLoading.value = false
    }
  }

  // ── Media slider ─────────────────────────────────────────────────────────────
  const DOC_EXTS = ['pdf', 'doc', 'docx']
  const media = computed(() =>
    (localNews.value.media ?? []).filter(
      (item) => !DOC_EXTS.includes(item.path?.split('.').pop()?.toLowerCase() ?? '')
    )
  )
  const currentMediaIndex = ref(0)
  const isHovered = ref(false)
  let hoverInterval = null

  const currentMedia = computed(() => media.value[currentMediaIndex.value] ?? null)
  const isVideo = computed(() => currentMedia.value?.type === 'video')

  const onMouseEnter = () => {
    isHovered.value = true
    if (media.value.length <= 1) return
    hoverInterval = setInterval(() => {
      currentMediaIndex.value = (currentMediaIndex.value + 1) % media.value.length
    }, 1500)
  }

  const onMouseLeave = () => {
    isHovered.value = false
    clearInterval(hoverInterval)
    hoverInterval = null
    currentMediaIndex.value = 0
  }

  onUnmounted(() => clearInterval(hoverInterval))
</script>

<template>
  <div
    class="rounded-lg border border-surface-line bg-surface-section overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- ── Media ──────────────────────────────────────── -->
    <div class="relative overflow-hidden h-48 shrink-0">
      <img
        v-if="currentMedia && !isVideo"
        :src="currentMedia.path"
        :alt="title"
        class="w-full h-full object-cover transition-transform duration-500"
        :class="{ 'scale-105': isHovered }"
      />
      <video
        v-else-if="currentMedia && isVideo"
        :key="currentMedia.path"
        :src="currentMedia.path"
        muted
        loop
        playsinline
        autoplay
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex flex-col items-center justify-center gap-2">
        <n-icon size="36" class="text-primary/40"><Image24Regular /></n-icon>
        <span class="text-xs text-primary/40 font-medium">{{ $t('newsPage.noMedia') }}</span>
      </div>

      <!-- Video play indicator -->
      <div
        v-if="currentMedia?.type === 'video' && !isHovered"
        class="absolute inset-0 flex items-center justify-center"
      >
        <div class="w-10 h-10 rounded-full bg-dark/50 flex items-center justify-center">
          <n-icon size="18" class="text-white"><Play24Filled /></n-icon>
        </div>
      </div>

      <!-- Media dots -->
      <div v-if="media.length > 1" class="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
        <div
          v-for="(_, i) in media"
          :key="i"
          class="h-1.5 rounded-full transition-all duration-300"
          :class="i === currentMediaIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'"
        />
      </div>

      <!-- Pin indicator (top-left, only if pinned) -->
      <div
        v-if="localNews.is_pinned"
        class="absolute top-2 left-2 z-20 p-1.5 rounded-full bg-dark/60 backdrop-blur-sm"
      >
        <Pin24Filled class="text-[#FDC700] size-[11px]" />
      </div>

      <!-- Status dropdown badge (top-right) -->
      <n-dropdown
        :options="statusDropdownOptions"
        trigger="click"
        placement="bottom-end"
        @select="onStatusSelect"
      >
        <div
          class="absolute top-2 right-2 z-20 flex items-center gap-1 px-2 py-1 rounded-full bg-dark/60 backdrop-blur-sm cursor-pointer hover:bg-dark/80 transition-colors select-none"
          @click.stop
        >
          <n-icon size="11" :color="currentStatus.color">
            <component :is="currentStatus.icon" />
          </n-icon>
          <span class="text-[11px] font-semibold" :style="{ color: currentStatus.color }">
            {{ $t(currentStatus.labelKey) }}
          </span>
        </div>
      </n-dropdown>

      <!-- Gradient + title overlay -->
      <div
        class="z-10 absolute flex items-end inset-0 pointer-events-none"
        :class="currentMedia ? 'bg-gradient-to-b from-transparent to-dark' : ''"
      >
        <h3
          class="m-3 text-lg font-semibold line-clamp-2"
          :class="currentMedia ? 'text-white' : 'text-textColor0'"
        >
          {{ title }}
        </h3>
      </div>
    </div>

    <!-- ── Content ───────────────────────────────────── -->
    <div class="p-4 flex flex-col flex-1">
      <!-- Date -->
      <div class="flex items-center gap-1.5 text-xs text-textColor3 mb-2">
        <n-icon size="13"><CalendarClock16Regular /></n-icon>
        <span>{{
          localNews.published_at ? dayjs(localNews.published_at).format('MMM D, YYYY') : ''
        }}</span>
      </div>

      <!-- Description -->
      <p class="text-textColor1 text-sm leading-relaxed line-clamp-2 mb-3">{{ description }}</p>

      <!-- Stats -->
      <div class="flex items-center gap-3 mb-4">
        <span class="flex items-center gap-1 text-xs text-textColor3">
          <n-icon size="13"><Eye24Regular /></n-icon>
          {{ localNews.views_count ?? 0 }}
        </span>
        <span class="flex items-center gap-1 text-xs" style="color: #2dcb73">
          <n-icon size="13" color="#2dcb73"><ThumbLike16Regular /></n-icon>
          {{ localNews.likes_count ?? 0 }}
        </span>
        <span class="flex items-center gap-1 text-xs" style="color: #e7000a">
          <n-icon size="13" color="#E7000A"><ThumbDislike16Regular /></n-icon>
          {{ localNews.dislikes_count ?? 0 }}
        </span>
      </div>

      <!-- Actions row -->
      <div class="mt-auto flex items-center justify-between">
        <RouterLink
          :to="Utils.routeChatPathMaker(`${AppPaths.News}${AppPaths.View}/${localNews.id}`)"
          class="inline-flex items-center gap-1.5 text-primary font-medium text-sm hover:gap-2.5 transition-all"
          @click.stop
        >
          {{ $t('newsPage.readMore') }}
          <n-icon size="14"><ArrowRight24Filled /></n-icon>
        </RouterLink>

        <!-- Loading state -->
        <div v-if="actionLoading" class="flex items-center px-2">
          <n-spin size="tiny" />
        </div>

        <!-- Action buttons -->
        <div v-else class="flex items-center">
          <!-- Pin toggle -->
          <n-tooltip placement="top">
            <template #trigger>
              <n-button text size="small" class="!px-1.5" @click.stop="onPinToggle">
                <template #icon>
                  <n-icon size="16" :color="localNews.is_pinned ? '#FDC700' : undefined">
                    <Pin24Filled v-if="localNews.is_pinned" />
                    <Pin24Regular v-else />
                  </n-icon>
                </template>
              </n-button>
            </template>
            {{ localNews.is_pinned ? $t('newsPage.unpin') : $t('newsPage.pin') }}
          </n-tooltip>

          <!-- Edit -->
          <n-tooltip placement="top">
            <template #trigger>
              <n-button text size="small" class="!px-1.5" @click.stop="onEdit">
                <template #icon>
                  <n-icon size="16" class="text-textColor3"><Edit24Regular /></n-icon>
                </template>
              </n-button>
            </template>
            {{ $t('content.edit') }}
          </n-tooltip>

          <!-- Delete -->
          <n-popconfirm placement="top-end" @positive-click="onDeleteConfirmed">
            <template #trigger>
              <n-button text size="small" class="!px-1.5" @click.stop>
                <template #icon>
                  <n-icon size="16" color="#E7000A"><Delete24Regular /></n-icon>
                </template>
              </n-button>
            </template>
            {{ $t('content.confirmDelete') }}
          </n-popconfirm>
        </div>
      </div>
    </div>

    <!-- ── Categories ────────────────────────────────── -->
    <div
      v-if="categories.length"
      class="px-4 py-3 border-t border-surface-line bg-surface-ground flex items-center gap-1.5 flex-wrap"
    >
      <span
        v-for="(cat, index) in visibleTags"
        :key="index"
        class="px-2.5 py-0.5 text-xs font-medium bg-primary text-white rounded-full shrink-0 truncate max-w-[120px]"
      >
        {{ getCategoryName(cat) }}
      </span>
      <span
        v-if="hiddenTagCount"
        class="px-2.5 py-0.5 text-xs font-medium bg-surface-line text-textColor3 rounded-full shrink-0"
      >
        +{{ hiddenTagCount }}
      </span>
    </div>
  </div>
</template>
