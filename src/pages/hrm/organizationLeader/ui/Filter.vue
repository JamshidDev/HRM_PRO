<script setup>

import {UIPageFilter, UISelect} from "@/components/index.js"
import {
  useAccountStore,
  useComponentStore, useOrganizationLeaderStore,
} from "@/store/modules/index.js"


const store = useOrganizationLeaderStore()
const accStore = useAccountStore()
const componentStore = useComponentStore()


const onAdd = ()=>{
  if(!accStore.checkAction(accStore.pn.hrLeadersWrite)) return
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.hrLeadersRead)) return
  store.params.page = 1
  store._index()
}


const filterEvent = ()=>{
  store._index()
}

const filterCount = computed(()=>Number(Boolean(store.params.organizations.length)+Number(Boolean(store.params.status)) )
)

const beforeShow = (v)=>{
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }

  if(componentStore.medStatus.length === 0){
    componentStore._enums()
  }
}

const onChangeStructure = (v)=>{
  store.params.organizations=v
  filterEvent()
}


const resetFilter = ()=>{
  store.params.organizations = []
  store.params.status = null
  filterEvent()
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
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
          :loading="componentStore.structureLoading"
          @onSubmit="filterEvent"
      />
    </template>
  </UIPageFilter>
</template>
