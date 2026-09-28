<script setup>
  import { UIPageContent } from '@/components/index.js'
  import { useAccountStore, usePaymentAnalysisStore } from '@/store/modules/index.js'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'
  import BlankaModal from './ui/BlankaModal.vue'
  import WhitelistModal from './ui/WhitelistModal.vue'
  import WhitelistView from './ui/WhitelistView.vue'
  import AddRowModal from './ui/AddRowModal.vue'
  import { getOneMonthAgoYearMonth } from '@utils'

  const store = usePaymentAnalysisStore()
  const accStore = useAccountStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.economistPaymentAnalysisRead)) return
    const oneMonthAgo = getOneMonthAgoYearMonth()
    store.params.year = oneMonthAgo.year
    store.params.month = oneMonthAgo.month
    store._index()
  })

  // Tab almashganda — imtiyozli xodimlar ro'yxatini (whitelist) yuklaymiz.
  const onTabChange = (v) => {
    store.mainView = v
    if (v === 'whitelist') store._whitelistIndex()
  }
</script>

<template>
  <UIPageContent>
    <n-tabs
      :value="store.mainView"
      @update:value="onTabChange"
      type="line"
      animated
      class="mb-2"
    >
      <n-tab-pane name="analysis" :tab="$t('paymentAnalysis.tabs.analysis')" />
      <n-tab-pane name="whitelist" :tab="$t('paymentAnalysis.tabs.whitelist')" />
    </n-tabs>
    <template v-if="store.mainView === 'analysis'">
      <Filter />
      <Table />
      <BlankaModal />
      <WhitelistModal />
      <AddRowModal />
    </template>
    <WhitelistView v-else />
  </UIPageContent>
</template>
