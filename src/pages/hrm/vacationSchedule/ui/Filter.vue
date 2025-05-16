<script setup>
import {UIPageFilter} from "@/components/index.js"
import {useAccountStore, useVacationScheduleStore} from "@/store/modules/index.js"
import {People32Filled} from "@vicons/fluent"

const store = useVacationScheduleStore()
const accStore = useAccountStore()

const onAdd = ()=>{
  if(!accStore.checkAction(accStore.pn.hrVacationScheduleWrite)) return
  store.visibleType = true
  store.resetForm()
  store.visible=true
}

const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.hrVacationScheduleRead)) return
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
        class="w-full! md:w-auto!"
        @click="store.otherVisible=!store.otherVisible"
        type="error">
      {{$t('vacationSchedule.otherList.btn')}}
      <template #icon>
        <People32Filled/>
      </template>
    </n-button>
  </template>
</UIPageFilter>
</template>

<style scoped>

</style>