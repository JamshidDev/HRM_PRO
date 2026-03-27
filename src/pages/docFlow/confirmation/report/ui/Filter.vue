<script setup>
  import { UIPageFilter } from '@/components/index.js'
  import { useConfirmationReportStore } from '@/store/modules/index.js'

  const store = useConfirmationReportStore()

  const onSearch = () => {
    store.params.page = 1
    store._index()
  }
</script>

<template>
  <UIPageFilter
    :show-add-button="false"
    :show-filter-button="false"
    :search-loading="store.loading"
    v-model:search="store.params.search"
    @onSearch="onSearch"
  />
</template>
