<script setup>
import {ArrowCircleDown32Regular} from "@vicons/fluent"
import {UIPageFilter, UISelect} from "@/components/index.js"
import {useComponentStore, useTaxFourStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"


const store = useTaxFourStore()
const componentStore = useComponentStore()

const filterEvent = ()=>{
  store.params.page = 1
  store._index()
}

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
    :show-add-button="false"
    @onSearch="filterEvent"
    @show="beforeShow"
    @onClear="resetFilter"
    :filter-count="filterCount"
>
  <template #filterAction>
    <n-button
        @click="store._download()"
        :loading="store.downloadLoading"
        type="success">
      <template #icon>
        <ArrowCircleDown32Regular/>
      </template>
      {{$t('content.template')}}
    </n-button>
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
</UIPageFilter>

</template>

<style scoped>

</style>