<script setup>
import {useAccountStore, useComponentStore, useTeacherLessonStore} from "@/store/modules/index.js"
import {UIPageFilter} from "@/components/index.js"
const store = useTeacherLessonStore()
const accStore = useAccountStore()
const componentStore = useComponentStore()

const filterEvent = ()=>{
  if(!accStore.checkAction(accStore.pn.lmsLessonsRead)) return
  store.params.page = 1
  store._index()
}






</script>

<template>
  <UIPageFilter
      v-model:search="store.params.search"
      :search-loading="store.loading"
      @onSearch="filterEvent"
      :show-add-button="false"
      :show-filter-button="false"
  >
  </UIPageFilter>
</template>