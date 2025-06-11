<script setup>
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
    componentStore._structures()
  }
}

</script>

<template>
<UIPageFilter
    v-model:search="store.params.search"
    :search-loading="store.loading"
    :show-add-button="false"
    @onSearch="filterEvent"
    @show="onShow"
>
  <template #filterContent>
    <div class="w-full grid grid-cols-12">
      <div class="col-span-12">
        <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('actionLog.table.structure')}}</label>
        <UISelect
            :options="componentStore.structureList"
            :modelV="store.params.organizations"
            @defaultValue="(v)=>store.params.organizations=v"
            @updateModel="onChange"
            :checkedVal="store.structureCheck2"
            @updateCheck="(v)=>store.structureCheck2=v"
            v-model:search="componentStore.structureParams.search"
            @onSearch="componentStore._structures"
            :loading="componentStore.structureLoading"
            @onSubmit="filterEvent"
        />
      </div>
    </div>
  </template>

</UIPageFilter>
</template>