<script setup>
import {useAccountStore, useComponentStore, useEventStore} from "@/store/modules/index.js"
import {UIPageFilter, UISelect} from "@/components/index.js"
const store = useEventStore()
const accStore = useAccountStore()

const filterEvent = ()=>{
  if(!accStore.checkAction(accStore.pn.economistStatementsRead)) return
  store.params.page = 1
  store._index()
}

const componentStore = useComponentStore()

const onChangeStructure = (v)=>{
  store.params.organizations=v
  filterEvent()
}

const beforeShow = (v)=>{
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }
}

const resetFilter = ()=>{
  store.params.organizations = []
  filterEvent()
}

const filterCount = computed(()=>Number(Boolean(store.params.organizations.length)))

</script>

<template>
  <UIPageFilter
      v-model:search="store.params.search"
      :search-loading="store.loading"
      @onSearch="filterEvent"
      @show="beforeShow"
      :filter-count="filterCount"
      @onClear="resetFilter"
      :show-add-button="false"
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