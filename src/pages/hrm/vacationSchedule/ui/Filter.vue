<script setup>
import {UIPageFilter, UISelect} from "@/components/index.js"
import {useAccountStore, useComponentStore, useVacationScheduleStore} from "@/store/modules/index.js"
import {People32Filled} from "@vicons/fluent"

const store = useVacationScheduleStore()
const accStore = useAccountStore()
const componentStore = useComponentStore()

const onAdd = ()=>{
  if(!accStore.checkAction(accStore.pn.hrVacationScheduleWrite)) return
  store.visibleType = true
  store.resetForm()
  store.visible=true
}

const onChangeStructure = (v)=>{
  store.params.organizations=v
  filterEvent()
}


const filterEvent = ()=>{
  store._index()
}

const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.hrVacationScheduleRead)) return
  store.params.page = 1
  store._index()
}

const filterCount = computed(()=>Number(Boolean(store.params.organizations.length))
    + Number(Boolean(store.params.confirmation))
    +Number(Boolean(store.params.created))
)

const beforeShow = (v)=>{
  if(v && componentStore.confirmationStatusList.length === 0){
    componentStore._enumsAdmin()
  }
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }
}

const resetFilter = ()=>{
  store.params.organizations = []
  store.params.confirmation = null
  store.params.created = null
  filterEvent()
}


</script>

<template>
<UIPageFilter
    v-model:search="store.params.search"
    :search-loading="store.loading"
    @onAdd="onAdd"
    @onSearch="onSearch"
    @show="beforeShow"
    @onClear="resetFilter"
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
  <template #filterContent>
    <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('actionLog.table.structure')}}</label>
    <UISelect
        :options="componentStore.structureList"
        :modelV="store.params.organizations"
        @defaultValue="(v)=>store.params.organizations=v"
        @updateModel="onChangeStructure"
        :checkedVal="store.structureCheck2"
        @updateCheck="(v)=>store.structureCheck2=v"
        v-model:search="componentStore.structureParams.search"
        @onSearch="componentStore._structures"
        :loading="componentStore.structureLoading"
        @onSubmit="filterEvent"
    />
  </template>
</UIPageFilter>
</template>

<style scoped>

</style>