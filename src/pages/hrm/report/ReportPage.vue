<script setup>
  import { UIPageContent } from '@/components/index.js'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'
  import DepartmentModal from './ui/DepartmentModal.vue'
  import PositionModal from './ui/PositionModal.vue'
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <DepartmentModal />
    <PositionModal />
  </UIPageContent>
</template>
