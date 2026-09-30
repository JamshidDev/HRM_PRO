<script setup>
  import { useSalaryControlStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useSalaryControlStore()

  // Phase 0: 1C oylik hisobotidan umumiy KPI kartalari.
  const cards = computed(() => {
    const d = store.summary ?? {}
    return [
      { key: 'employees', label: t('salaryControl.kpi.employees'), value: d.employee_count ?? 0 },
      {
        key: 'accrued',
        label: t('salaryControl.kpi.accrued'),
        value: Utils.formatNumberToMoney(d.total_accrued ?? 0)
      },
      {
        key: 'deduction',
        label: t('salaryControl.kpi.deduction'),
        value: Utils.formatNumberToMoney(d.total_deduction ?? 0)
      },
      {
        key: 'net',
        label: t('salaryControl.kpi.net'),
        value: Utils.formatNumberToMoney(d.total_net ?? 0)
      },
      { key: 'orgs', label: t('salaryControl.kpi.orgs'), value: d.org_count ?? 0 }
    ]
  })
</script>

<template>
  <n-spin :show="store.summaryLoading">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <div
        v-for="card in cards"
        :key="card.key"
        class="flex flex-col gap-2 rounded-2xl bg-fig-block px-4 py-3"
      >
        <p class="truncate text-[13px] leading-[18px] font-medium text-textColor3">
          {{ card.label }}
        </p>
        <p class="text-[20px] leading-[26px] font-semibold text-textColor1">
          {{ card.value }}
        </p>
      </div>
    </div>
  </n-spin>
</template>

<style scoped></style>
