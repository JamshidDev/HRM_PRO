<script setup>
  import Table from './ui/Table.vue'
  import Filter from './ui/Filter.vue'
  import { UIPageContent } from '@/components/index.js'
  import { useNewsStore } from '@/store/modules/index.js'

  const store = useNewsStore()

  const onFilter = () => {
    store.params.page = 1
    store._index()
  }

  onMounted(() => {
    store.params.page = 1
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Filter @filter="onFilter" />
    <Table />
  </UIPageContent>
</template>
