<script setup>
  import { useAccountStore, useComponentStore, useLmsLessonStore } from '@/store/modules/index.js'
  import { UIPageFilter } from '@/components/index.js'
  const store = useLmsLessonStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  // «Natijalar» sahifasi ruxsati — navigations.js bilan bir xil slug.
  const filterEvent = () => {
    if (!accStore.canView(accStore.pn.lmsResultRead)) return
    store.resultParams.page = 1
    store._resultIndex()
  }
</script>

<template>
  <UIPageFilter
    v-model:search="store.resultParams.search"
    :search-loading="store.resultLoading"
    @onSearch="filterEvent"
    :show-filter-button="false"
    :show-add-button="false"
  >
  </UIPageFilter>
</template>
