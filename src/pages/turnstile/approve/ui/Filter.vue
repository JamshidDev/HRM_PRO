<script setup>
  import { useAccountStore, useApproveStore, useComponentStore } from '@stores'
  import { UIPageFilter } from '@components'

  const store = useApproveStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  const onSearch = () => {
    store.params.page = 1
    store._index()
  }

  const onAdd = () => {
    store.visibleType = true
    if (!accStore.checkAction(accStore.pn.turnstileApproveWrite)) return
    store._resetForm()
    if (componentStore.allStructureList.length === 0) {
      componentStore._allStructures()
    }

    store.worker.params.page = 1
    store._workers()
    store.visible = true
  }
</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    :search-loading="store.loading"
    @onSearch="onSearch"
    @onAdd="onAdd"
    :show-filter-button="false"
  />
</template>
