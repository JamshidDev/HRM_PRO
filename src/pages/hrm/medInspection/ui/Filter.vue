<script setup>
  import { UIPageFilter } from '@/components/index.js'
  import {
    useAccountStore,
    useComponentStore,
    useMedInspectionStore
  } from '@/store/modules/index.js'
  const store = useMedInspectionStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  const onSearch = () => {
    store.params.page = 1
    store._index()
  }

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.hrMedWrite)) return
    store.resetForm()
    componentStore._structures()
    store.visible = true
  }
</script>

<template>
  <UIPageFilter
    :add-permission="accStore.pn.hrMedWrite"
    v-model:search="store.params.search"
    @onSearch="onSearch"
    :search-loading="store.loading"
    @onAdd="onAdd"
    :show-filter-button="false"
  />
</template>

<style scoped></style>
