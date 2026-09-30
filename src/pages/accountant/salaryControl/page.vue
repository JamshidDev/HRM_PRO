<script setup>
  import { UIPageContent } from '@/components/index.js'
  import { useAccountStore, useSalaryControlStore } from '@/store/modules/index.js'
  import { getOneMonthAgoYearMonth } from '@utils'
  import Filter from './ui/Filter.vue'
  import SummaryCards from './ui/SummaryCards.vue'
  import RiskMap from './ui/RiskMap.vue'

  const store = useSalaryControlStore()
  const accStore = useAccountStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.economistSalaryControlRead)) return
    const oneMonthAgo = getOneMonthAgoYearMonth()
    store.params.year = oneMonthAgo.year
    store.params.month = oneMonthAgo.month
    store._summary()
  })

  const onTabChange = (v) => {
    store.mainView = v
    // «Xavflar» tabi birinchi marta ochilganda 14 ta riskni yuklaymiz.
    if (v === 'risks' && !store.risksLoaded) store._risks()
  }

  // Sarlavha ostidagi davr yozuvi (faqat ko'rsatish uchun — filtr holatini aks
  // ettiradi, hech qanday hisob-kitobsiz).
  const periodLabel = computed(() => {
    const { year, month } = store.params
    if (!year || !month) return ''
    return `${year} · ${String(month).padStart(2, '0')}`
  })
</script>

<template>
  <UIPageContent>
    <div class="mb-3 flex items-end justify-between gap-3">
      <div>
        <h1 class="text-[18px] leading-6 font-semibold text-textColor1">
          {{ $t('salaryControl.title') }}
        </h1>
        <p v-if="periodLabel" class="mt-0.5 text-[12px] leading-4 text-textColor3">
          {{ periodLabel }}
        </p>
      </div>
    </div>

    <n-tabs
      :value="store.mainView"
      @update:value="onTabChange"
      type="line"
      animated
      class="mb-2"
    >
      <n-tab-pane name="summary" :tab="$t('salaryControl.tabs.summary')" />
      <n-tab-pane name="risks" :tab="$t('salaryControl.tabs.risks')" />
      <n-tab-pane name="rules" :tab="$t('salaryControl.tabs.rules')" />
      <n-tab-pane name="who" :tab="$t('salaryControl.tabs.who')" />
      <n-tab-pane name="vids" :tab="$t('salaryControl.tabs.vids')" />
      <n-tab-pane name="deductions" :tab="$t('salaryControl.tabs.deductions')" />
      <n-tab-pane name="reports" :tab="$t('salaryControl.tabs.reports')" />
      <n-tab-pane name="employees" :tab="$t('salaryControl.tabs.employees')" />
    </n-tabs>

    <Filter />

    <template v-if="store.mainView === 'summary'">
      <SummaryCards />
    </template>
    <template v-else-if="store.mainView === 'risks'">
      <RiskMap />
    </template>
    <div v-else class="py-16 text-center text-textColor3">
      {{ $t('salaryControl.comingSoon') }}
    </div>
  </UIPageContent>
</template>

<style scoped></style>
