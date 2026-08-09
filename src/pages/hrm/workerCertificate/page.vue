<script setup>
  import { UIPageContent } from '@components'
  import { useWorkerCertificateStore, useAccountStore } from '@stores'
  import { Table, Filter, ShowModal } from './ui'

  const store = useWorkerCertificateStore()
  const accStore = useAccountStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrCertificatesRead)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <ShowModal />
  </UIPageContent>
</template>
