<script setup>
  import { useAccountStore, useTaxFiveStore } from '@/store/modules/index.js'
  import Table from './ui/Table.vue'
  import Filter from './ui/Filter.vue'
  import { UIPageContent } from '@/components/index.js'
  import { getOneMonthAgoYearMonth } from '@utils'

  const store = useTaxFiveStore()
  const accStore = useAccountStore()
  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.economistTaxFiveRead)) return
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
  </UIPageContent>
</template>

<style scoped></style>
