<script setup>
  // Lavozim oklad o'zgarish tarixi — eski→yangi, manba, sabab, hujjat, kim/qachon.
  import { Attach16Regular } from '@vicons/fluent'
  import { UIPagination, NoDataPicture } from '@/components/index.js'
  import { useDepartmentPositionStore } from '@stores'
  import { Utils } from '@utils'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useDepartmentPositionStore()

  const fmt = (v) => (v === null || v === undefined ? '—' : Utils.formatNumberToMoney(v))
  const sourceTag = (s) => {
    if (s === 'tariff_grid') return { type: 'info', label: t('departmentPositionPage.salaryHistory.srcGrid') }
    if (s === 'tariff_base') return { type: 'warning', label: t('departmentPositionPage.salaryHistory.srcBase') }
    if (s === 'coefficient') return { type: 'success', label: t('departmentPositionPage.salaryHistory.srcCoef') }
    return { type: 'default', label: t('departmentPositionPage.salaryHistory.srcManual') }
  }
  const dt = (s) => (s ? String(s).replace('T', ' ').slice(0, 16) : '—')
</script>

<template>
  <div class="min-h-[220px]">
    <n-spin :show="store.salaryHistory.loading" style="min-height: 180px">
      <div class="w-full overflow-x-auto" v-if="store.salaryHistory.list.length">
        <n-table :single-line="false" size="small">
          <thead>
            <tr>
              <th class="w-[140px]">{{ $t('departmentPositionPage.salaryHistory.date') }}</th>
              <th class="w-[110px]">{{ $t('departmentPositionPage.salaryHistory.source') }}</th>
              <th class="text-right! min-w-[220px]">{{ $t('departmentPositionPage.salaryHistory.oldNew') }}</th>
              <th class="min-w-[180px]">{{ $t('departmentPositionPage.salaryHistory.reason') }}</th>
              <th class="w-[60px] text-center!">{{ $t('departmentPositionPage.salaryHistory.document') }}</th>
              <th class="min-w-[140px]">{{ $t('departmentPositionPage.salaryHistory.changedBy') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in store.salaryHistory.list" :key="r.id">
              <td class="text-xs text-textColor3">{{ dt(r.created_at) }}</td>
              <td>
                <n-tag :type="sourceTag(r.source).type" size="tiny" round>{{ sourceTag(r.source).label }}</n-tag>
              </td>
              <td class="text-right! tnum">
                <span class="text-textColor3">{{ fmt(r.old_salary) }}</span>
                <span class="mx-1">→</span>
                <span class="font-semibold">{{ fmt(r.new_salary) }}</span>
                <span v-if="r.diff !== null" class="ml-2 text-xs"
                  :class="r.diff > 0 ? 'text-green-600' : r.diff < 0 ? 'text-red-600' : 'text-textColor3'">
                  {{ (r.diff > 0 ? '+' : '') + fmt(r.diff) }}
                </span>
              </td>
              <td class="text-xs text-textColor2">{{ r.reason || '—' }}</td>
              <td class="text-center!">
                <a v-if="r.document" :href="r.document" target="_blank" class="doc-link" :title="$t('content.download')">
                  <n-icon size="16"><Attach16Regular /></n-icon>
                </a>
                <span v-else class="text-textColor3">—</span>
              </td>
              <td class="text-xs">{{ r.changed_by_name || '—' }}</td>
            </tr>
          </tbody>
        </n-table>
      </div>
      <NoDataPicture v-if="!store.salaryHistory.loading && !store.salaryHistory.list.length"
        :description="$t('departmentPositionPage.salaryHistory.empty')" />
    </n-spin>

    <div v-if="store.salaryHistory.total > store.salaryHistory.params.per_page" class="mt-3 flex justify-end">
      <UIPagination :total="store.salaryHistory.total" :page="store.salaryHistory.params.page"
        :per_page="store.salaryHistory.params.per_page" @changePage="store.onSalaryHistoryPage" />
    </div>
  </div>
</template>

<style scoped>
  .tnum { font-variant-numeric: tabular-nums; }
  .doc-link { color: var(--primary-color); display: inline-flex; }
</style>
