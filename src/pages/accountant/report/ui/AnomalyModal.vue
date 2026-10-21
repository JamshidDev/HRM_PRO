<script setup>
  // 1C pull ma'lumot sifati anomaliyalari — dubl JSHSHIR (object farqi) + kodsiz/matnli
  // paying_code (to'lov turi bo'yicha). HRM hisob-kitob xatoligi manbasini aniqlash va
  // 1C'da kodlarni to'g'rilash uchun.
  import { computed } from 'vue'
  import { UIModal } from '@/components/index.js'
  import { useUploadReportStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useUploadReportStore()

  const MONTHS = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
  ]
  const monthName = (m) => MONTHS[(Number(m) || 1) - 1] || m

  const kindOptions = computed(() => [
    { label: t('uploadReport.anomaly.all'), value: null },
    { label: t('uploadReport.anomaly.duplicatePinfl'), value: 'duplicate_pinfl' },
    { label: t('uploadReport.anomaly.missingCode'), value: 'missing_code' }
  ])

  const pageCount = computed(() =>
    Math.max(1, Math.ceil(store.anomalyTotal / store.anomalyParams.per_page))
  )

  const money = (v) => Utils.formatNumberToMoney(Number(v) || 0)
  const typeLabel = (ty) =>
    Number(ty) === 2 ? t('uploadReport.anomaly.deduction') : t('uploadReport.anomaly.accrual')
  const fieldLabel = (f) => t(`uploadReport.anomaly.field.${f}`)
</script>

<template>
  <UIModal
    :width="860"
    :visible="store.anomalyVisible"
    @update:visible="(v) => (store.anomalyVisible = v)"
    :title="$t('uploadReport.anomaly.title')"
  >
    <div class="p-4 flex flex-col gap-3">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="text-sm text-textColor2">
          <span class="font-medium">{{ store.selectedOrgName }}</span>
          <span class="text-textColor3"> · {{ monthName(store.params.month) }} {{ store.params.year }}</span>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <span class="px-2 py-0.5 rounded-full bg-error/10 text-error font-medium">
            {{ $t('uploadReport.anomaly.duplicatePinfl') }}: {{ store.anomalySummary.duplicate_pinfl }}
          </span>
          <span class="px-2 py-0.5 rounded-full bg-warning/10 text-warning font-medium">
            {{ $t('uploadReport.anomaly.missingCode') }}: {{ store.anomalySummary.missing_code }}
          </span>
        </div>
      </div>

      <n-radio-group
        :value="store.anomalyParams.kind"
        size="small"
        @update:value="store._changeAnomalyKind"
      >
        <n-radio-button v-for="o in kindOptions" :key="String(o.value)" :value="o.value" :label="o.label" />
      </n-radio-group>

      <n-spin :show="store.anomalyLoading">
        <div class="min-h-[200px] flex flex-col gap-2">
          <div
            v-if="!store.anomalyRows.length && !store.anomalyLoading"
            class="h-[200px] flex items-center justify-center text-sm text-textColor3"
          >
            {{ $t('uploadReport.anomaly.noData') }}
          </div>

          <template v-for="row in store.anomalyRows" :key="row.id">
            <!-- Dubl JSHSHIR — yozuvlar object farqi -->
            <div
              v-if="row.kind === 'duplicate_pinfl'"
              class="rounded-xl border border-error/30 bg-error/5 p-3"
            >
              <div class="flex items-center justify-between gap-2 flex-wrap">
                <div class="text-sm font-semibold">
                  {{ row.fio || '—' }}
                  <span class="text-xs text-textColor3 font-normal">JSHSHIR: {{ row.pinfl }}</span>
                </div>
                <span class="text-xs px-2 py-0.5 rounded-full bg-error/10 text-error">
                  {{ $t('uploadReport.anomaly.cameNTimes', { n: row.detail?.count ?? 2 }) }}
                </span>
              </div>
              <div v-if="row.detail?.diff_fields?.length" class="mt-1 text-xs text-textColor3">
                {{ $t('uploadReport.anomaly.diffFields') }}:
                <span class="text-error font-medium">
                  {{ row.detail.diff_fields.map(fieldLabel).join(', ') }}
                </span>
              </div>
              <div class="mt-2 overflow-x-auto">
                <table class="w-full text-xs border-collapse">
                  <thead>
                    <tr class="text-textColor3 text-left">
                      <th class="py-1 pr-2">#</th>
                      <th class="py-1 pr-2">{{ fieldLabel('tab_nomer') }}</th>
                      <th class="py-1 pr-2">{{ fieldLabel('position') }}</th>
                      <th class="py-1 pr-2 text-right">{{ fieldLabel('oklad') }}</th>
                      <th class="py-1 pr-2 text-right">{{ fieldLabel('accrual') }}</th>
                      <th class="py-1 pr-2 text-right">{{ fieldLabel('deduction') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(e, i) in row.detail?.entries ?? []" :key="i" class="border-t border-surface-line">
                      <td class="py-1 pr-2">{{ i + 1 }}</td>
                      <td class="py-1 pr-2" :class="row.detail?.diff_fields?.includes('tab_nomer') && 'text-error font-medium'">{{ e.tab_nomer || '—' }}</td>
                      <td class="py-1 pr-2" :class="row.detail?.diff_fields?.includes('position') && 'text-error font-medium'">{{ e.position || '—' }}</td>
                      <td class="py-1 pr-2 text-right">{{ money(e.oklad) }}</td>
                      <td class="py-1 pr-2 text-right" :class="row.detail?.diff_fields?.includes('accrual') && 'text-error font-medium'">{{ money(e.accrual) }}</td>
                      <td class="py-1 pr-2 text-right" :class="row.detail?.diff_fields?.includes('deduction') && 'text-error font-medium'">{{ money(e.deduction) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Kodsiz/matnli to'lov turi -->
            <div
              v-else
              class="rounded-xl border border-warning/30 bg-warning/5 p-3"
            >
              <div class="flex items-start justify-between gap-2 flex-wrap">
                <div class="min-w-0">
                  <div class="text-sm font-semibold break-words">{{ row.detail?.paying_name || row.fio || '—' }}</div>
                  <div class="mt-1 flex items-center gap-2 flex-wrap text-xs">
                    <span class="px-1.5 py-0.5 rounded bg-error/10 text-error font-medium">
                      {{ $t('uploadReport.anomaly.code') }}:
                      {{ (row.detail?.paying_code ?? '') === '' ? $t('uploadReport.anomaly.empty') : row.detail.paying_code }}
                    </span>
                    <span class="px-1.5 py-0.5 rounded bg-secondary/10 text-secondary">{{ typeLabel(row.detail?.type) }}</span>
                  </div>
                </div>
                <div class="text-right text-xs shrink-0">
                  <div class="font-semibold text-sm tabular-nums">{{ money(row.detail?.total_summa) }}</div>
                  <div class="text-textColor3">
                    {{ $t('uploadReport.anomaly.employees') }}: {{ row.detail?.employee_count ?? 0 }}
                  </div>
                </div>
              </div>
              <div v-if="row.detail?.sample?.length" class="mt-2 text-xs text-textColor3">
                {{ $t('uploadReport.anomaly.examples') }}:
                {{ row.detail.sample.map((s) => s.fio).filter(Boolean).slice(0, 5).join(', ') }}
                <span v-if="(row.detail?.employee_count ?? 0) > 5">…</span>
              </div>
            </div>
          </template>
        </div>
      </n-spin>

      <div v-if="store.anomalyTotal > store.anomalyParams.per_page" class="flex justify-end pt-1">
        <n-pagination
          :page="store.anomalyParams.page"
          :page-count="pageCount"
          @update:page="store._onAnomalyPage"
        />
      </div>
    </div>
  </UIModal>
</template>

<style scoped></style>
