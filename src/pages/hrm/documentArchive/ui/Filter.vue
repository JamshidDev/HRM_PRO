
<script setup>

import {UIPageFilter, UISelect} from "@/components/index.js"
import {
  useAccountStore,
  useComponentStore,
  useDocumentArchiveStore
} from "@/store/modules/index.js"


const store = useDocumentArchiveStore()
const accStore = useAccountStore()
const componentStore = useComponentStore()

const onAdd = ()=>{
  if(!accStore.checkAction(accStore.pn.hrDocumentsWrite)) return
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.hrDocumentsRead)) return
  store.params.page = 1
  store._index()
}


const filterEvent = ()=>{
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

const onChangeStructure = (v)=>{
  store.params.organizations=v
  filterEvent()
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
          @defaultValue="(v)=>store.params.organizations=v"
          :modelV="store.params.organizations"
          @updateModel="onChangeStructure"
          :checkedVal="store.structureCheck2"
          @updateCheck="(v)=>store.structureCheck2=v"
          :loading="componentStore.structureLoading"
          @onSubmit="filterEvent"
      />
    </template>
  </UIPageFilter>
</template>
