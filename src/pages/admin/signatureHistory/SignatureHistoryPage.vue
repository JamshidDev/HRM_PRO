<script setup>
  import { UIPageContent } from '@/components/index.js'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'
  import DetailDrawer from './ui/DetailDrawer.vue'
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <DetailDrawer />
  </UIPageContent>
</template>
