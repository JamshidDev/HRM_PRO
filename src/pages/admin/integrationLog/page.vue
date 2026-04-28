<script setup>
  import { UIPageContent } from '@/components/index.js'
  import { useAccountStore, useIntegrationLogStore } from '@/store/modules/index.js'
  import Table from './ui/Table.vue'
  import { onMounted } from 'vue'

  const store = useIntegrationLogStore()
  const accStore = useAccountStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.admin)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Table />
  </UIPageContent>
</template>
