<script setup>
  import { UIPageContent } from '@components'
  import { useWorkerCertificateStore, useAccountStore } from '@stores'
  import { Table, Filter } from './ui'

  const store = useWorkerCertificateStore()
  const accStore = useAccountStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrWorkersRead)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
  </UIPageContent>
</template>
