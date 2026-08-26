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
  <!-- Maketda (node 3332:65659) sahifa cheti 16px, qidiruv qatori bilan jadval
       orasi esa 24px (`UIPageContent` ning standart oralig'i 16px). -->
  <UIPageContent class="!gap-6">
    <Filter />
    <Table />
  </UIPageContent>
</template>
