<script setup>
import {UIPageFilter, UISelect} from "@/components/index.js"
import {useComponentStore, useSalaryCategoryStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"


const store = useSalaryCategoryStore()
const componentStore = useComponentStore()

const onAdd = ()=>{
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

const filterEvent = ()=>{
  store.params.page = 1
  if(store.activeTab === 1){
    store._index()
  }else{
    store._byOrganization()
  }
}

const filterCount = computed(()=>{
  return  Number(Boolean(store.params.organizations.length)) + Number(Boolean(store.params.year)) + Number(Boolean(store.params.month))
})
</script>

<template>
<UIPageFilter
    :filterCount="filterCount"
    v-model:search="store.params.search"
    @onSearch="filterEvent"
    @onAdd="onAdd"
>
  <template #filterAction>
    <n-select
        class="w-full! md:w-[200px]!"
        v-model:value="store.activeTab"
        :options="store.tabs"
        label-field="name"
        value-field="id"
    />
  </template>
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
    <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('content.year')}}</label>
    <n-select
        class="w-full"
        v-model:value="store.params.year"
        :options="Utils.yearList"
        label-field="name"
        value-field="id"
        @update:value="filterEvent"
    />
    <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('content.month')}}</label>
    <n-select
        class="w-full"
        v-model:value="store.params.month"
        :options="Utils.monthList"
        label-field="name"
        value-field="id"
        @update:value="filterEvent"
    />
  </template>
</UIPageFilter>

</template>
