x<script setup>
import {UIPageFilter, UISelect} from "@/components/index.js"
import {useComponentStore, useMedWorkerStore} from "@/store/modules/index.js"

const store = useMedWorkerStore()
const componentStore = useComponentStore()

const filterEvent = ()=>{
  store.params.page = 1
  store._index()
}

const onChange = (v)=>{
  store.params.organizations=v
  filterEvent()
}

const onShow = () => {
  if(componentStore.structureList.length === 0){
    componentStore._allStructures()
  }
}

const onClear = ()=>{
  store.params.organizations = []
  filterEvent()
}

const filterCount = computed(()=>Number(store.params.organizations.length>0))

</script>

<template>
<UIPageFilter
    v-model:search="store.params.search"
    :search-loading="store.loading"
    :show-add-button="false"
    :filterCount="filterCount"
    @onSearch="filterEvent"
    @show="onShow"
    @onClear="onClear"
>
  <template #filterContent>
    <div class="w-full grid grid-cols-12">
      <div class="col-span-12">
        <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('actionLog.table.structure')}}</label>
        <UISelect
            :options="componentStore.allStructureList"
            :modelV="store.params.organizations"
            @defaultValue="(v)=>store.params.organizations=v"
            @updateModel="onChange"
            :checkedVal="store.structureCheck2"
            @updateCheck="(v)=>store.structureCheck2=v"
            v-model:search="componentStore.allStructureParams.search"
            @onSearch="componentStore._allStructures"
            :loading="componentStore.allStructureLoading"
            @onSubmit="filterEvent"
        />
      </div>
    </div>
  </template>

</UIPageFilter>
</template>