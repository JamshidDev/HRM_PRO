<script setup>
  import { UIPageContent, UIDrawer } from '@/components/index.js'
  import { useNewsCategoryStore } from '@/store/modules/index.js'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'
  import FormDrawer from './ui/FormDrawer.vue'

  const store = useNewsCategoryStore()

  onMounted(() => store._index())
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <FormDrawer />
  </UIPageContent>
</template>
