<script setup>
  import { UIPageContent } from '@/components/index.js'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'
  import { useAccountStore, useLmsLessonStore } from '@/store/modules/index.js'

  const store = useLmsLessonStore()
  const accStore = useAccountStore()

  onMounted(() => {
    store._resultIndex()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
  </UIPageContent>
</template>
