<script setup>
import {UIPageFilter} from "@components"
import {useConfVacationScheduleStore} from "@stores"

const store = useConfVacationScheduleStore()

const onSearchEv = () => {
  store.params.page = 1
  store._index()
}
</script>

<template>
  <UIPageFilter
      v-model:search="store.params.search"
      :show-add-button="false"
      :show-filter-button="false"
      :search-loading="store.loading"
      @onSearch="onSearchEv"
  />
</template>
