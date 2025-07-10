<script setup>
import {useAccountStore, useComponentStore, useMonthReportStore} from "@/store/modules/index.js"
import {UIPageFilter, UISelect} from "@/components/index.js"
import Utils from "@/utils/Utils.js"
import UIHelper from "@/utils/UIHelper.js"
import {ArrowCircleDown32Regular} from "@vicons/fluent"

const store = useMonthReportStore()
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

  if(store.codeList.length === 0){
    store._enum()
  }
}

const resetFilter = ()=>{
  store.params.organizations = []
  store.params.code = null
  filterEvent()
}

const filterCount = computed(()=>Number(Boolean(store.params.organizations.length)) + Number(Boolean(store.params.code)))
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
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
          @onSubmit="filterEvent"
      />
    <label class="text-xs mt-3 text-gray-500 mb-1 font-medium">{{$t('monthReport.form.code')}}</label>
    <n-select
        class="w-full max-w-[370px]"
        clearable
        v-model:value="store.params.code"
        :options="store.codeList"
        label-field="name"
        value-field="id"
        :render-label="UIHelper.selectRender.label"
        :render-tag="UIHelper.selectRender.value"
        @update:value="filterEvent"
    />


  </template>
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
</UIPageFilter>
</template>

<style scoped>

</style>