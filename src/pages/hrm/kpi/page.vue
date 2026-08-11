<script setup>
  import { UIPageContent } from '@components'
  import { useKpiStore, useAccountStore } from '@stores'
  import { Filter, Table, ShowModal } from './ui'

  const store = useKpiStore()
  const accStore = useAccountStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrKpiRead)) return
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
