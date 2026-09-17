<script setup>
  import { computed, h, onMounted } from 'vue'
  import { NTag, NIcon, NTooltip, NButton } from 'naive-ui'
  import dayjs from 'dayjs'
  import { UIModal, UIYearMonth } from '@/components/index.js'
  import { useUploadReportStore, useComponentStore } from '@/store/modules/index.js'
  import {
    Search24Regular,
    ArrowDownload20Regular,
    Info16Regular
  } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useUploadReportStore()
  const componentStore = useComponentStore()

  onMounted(() => {
    if (!componentStore.uploadTypes?.length) componentStore._enumAccountant()
  })

  // Shakl (tur) tanlagichi — «Hammasi» + 4 tur.
  const typeOptions = computed(() => [
    { label: t('uploadReport.pullHistory.allTypes'), value: null },
    ...(componentStore.uploadTypes || []).map((u) => ({ label: u.name, value: u.id }))
  ])
  const sourceOptions = computed(() => [
    { label: t('uploadReport.pullHistory.source.excel'), value: 1 },
    { label: t('uploadReport.pullHistory.source.ones'), value: 2 }
  ])
  const doneOptions = computed(() => [
    { label: t('uploadReport.pullHistory.status.process'), value: 2 },
    { label: t('uploadReport.pullHistory.status.done'), value: 3 },
    { label: t('uploadReport.pullHistory.status.error'), value: 1 }
  ])

  const pageCount = computed(() =>
    Math.max(1, Math.ceil(store.pullHistoryTotal / store.pullHistoryParams.per_page))
  )

  // done → holat badge (3=bajarildi/yashil, 2=jarayonda/sariq, 1=xato/qizil).
  const renderDone = (done) => {
    const map = {
      3: { type: 'success', key: 'done' },
      2: { type: 'warning', key: 'process' },
      1: { type: 'error', key: 'error' }
    }
    const m = map[done] ?? map[2]
    return h(NTag, { size: 'small', round: true, type: m.type }, () =>
      t(`uploadReport.pullHistory.status.${m.key}`)
    )
  }

  // 1C qayta tortish o'zgarish chiplari (faqat source=2 va sonlar bor bo'lsa).
  const renderChanges = (row) => {
    if (row.source !== 2 || row.added_count == null) {
      return h('span', { class: 'text-secondary' }, '—')
    }
    const chip = (val, type) =>
      h(NTag, { size: 'tiny', round: true, type, bordered: false }, () => String(val ?? 0))
    return h('div', { class: 'flex flex-wrap items-center gap-1' }, [
      chip(row.added_count, 'success'),
      chip(row.changed_count, 'warning'),
      chip(row.removed_count, 'error'),
      chip(row.unchanged_count, 'default')
    ])
  }

  const columns = computed(() => [
    {
      title: '№',
      key: '_index',
      width: 56,
      align: 'center',
      render: (_row, index) =>
        (store.pullHistoryParams.page - 1) * store.pullHistoryParams.per_page + index + 1
    },
    {
      title: t('uploadReport.pullHistory.columns.date'),
      key: 'created_at',
      width: 150,
      render: (row) => (row.created_at ? dayjs(row.created_at).format('YYYY-MM-DD HH:mm') : '—')
    },
    {
      title: t('uploadReport.pullHistory.columns.organization'),
      key: 'organization',
      minWidth: 220,
      ellipsis: { tooltip: true }
    },
    {
      title: t('uploadReport.pullHistory.columns.form'),
      key: 'type_name',
      width: 130,
      render: (row) => h(NTag, { size: 'small', round: true, type: 'info' }, () => row.type_name)
    },
    {
      title: t('uploadReport.pullHistory.columns.period'),
      key: 'period',
      width: 100,
      align: 'center',
      render: (row) => `${row.year}-${String(row.month).padStart(2, '0')}`
    },
    {
      title: t('uploadReport.pullHistory.columns.source'),
      key: 'source',
      width: 90,
      align: 'center',
      render: (row) =>
        h(
          NTag,
          { size: 'small', round: true, type: row.source === 2 ? 'info' : 'default' },
          () =>
            row.source === 2
              ? t('uploadReport.pullHistory.source.ones')
              : t('uploadReport.pullHistory.source.excel')
        )
    },
    {
      title: t('uploadReport.pullHistory.columns.status'),
      key: 'done',
      width: 120,
      align: 'center',
      render: (row) => renderDone(row.done)
    },
    {
      title: t('uploadReport.pullHistory.columns.changes'),
      key: 'changes',
      width: 160,
      render: (row) => renderChanges(row)
    },
    {
      title: t('uploadReport.pullHistory.columns.download'),
      key: 'file',
      width: 90,
      align: 'center',
      render: (row) =>
        row.file
          ? h(
              NButton,
              {
                size: 'small',
                quaternary: true,
                circle: true,
                onClick: () => window.open(row.file, '_blank')
              },
              () => h(NIcon, { size: 18 }, () => h(ArrowDownload20Regular))
            )
          : h('span', { class: 'text-secondary' }, '—')
    },
    {
      title: t('uploadReport.pullHistory.columns.comment'),
      key: 'comment',
      width: 70,
      align: 'center',
      render: (row) =>
        row.comment
          ? h(NTooltip, { trigger: 'hover' }, {
              trigger: () =>
                h(NIcon, { size: 18, class: 'text-amber-500 cursor-help' }, () =>
                  h(Info16Regular)
                ),
              default: () => row.comment
            })
          : h('span', { class: 'text-secondary' }, '—')
    }
  ])
</script>

<template>
  <UIModal
    :width="1080"
    height="88vh"
    v-model:visible="store.pullHistoryVisible"
    :title="$t('uploadReport.pullHistory.title')"
  >
    <div class="flex flex-col gap-3" style="height: 100%">
      <!-- Filtrlar -->
      <div class="shrink-0 flex flex-wrap items-center gap-2">
        <n-select
          v-model:value="store.pullHistoryParams.type"
          :options="typeOptions"
          :placeholder="$t('uploadReport.pullHistory.form')"
          class="min-w-[150px]"
          @update:value="store._changePullFilter()"
        />
        <div class="max-w-[160px]">
          <UIYearMonth
            v-model:year="store.pullHistoryParams.year"
            v-model:month="store.pullHistoryParams.month"
            :clearable="true"
            @change="store._changePullFilter()"
          />
        </div>
        <n-select
          v-model:value="store.pullHistoryParams.source"
          :options="sourceOptions"
          :placeholder="$t('uploadReport.pullHistory.columns.source')"
          clearable
          class="min-w-[120px]"
          @update:value="store._changePullFilter()"
        />
        <n-select
          v-model:value="store.pullHistoryParams.done"
          :options="doneOptions"
          :placeholder="$t('uploadReport.pullHistory.columns.status')"
          clearable
          class="min-w-[130px]"
          @update:value="store._changePullFilter()"
        />
        <n-input
          v-model:value="store.pullHistoryParams.search"
          :placeholder="$t('uploadReport.pullHistory.search')"
          clearable
          class="flex-1 min-w-[160px]"
          @keyup.enter="store._changePullFilter()"
          @clear="store._changePullFilter()"
        >
          <template #prefix>
            <n-icon><Search24Regular /></n-icon>
          </template>
        </n-input>
      </div>

      <!-- Jadval — qolgan balandlikni to'ldiradi, ichida vertikal skroll -->
      <div class="flex-1 min-h-0">
        <n-data-table
          :columns="columns"
          :data="store.pullHistoryRows"
          :loading="store.pullHistoryLoading"
          :bordered="true"
          :single-line="false"
          size="small"
          flex-height
          style="height: 100%"
          :scroll-x="1040"
        />
      </div>

      <!-- Paginatsiya -->
      <div class="shrink-0 flex items-center justify-between">
        <span class="text-xs text-secondary">
          {{ $t('uploadReport.pullHistory.total') }}: {{ store.pullHistoryTotal }}
        </span>
        <n-pagination
          :page="store.pullHistoryParams.page"
          :page-count="pageCount"
          :page-size="store.pullHistoryParams.per_page"
          @update:page="store._onPullHistoryPage"
        />
      </div>
    </div>
  </UIModal>
</template>

<style scoped></style>
