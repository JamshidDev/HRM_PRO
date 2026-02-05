<script setup>
  import { useStaffingApprovalStore } from '@stores'
  import { UIPageFilter } from '@components'

  const store = useStaffingApprovalStore()

  const filterEvent = (v) => {
    store._index()
  }

  const onSearch = () => {
    store.params.page = 1
    store._index()
  }

  const onAdd = () => {
    store.resetForm()
    store.visibleType = true
    store.visible = true
    store._showGenerate()

    store.worker.params.page = 1
    store._workers()
    store._organizationParents()
    store._confirmation()
  }
</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    :search-loading="store.loading"
    :show-filter-button="false"
    @onSearch="onSearch"
    @onAdd="onAdd"
  />
</template>
