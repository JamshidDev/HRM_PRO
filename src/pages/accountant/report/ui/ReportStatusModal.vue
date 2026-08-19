<script setup>
  import { computed, h } from 'vue'
  import { NTag, NIcon } from 'naive-ui'
  import { UIModal, UIYearMonth } from '@/components/index.js'
  import { useUploadReportStore } from '@/store/modules/index.js'
  import {
    Search24Regular,
    ArrowDownload20Regular,
    Checkmark16Filled,
    Dismiss16Filled
  } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useUploadReportStore()

  // Qidiruv bo'yicha filtrlangan korxonalar (nomi bo'yicha, front-side).
  const filteredRows = computed(() => {
    const q = (store.reportStatusSearch || '').trim().toLowerCase()
    if (!q) return store.reportStatusRows
    return store.reportStatusRows.filter((r) => (r.name || '').toLowerCase().includes(q))
  })

  // Tur nomlari — summary tartibida (id 1..4).
  const typeCols = computed(() => store.reportStatusSummary.map((s) => ({ id: s.id, type: s.type })))

  // Bir tur uchun hujayra: yuklangan soni (badge) + tasdiqlangan ✓/✗.
  const renderStatCell = (row, typeId) => {
    const s = (row.stats || []).find((x) => x.id === typeId)
    const count = s?.uploaded_count ?? 0
    const confirmed = s?.confirmed ?? false
    if (count === 0) {
      return h('span', { class: 'text-red-400 font-medium' }, '—')
    }
    return h('div', { class: 'flex items-center justify-center gap-1' }, [
      h(NTag, { size: 'small', round: true, type: confirmed ? 'success' : 'info' }, () => count),
      h(
        NIcon,
        {
          size: 16,
          class: confirmed ? 'text-green-500' : 'text-gray-300'
        },
        () => h(confirmed ? Checkmark16Filled : Dismiss16Filled)
      )
    ])
  }

  const columns = computed(() => {
    const cols = [
      {
        title: '№',
        key: '_index',
        width: 60,
        align: 'center',
        render: (_row, index) => index + 1
      },
      {
        title: t('uploadReport.reportStatus.organization'),
        key: 'name',
        minWidth: 260,
        ellipsis: { tooltip: true }
      }
    ]
    for (const tc of typeCols.value) {
      cols.push({
        title: tc.type,
        key: `type_${tc.id}`,
        align: 'center',
        width: 130,
        render: (row) => renderStatCell(row, tc.id)
      })
    }
    cols.push({
      title: t('uploadReport.reportStatus.overall'),
      key: 'uploaded_types',
      align: 'center',
      width: 90,
      render: (row) =>
        h(
          NTag,
          {
            size: 'small',
            round: true,
            bordered: false,
            type: row.uploaded_types >= typeCols.value.length ? 'success' : 'default'
          },
          () => `${row.uploaded_types} / ${typeCols.value.length}`
        )
    })
    return cols
  })
</script>

<template>
  <UIModal
    :width="1000"
    v-model:visible="store.reportStatusVisible"
    :title="$t('uploadReport.reportStatus.title')"
  >
    <div class="flex flex-col gap-3">
      <!-- Xulosa chiplari — har tur bo'yicha yuklagan/yuklamagan/tasdiqlagan -->
      <div v-if="store.reportStatusSummary.length" class="flex flex-wrap gap-2">
        <div
          v-for="s in store.reportStatusSummary"
          :key="s.id"
          class="flex flex-col gap-1 border border-surface-line rounded-lg px-3 py-2 min-w-[150px]"
        >
          <div class="text-sm font-medium truncate">{{ s.type }}</div>
          <div class="flex items-center gap-2 text-xs">
            <n-tag size="tiny" type="success" round>
              {{ $t('uploadReport.reportStatus.uploaded') }}: {{ s.uploaded_orgs }}
            </n-tag>
            <n-tag size="tiny" type="error" round>
              {{ $t('uploadReport.reportStatus.notUploaded') }}: {{ s.not_uploaded_orgs }}
            </n-tag>
          </div>
          <div class="text-xs text-secondary">
            {{ $t('uploadReport.reportStatus.confirmed') }}: {{ s.confirmed_orgs }}
          </div>
        </div>
      </div>

      <!-- Davr tanlash + qidiruv + eksport -->
      <div class="flex items-center gap-2">
        <div class="max-w-[170px]">
          <UIYearMonth
            v-model:year="store.reportStatusPeriod.year"
            v-model:month="store.reportStatusPeriod.month"
            :clearable="false"
            :disabled="store.reportStatusLoading"
            @change="store._changeReportPeriod()"
          />
        </div>
        <n-input
          v-model:value="store.reportStatusSearch"
          :placeholder="$t('uploadReport.reportStatus.search')"
          clearable
          class="flex-1"
        >
          <template #prefix>
            <n-icon><Search24Regular /></n-icon>
          </template>
        </n-input>
        <n-button
          type="success"
          :loading="store.reportStatusExporting"
          :disabled="store.reportStatusLoading || store.reportStatusRows.length === 0"
          @click="store._exportReportStatus()"
        >
          {{ $t('uploadReport.reportStatus.export') }}
          <template #icon>
            <ArrowDownload20Regular />
          </template>
        </n-button>
      </div>

      <!-- Jadval -->
      <n-data-table
        :columns="columns"
        :data="filteredRows"
        :loading="store.reportStatusLoading"
        :bordered="true"
        :single-line="false"
        size="small"
        max-height="440"
        :scroll-x="900"
      />
    </div>
  </UIModal>
</template>

<style scoped></style>
