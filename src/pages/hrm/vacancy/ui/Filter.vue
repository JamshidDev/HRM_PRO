<script setup>

import {UIPageFilter, UISelect} from "@/components/index.js"
import {
  useAccountStore,
  useComponentStore,
  useVacancyStore
} from "@/store/modules/index.js"


const store = useVacancyStore()
const accStore = useAccountStore()
const componentStore = useComponentStore()


const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.hrConfirmationsRead)) return
  store.params.page = 1
  store._index()
}


const filterEvent = ()=>{
  store._index()
}

const filterCount = computed(()=>Number(Boolean(store.params.organizations.length))
    +Number(Boolean(store.params.vacation_type))
)

const beforeShow = (v)=>{
  if(v && componentStore.vacationTypes.length === 0){
    componentStore._enums()
  }
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
  store.params.vacation_type = null
  filterEvent()
}

const onAdd = ()=>{
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

</script>

<template>
  <UIPageFilter
      v-model:search="store.params.search"
      @onSearch="onSearch"
      @show="beforeShow"
      @onClear="resetFilter"
      :filter-count="filterCount"
      :search-loading="store.loading"
      @onAdd="onAdd"
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
