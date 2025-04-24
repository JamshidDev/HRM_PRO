<script setup>
import {UIPageFilter} from "@/components/index.js"
import {useVacationScheduleStore} from "@/store/modules/index.js"

const store = useVacationScheduleStore()

const onAdd = ()=>{
  store.visibleType = true
  store.resetForm()
  store.visible=true
}

const onSearch = ()=>{
  store.params.page = 1
  store._index()
}


</script>

<template>
<UIPageFilter
    v-model:search="store.params.search"
    :search-loading="store.loading"
    @onAdd="onAdd"
    @onSearch="onSearch"
>
  <template #filterAction>
    <n-button
        @click="store.otherVisible=!store.otherVisible"
        type="success">
      {{$t('vacationSchedule.otherList.btn')}}</n-button>
  </template>
</UIPageFilter>
</template>

<style scoped>

</style>