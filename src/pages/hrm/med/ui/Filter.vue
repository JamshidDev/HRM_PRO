<script setup>

import {UIPageFilter, UISelect} from "@/components/index.js"
import {
  useAccountStore,
  useComponentStore, useMedStore,
} from "@/store/modules/index.js"


const store = useMedStore()
const accStore = useAccountStore()
const componentStore = useComponentStore()


const onSearch = (v)=>{
  if(!accStore.checkAction(accStore.pn.hrTableRead)) return
  store.params.page = 1
  store._index()
}

const onAdd = ()=>{
  if(!accStore.checkAction(accStore.pn.hrMedWrite)) return
  store.resetForm()
  componentStore.selectedWorker = null
  store.elementId = null
  store.visibleType = true
  store.visible = true
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
          :loading="componentStore.structureLoading"
          @onSubmit="filterEvent"
      />
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('medPage.form.status')}}</label>
      <n-select
          v-model:value="store.params.status"
          :options="componentStore.medStatus"
          :loading="componentStore.enumExamLoading"
          @update:value="filterEvent"
          label-field="name"
          value-field="id"
          clearable
      />
    </template>
  </UIPageFilter>
</template>
