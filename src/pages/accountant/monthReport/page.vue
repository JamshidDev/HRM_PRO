<script setup>
  import { UIModal, UIPageContent } from '@/components/index.js'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'
  import ExportPanel from './ui/ExportPanel.vue'
  import ThresholdPanel from './ui/ThresholdPanel.vue'
  import VedReport from './ui/VedReport.vue'
  import ViewSalary from './ui/ViewSalary.vue'
  import CompareSalary from './ui/CompareSalary.vue'
  import { useAccountStore, useMonthReportStore } from '@/store/modules/index.js'
  import { getOneMonthAgoYearMonth } from '@utils'
  import { ArrowSwap20Filled, Dismiss20Filled } from '@vicons/fluent'

  const store = useMonthReportStore()
  const route = useRoute()
  const accStore = useAccountStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.economistStatementsRead)) return
    const query = route.query
    const isHasQuery = Object.keys(route.query).length > 0
    const oneMonthAgo = getOneMonthAgoYearMonth()
    store.params.year = isHasQuery ? query.year : oneMonthAgo.year
    store.params.month = isHasQuery ? Number(query.month) : oneMonthAgo.month
    store.params.code = isHasQuery ? query.code : null
    store._index()
  })

  // Modal yopilganda taqqoslash rejimi ham tozalanadi — keyingi safar oddiy
  // ko'rinishdan boshlanadi.
  const onViewVisible = (v) => {
    store.visible = v
    if (!v) store.closeCompare()
  }
</script>

<template>
  <UIPageContent>
    <n-tabs v-model:value="store.mainView" type="line" animated class="mb-2">
      <n-tab-pane name="workers" :tab="$t('monthReport.vedReport.tabWorkers')" />
      <n-tab-pane name="ved" :tab="$t('monthReport.vedReport.tab')" />
    </n-tabs>
    <template v-if="store.mainView === 'workers'">
      <Filter />
      <Table />
    </template>
    <VedReport v-else />
    <UIModal
      :width="store.compareMode ? 1400 : 1000"
      :fullscreen-on-mobile="store.compareMode"
      :visible="store.visible"
      @update:visible="onViewVisible"
      :title="
        store.compareMode
          ? $t('monthReport.compare.title')
          : store.visibleType
            ? $t('monthReport.createTitle')
            : $t('monthReport.updateTitle')
      "
    >
      <template #header-actions>
        <n-button
          v-if="!store.compareMode"
          size="small"
          type="primary"
          secondary
          @click="store.openCompare()"
        >
          <template #icon>
            <n-icon><ArrowSwap20Filled /></n-icon>
          </template>
          <span class="hidden sm:inline">{{ $t('monthReport.compare.button') }}</span>
        </n-button>
        <n-button v-else size="small" secondary @click="store.closeCompare()">
          <template #icon>
            <n-icon><Dismiss20Filled /></n-icon>
          </template>
          <span class="hidden sm:inline">{{ $t('monthReport.compare.exit') }}</span>
        </n-button>
      </template>
      <ViewSalary v-if="!store.compareMode" />
      <CompareSalary v-else />
    </UIModal>
    <UIModal
      :width="600"
      :visible="store.exportVisible"
      @update:visible="(v) => (store.exportVisible = v)"
      :title="$t('monthReport.exportTitle')"
    >
      <ExportPanel />
    </UIModal>
    <UIModal
      :width="560"
      :visible="store.thresholdVisible"
      @update:visible="(v) => (store.thresholdVisible = v)"
      :title="$t('monthReport.threshold.title')"
    >
      <ThresholdPanel />
    </UIModal>
  </UIPageContent>
</template>
