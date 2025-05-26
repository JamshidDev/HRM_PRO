<script setup>

import {UIPageFilter, UISelect} from "@/components/index.js"
import {
  useAccountStore,
  useComponentStore,
  useTimesheetStore
} from "@/store/modules/index.js"


const store = useTimesheetStore()
const accStore = useAccountStore()
const componentStore = useComponentStore()

const onAdd = ()=>{
  if(!accStore.checkAction(accStore.pn.hrTableWorkersWrite)) return
  store.visibleType = true
  store.resetForm()
  store.visible = true
}

const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.hrTableWorkersRead)) return
  store.params.page = 1
  store._index()
}


const filterEvent = ()=>{
  store._index()
}

const filterCount = computed(()=>Number(Boolean(store.params.organizations.length)))

const beforeShow = (v)=>{
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }
}

const onChangeStructure = (v)=>{
  store.params.organizations=v
  filterEvent()
}



const resetFilter = ()=>{
  store.params.organizations = []
  filterEvent()
}

</script>

<template>
  <UIPageFilter
      v-model:search="store.params.search"
      @onSearch="onSearch"
      @onAdd="onAdd"
      @show="beforeShow"
      @onClear="resetFilter"
      :filter-count="filterCount"
      :search-loading="store.loading"
  >
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('actionLog.table.structure')}}</label>
      <UISelect
          :options="componentStore.structureList"
          :modelV="store.params.organizations"
          @defaultValue="(v)=>store.params.organizations=v"
          @updateModel="onChangeStructure"
          :checkedVal="store.structureCheck2"
          @updateCheck="(v)=>store.structureCheck2=v"
          :loading="componentStore.structureLoading"
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
          @onSubmit="filterEvent"
      />
    </template>
  </UIPageFilter>
</template>
