<script setup>
  import { UIPageContent } from '@/components/index.js'
  import { useAccountStore, usePaymentAnalysisStore } from '@/store/modules/index.js'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'
  import BlankaModal from './ui/BlankaModal.vue'
  import WhitelistModal from './ui/WhitelistModal.vue'
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
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <BlankaModal />
    <WhitelistModal />
    <AddRowModal />
  </UIPageContent>
</template>
