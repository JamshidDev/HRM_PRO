<script setup>
import {UIPageFilter, UISelect} from "@/components/index.js"
import {useAccDashboardStore, useAccountStore, useComponentStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useAccDashboardStore()
const componentStore = useComponentStore()
const accStore = useAccountStore()

const filterEvent = ()=>{
  if(!accStore.checkAction(accStore.pn.economistDashboard)) return
  store.params.page = 1
  store._index()
}

const onChangeStructure = (v)=>{
  store.params.organizations=v
  filterEvent()
}

const filterCount = computed(()=>Number(Boolean(store.params.organizations.length)) + Number(Boolean(store.params.year)) + Number(Boolean(store.params.month)))

const resetFilter = ()=>{
  store.params.organizations = []
  filterEvent()
}
</script>

<template>
<UIPageFilter
    v-model:search="store.params.search"
    :search-loading="store.loading"
    @onSearch="filterEvent"
    :show-add-button="false"
    :filterCount="filterCount"
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
        v-model:search="componentStore.structureParams.search"
        @onSearch="componentStore._structures"
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