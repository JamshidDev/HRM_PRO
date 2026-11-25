<script setup>
  import { UITable, UIProfileSection, UIProfileEmpty, UISegmentTabs } from '@/components/index.js'
  import { useWorkerProfileStore } from '@/store/modules/index.js'
  import { openSafeUrl } from '@/utils/sanitize.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  /** Xodimning tasdiqlangan hujjatlari — qaysi korxonada tuzilgan bo'lsa ham. */
  const { t } = i18n.global
  const store = useWorkerProfileStore()

  const KINDS = ['commands', 'contracts', 'contract-additional', 'worker-application', 'documents']

  const kindTabs = computed(() =>
    KINDS.map((k) => {
      const n = store.docs.counts?.[k]
      return {
        id: k,
        name: n
          ? `${t(`workerProfile.documents.kinds.${k}`)} · ${n}`
          : t(`workerProfile.documents.kinds.${k}`)
      }
    })
  )

  const columns = computed(() => [
    { key: 'type_name', title: t('workerProfile.documents.type'), minWidth: 260 },
    { key: 'number', title: t('workerProfile.documents.number'), width: 140 },
    { key: 'date', title: t('workerProfile.documents.date'), width: 130 },
    { key: 'organization', title: t('workerProfile.documents.organization'), minWidth: 220 }
  ])

  const load = () => store._documents()

  const onKind = (k) => {
    store.docs.kind = k
    store.docs.page = 1
    load()
  }

  // Pagination {page, per_page} yuboradi.
  const onPage = ({ page, per_page }) => {
    store.docs.page = page
    if (per_page) store.docs.perPage = per_page
    load()
  }

  // Qator bosilsa — imzolangan PDF yangi oynada.
  const onRow = (row) => {
    if (row?.pdf) openSafeUrl(row.pdf)
  }

  onMounted(() => {
    store.docs.page = 1
    load()
  })
</script>

<template>
  <div class="flex flex-col gap-5 w-full">
    <UIProfileSection :title="$t('workerProfile.documents.title')" :addable="false">
      <template #trailing>
        <span class="text-sm text-fig-text-secondary">{{
          $t('workerProfile.documents.hint')
        }}</span>
      </template>
      <div class="mb-3 overflow-x-auto">
        <UISegmentTabs
          :tabs="kindTabs"
          :model-value="store.docs.kind"
          @update:model-value="onKind"
        />
      </div>
      <UITable
        auto-height
        :columns="columns"
        :data="store.docs.list"
        :loading="store.docs.loading"
        :page="store.docs.page"
        :per-page="store.docs.perPage"
        :total="store.docs.total"
        :row-class-name="(row) => (row.pdf ? 'cursor-pointer' : '')"
        @row-click="onRow"
        @change-page="onPage"
      >
        <template #empty><UIProfileEmpty /></template>
        <template #cell-number="{ row }">{{ row.number ? `№${row.number}` : '—' }}</template>
        <template #cell-date="{ row }">{{ Utils.timeOnlyDate(row.date) }}</template>
      </UITable>
    </UIProfileSection>
  </div>
</template>
