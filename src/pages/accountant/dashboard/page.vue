<script setup>
  import { UIPageContent } from '@/components/index.js'
  import {
    Filter,
    KpiCard,
    DynamicChart,
    AlertPanel,
    FundDonut,
    ReportStatusCards
  } from './ui/index.js'
  import ReportStatusModal from '@/pages/accountant/report/ui/ReportStatusModal.vue'
  import { useAccDashboardStore, useAccountStore } from '@/store/modules/index.js'
  import { getOneMonthAgoYearMonth } from '@utils'

  const store = useAccDashboardStore()
  const accStore = useAccountStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.economistDashboard)) return
    const oneMonthAgo = getOneMonthAgoYearMonth()
    store.params.year = oneMonthAgo.year
    store.params.month = oneMonthAgo.month
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Filter />

    <n-spin :show="store.loading" class="min-h-[400px]">
      <div v-if="store.dashboardData" class="flex flex-col gap-4">
        <!-- to'rtta KPI karta -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard v-for="card in store.kpiCards" :key="card.variant" :data="card" />
        </div>

        <!-- hisobot yuklash holati (upload-report-status summary) -->
        <ReportStatusCards v-if="accStore.checkPermission(accStore.pn.economist)" />

        <!-- moliyaviy dinamika + e'tibor markazi -->
        <div class="flex flex-col items-stretch gap-4 lg:flex-row">
          <div class="min-w-0 flex-1">
            <DynamicChart />
          </div>
          <div class="w-full shrink-0 lg:w-[264px]">
            <AlertPanel />
          </div>
        </div>

        <!-- fond tarkibi -->
        <FundDonut />
      </div>
    </n-spin>

    <!-- hisobot holati batafsil modali (uploadReportStore global holatiga bog'langan) -->
    <ReportStatusModal />
  </UIPageContent>
</template>
