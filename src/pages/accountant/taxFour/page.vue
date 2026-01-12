<script setup>
  import { UIPageContent } from '@/components/index.js'
  import { useAccountStore, useTaxFourStore } from '@/store/modules/index.js'
  import Table from './ui/Table.vue'
  import Filter from './ui/Filter.vue'

  const store = useTaxFourStore()
  const accStore = useAccountStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.economistTaxFourRead)) return
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
