<script setup>
import {useAccountStore, useComponentStore, useLmsLessonStore} from "@/store/modules/index.js"
import {UIPageFilter} from "@/components/index.js"
const store = useLmsLessonStore()
const accStore = useAccountStore()
const componentStore = useComponentStore()

const filterEvent = ()=>{
  if(!accStore.checkAction(accStore.pn.admin)) return
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