<script setup>
import {useComponentStore, useMonthReportStore} from "@/store/modules/index.js"
import {UIPageFilter, UISelect} from "@/components/index.js"
import Utils from "@/utils/Utils.js"

const store = useMonthReportStore()

const filterEvent = ()=>{
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
    :show-add-button="false"
    @show="beforeShow"
    :filter-count="filterCount"
    @onClear="resetFilter"
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
  </template>
  <template #filterAction>

    <n-select
        class="w-full! md:w-[200px]!"
        v-model:value="store.params.year"
        :options="Utils.yearList"
        label-field="name"
        value-field="id"
        @update:value="filterEvent"
    />
    <n-select
        class="w-full! md:w-[200px]!"
        v-model:value="store.params.month"
        :options="Utils.monthList"
        label-field="name"
        value-field="id"
        @update:value="filterEvent"
    />
  </template>
</UIPageFilter>
</template>

<style scoped>

</style>