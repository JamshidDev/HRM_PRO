<script setup>
  import { useAccountStore, useStaffingApprovalStore } from '@stores'
  import { UIPageFilter } from '@components'

  const store = useStaffingApprovalStore()
  const accStore = useAccountStore()

  const filterEvent = (v) => {
    store._index()
  }

  const onSearch = () => {
    store.params.page = 1
    store._index()
  }

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.economistStaffingApproveWrite)) return
    store.resetForm()
    store.visibleType = true
    store.visible = true
  }
</script>

<template>
  <UIPageFilter
    :add-permission="accStore.pn.economistStaffingApproveWrite"
    v-model:search="store.params.search"
    :search-loading="store.loading"
    :show-filter-button="false"
    @onSearch="onSearch"
    @onAdd="onAdd"
  />
</template>
