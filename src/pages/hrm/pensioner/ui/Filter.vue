<script setup>
import {useAccountStore, useComponentStore, usePensionerStore} from "@/store/modules/index.js"
import {UIPageFilter, UISelect} from "@/components/index.js"
import {ArrowCircleDown32Regular} from "@vicons/fluent"
const store = usePensionerStore()
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

const onAdd = ()=>{
  store.resetForm()
  store.visibleType = true
  store.visible=true
}

</script>

<template>
  <UIPageFilter
      v-model:search="store.params.search"
      :search-loading="store.loading"
      @onSearch="filterEvent"
      @show="beforeShow"
      :filter-count="filterCount"
      @onClear="resetFilter"
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
    <template #filterAction>
      <n-button
          @click="store._download()"
          :loading="store.loading"
          type="success">
        <template #icon>
          <ArrowCircleDown32Regular/>
        </template>
        {{$t('content.download')}}
      </n-button>
    </template>
  </UIPageFilter>
</template>