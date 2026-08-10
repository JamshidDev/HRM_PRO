<script setup>
  import { UIPageContent } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import Filter from './ui/Filter.vue'
  import { useTaskStore, useAccountStore } from '@/store/modules/index.js'

  const accStore = useAccountStore()
  const store = useTaskStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrTasksRead)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
  </UIPageContent>
</template>
