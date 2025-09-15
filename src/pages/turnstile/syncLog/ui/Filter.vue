<script setup>
import {useAccountStore, useComponentStore, useSyncLogStore} from "@/store/modules/index.js"
import {UIPageFilter, UISelect} from "@/components/index.js"
const store = useSyncLogStore()
const accStore = useAccountStore()

const filterEvent = ()=>{
  if(!accStore.checkAction(accStore.pn.turnstileHikCentralSyncRead)) return
  store.params.page = 1
  store._index()
}

const componentStore = useComponentStore()


const beforeShow = (v)=>{
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }

  if(store.levelList.length===0){
    store._levels()
  }
}


const onChangeStructure = (v)=>{
  store.params.organizations=v
  filterEvent()
}

const resetFilter = ()=>{
  store.params.organizations = []
  store.params.access_levels = []
  filterEvent()
}

const filterCount = computed(()=>Number(store.params.organizations.length>0) + Boolean(store.params.access_levels.length>0))

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
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('turnstile.hcWorkersPage.access_levels')}}</label>
      <n-select
          multiple
          clearable
          filterable
          v-model:value="store.params.access_levels"
          :options="store.levelList"
          :loading="store.levelLoading"
          label-field="name"
          value-field="id"
          @update:value="filterEvent"
          :max-tag-count="2"
      />
    </template>
  </UIPageFilter>
</template>