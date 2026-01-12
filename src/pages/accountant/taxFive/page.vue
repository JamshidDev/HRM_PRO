<script setup>
  import { useAccountStore, useTaxFiveStore } from '@/store/modules/index.js'
  import Table from './ui/Table.vue'
  import Filter from './ui/Filter.vue'
  import { UIPageContent } from '@/components/index.js'

  const store = useTaxFiveStore()
  const accStore = useAccountStore()
  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.economistTaxFiveRead)) return
    const today = new Date()
    store.params.year = today.getFullYear()
    store.params.month = new Date(today.setMonth(today.getMonth() - 1)).getMonth()+1
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
