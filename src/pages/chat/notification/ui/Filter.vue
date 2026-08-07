<script setup>
  import { useAccountStore, useNotificationStore } from '@/store/modules/index.js'

  import { UIPageFilter } from '@/components/index.js'
  import { useDebounce } from '@/utils/index.js'

  const accStore = useAccountStore()
  const store = useNotificationStore()

  const debounceIndexEv = useDebounce(store._index)

  const filterEvent = () => {
    store.params.page = 1
    debounceIndexEv()
  }

  // page.vue dagi kabi: bu bo'lim `instructions` oilasi bilan qo'riqlanadi.
  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.instructions)) return
    filterEvent()
  }

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.instructionsWrite)) return
    store.resetForm()
    store.visible = true
  }
</script>
<template>
  <UIPageFilter
    :add-permission="accStore.pn.instructionsWrite"
    :show-filter-button="false"
    :search-loading="store.loading"
    v-model:search="store.params.search"
    @onSearch="onSearch"
    @onAdd="onAdd"
    :show-add-button="true"
  >
  </UIPageFilter>
</template>
