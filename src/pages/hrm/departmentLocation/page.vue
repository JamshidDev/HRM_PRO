<script setup>
  import { UIPageContent } from '@/components/index.js'
  import { Table, Filter, CreateForm } from './ui'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'

  const store = useDepartmentLocationStore()

  onMounted(() => {
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <CreateForm />
  </UIPageContent>
</template>
