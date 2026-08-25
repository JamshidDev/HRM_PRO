<script setup>
  import { UIPageContent } from '@/components/index.js'
  import { useArchiveStore } from '@/store/modules/index.js'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'

  const store = useArchiveStore()

  onMounted(() => {
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
  </UIPageContent>
</template>
