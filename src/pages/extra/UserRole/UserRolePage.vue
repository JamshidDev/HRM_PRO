<script setup>
  import { UIPageContent} from '@components'
  import Table from './ui/Table.vue'
  import {useWorkerProfileStore } from '@stores'
  import Filter from './ui/Filter.vue'

  const store = useWorkerProfileStore()

  onMounted(() => {
    store._userRole()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
  </UIPageContent>
</template>
