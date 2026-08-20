<script setup>
  import { UIModal, UIPageContent } from '@/components/index.js'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'
  import ExportPanel from './ui/ExportPanel.vue'
  import ThresholdPanel from './ui/ThresholdPanel.vue'
  import VedReport from './ui/VedReport.vue'
  import ViewSalary from './ui/ViewSalary.vue'
  import { useAccountStore, useMonthReportStore } from '@/store/modules/index.js'
  import { getOneMonthAgoYearMonth } from '@utils'

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
      :width="1000"
      :visible="store.visible"
      @update:visible="(v) => (store.visible = v)"
      :title="store.visibleType ? $t('monthReport.createTitle') : $t('monthReport.updateTitle')"
    >
      <ViewSalary />
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
