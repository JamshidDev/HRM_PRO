<script setup>
  import {
    Image24Regular,
    Pin24Filled,
    Pin24Regular,
    Eye24Regular,
    Edit24Regular,
    Delete24Regular
  } from '@vicons/fluent'
  import { useRouter } from 'vue-router'
  import { UITable } from '@/components/index.js'
  import { useNewsStore } from '@/store/modules/index.js'
  import { AppPaths } from '@/utils/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'
  import finishIcon from '@/assets/icons/finish.svg'
  import folderIcon from '@/assets/icons/folder.svg'
  import boxArchiveIcon from '@/assets/icons/boxArchive.svg'
  import EyeIcon from '@/assets/icons/eye.svg'
  import LikeIcon from '@/assets/icons/Like.svg'
  import CommentIcon from '@/assets/icons/comment.svg'

  const { t } = i18n.global
  const router = useRouter()
  const store = useNewsStore()

  // ── Translation helpers ───────────────────────────────────────────────────
  const translationOf = (row) => {
    const tr = row.translations ?? []
    return tr.find((x) => x.locale === i18n.global.locale) || tr.find((x) => x.title) || tr[0] || {}
  }
  const titleOf = (row) => translationOf(row).title || ''
  const descriptionOf = (row) => translationOf(row).short_description || ''

  // ── Media (photo + count badge) ───────────────────────────────────────────
  const DOC_EXTS = ['pdf', 'doc', 'docx']
  const viewableMedia = (row) =>
    (row.media ?? []).filter(
      (m) => !DOC_EXTS.includes(m.path?.split('.').pop()?.toLowerCase() ?? '')
    )
  const firstMediaPath = (row) => viewableMedia(row)[0]?.path ?? null
  const extraMediaCount = (row) => Math.max(0, viewableMedia(row).length - 1)

  // ── Status ─────────────────────────────────────────────────────────────────
  const statusMeta = {
    0: {
      icon: folderIcon,
      color: '#98A2B3',
      bg: 'rgba(152, 162, 179, 0.12)',
      labelKey: 'newsPage.statusDraft'
    },
    1: {
      icon: finishIcon,
      color: '#00A652',
      bg: 'rgba(0, 166, 82, 0.12)',
      labelKey: 'newsPage.statusPublished'
    },
    2: {
      icon: boxArchiveIcon,
      color: '#667085',
      bg: 'rgba(102, 112, 133, 0.12)',
      labelKey: 'newsPage.statusArchived'
    }
  }
  const metaOf = (row) => statusMeta[row.status] ?? statusMeta[0]

  const statusDropdownOptions = computed(() =>
    Object.entries(statusMeta).map(([value, meta]) => ({
      key: Number(value),
      label: t(meta.labelKey)
    }))
  )

  const statusUpdatingId = ref(null)
  const onStatusChange = async (row, status) => {
    if (status === row.status || statusUpdatingId.value) return
    const prev = row.status
    row.status = status
    statusUpdatingId.value = row.id
    try {
      const fd = new FormData()
      fd.append('_method', 'PUT')
      fd.append('status', status)
      await $ApiService.newsService._update({ id: row.id, data: fd })
    } catch {
      row.status = prev
    } finally {
      statusUpdatingId.value = null
    }
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const formatCount = (n) => {
    n = n ?? 0
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return `${n}`
  }

  // ── Row actions ──────────────────────────────────────────────────────────
  const onView = (row) =>
    router.push(Utils.routeChatPathMaker(`${AppPaths.News}${AppPaths.View}/${row.id}`))
  const onEdit = (row) => router.push(Utils.routeChatPathMaker(`${AppPaths.News}/${row.id}`))

  const pinLoadingId = ref(null)
  const onPinToggle = async (row) => {
    if (pinLoadingId.value) return
    const next = !row.is_pinned
    pinLoadingId.value = row.id
    try {
      const fd = new FormData()
      fd.append('_method', 'PUT')
      fd.append('is_pinned', next ? 1 : 0)
      await $ApiService.newsService._update({ id: row.id, data: fd })
      row.is_pinned = next
      store.list = store.list
        .slice()
        .sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned))
    } finally {
      pinLoadingId.value = null
    }
  }

  const onDelete = async (row) => {
    await $ApiService.newsService._delete({ id: row.id })
    store.list = store.list.filter((i) => i.id !== row.id)
    store.totalItems--
  }

  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye24Regular),
      action: onView
    },
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit24Regular),
      action: onEdit
    },
    {
      label: (row) => (row.is_pinned ? t('newsPage.unpin') : t('newsPage.pin')),
      key: 'pin',
      icon: (row) => UIHelper.renderIcon(row.is_pinned ? Pin24Filled : Pin24Regular),
      action: onPinToggle
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete24Regular),
      action: onDelete
    }
  ])

  const columns = computed(() => [
    { key: 'media', title: t('newsPage.image'), width: 80 },
    { key: 'title', title: t('content.title'), minWidth: 200 },
    { key: 'short_description', title: t('newsPage.shortDescription'), minWidth: 260 },
    { key: 'published_at', title: t('content.date'), width: 120 },
    { key: 'status', title: t('content.status'), width: 170 },
    { key: 'statistics', title: t('newsPage.statistics'), width: 180 }
  ])

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }
</script>

<template>
  <UITable
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="chat-news"
    @change-page="changePage"
    @row-click="onView"
  >
    <template #cell-media="{ row }">
      <div class="media-thumb relative w-14 h-9 shrink-0">
        <img
          v-if="firstMediaPath(row)"
          :src="firstMediaPath(row)"
          class="absolute left-0 top-0 w-12 h-9 rounded-lg object-cover border border-surface-line"
          alt=""
        />
        <div
          v-else
          class="absolute left-0 top-0 w-12 h-9 rounded-lg bg-primary/10 flex items-center justify-center border border-surface-line"
        >
          <n-icon size="16" class="text-primary/40"><Image24Regular /></n-icon>
        </div>
        <span v-if="extraMediaCount(row) > 0" class="media-thumb__badge">
          +{{ extraMediaCount(row) }}
        </span>
      </div>
    </template>

    <template #cell-title="{ row }">
      <span class="text-textColor0 font-medium line-clamp-2">{{ titleOf(row) }}</span>
    </template>

    <template #cell-short_description="{ row }">
      <span class="text-textColor2 line-clamp-2">{{ descriptionOf(row) }}</span>
    </template>

    <template #cell-published_at="{ row }">
      {{ row.published_at ? Utils.timeOnlyDate(row.published_at) : '' }}
    </template>

    <template #cell-status="{ row }">
      <n-dropdown
        :options="statusDropdownOptions"
        trigger="click"
        placement="bottom-start"
        @select="(status) => onStatusChange(row, status)"
      >
        <div
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer select-none"
          :style="{ background: metaOf(row).bg }"
          @click.stop
        >
          <n-icon size="13">
            <component :is="metaOf(row).icon" />
          </n-icon>
          <span class="text-xs font-semibold" :style="{ color: metaOf(row).color }">
            {{ t(metaOf(row).labelKey) }}
          </span>
        </div>
      </n-dropdown>
    </template>

    <template #cell-statistics="{ row }">
      <div class="flex items-center gap-3 text-xs text-textColor3">
        <span class="flex items-center gap-1">
          <n-icon size="13"><EyeIcon /></n-icon>
          {{ formatCount(row.views_count) }}
        </span>
        <span class="flex items-center gap-1">
          <n-icon size="13"><LikeIcon /></n-icon>
          {{ formatCount(row.likes_count) }}
        </span>
        <span class="flex items-center gap-1">
          <n-icon size="13"><CommentIcon /></n-icon>
          {{ formatCount(row.comments_count) }}
        </span>
      </div>
    </template>
  </UITable>
</template>

<style scoped>
  .media-thumb__badge {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    min-width: 24px;
    height: 28px;
    padding: 0 6px;
    border-radius: 9999px;
    background: var(--surface-section);
    border: 1px solid var(--surface-line);
    color: var(--primary-color);
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  }
</style>
