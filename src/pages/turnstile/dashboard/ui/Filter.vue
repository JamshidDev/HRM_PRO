<script setup>
import {useAccountStore, useComponentStore, useEventStore} from "@/store/modules/index.js"
import {UIPageFilter, UISelect} from "@/components/index.js"
import i18n from "@/i18n/index.js"

const {t} = i18n.global
const store = useEventStore()
const accStore = useAccountStore()

const filterEvent = ()=>{
  if(!accStore.checkAction(accStore.pn.admin)) return
  store._dashboard()
}

const componentStore = useComponentStore()

const onChangeStructure = (v)=>{
  store.dashboardParams.organizations=v
  filterEvent()
}

const onChangeDate =()=>{
  filterEvent()
}

const beforeShow = (v)=>{
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }
  if(store.levelList.length===0){
    store._levels()
  }

}

const resetFilter = ()=>{
  store.dashboardParams.organizations = []
  store.dashboardParams.access_levels = []
  store.dashboardParams.direction = null
  store.dashboardParams.start = null
  store.dashboardParams.end = null
  filterEvent()
}

const filterCount = computed(()=>Number(Boolean(store.dashboardParams.organizations.length))
    + Number(Boolean(store.dashboardParams.access_levels.length))
    + Number(Boolean(store.dashboardParams.start))
    + Number(Boolean(store.dashboardParams.end))
    + Number(Boolean(store.dashboardParams.direction)) )

const directionList = [
  {
    name:t('turnstile.workDurationPage.enter'),
    id:1,
  },
  {
    name:t('turnstile.workDurationPage.exit'),
    id:0,
  },
]





</script>

<template>
  <UIPageFilter
      @show="beforeShow"
      :filter-count="filterCount"
      @onClear="resetFilter"
      :show-add-button="false"
      :show-search-input="false"
  >
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('actionLog.table.structure')}}</label>
      <UISelect
          :options="componentStore.structureList"
          :modelV="store.dashboardParams.organizations"
          @defaultValue="(v)=>store.dashboardParams.organizations=v"
          @updateModel="onChangeStructure"
          :checkedVal="store.structureCheck2"
          @updateCheck="(v)=>store.structureCheck2=v"
          :loading="componentStore.structureLoading"
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
          @onSubmit="filterEvent"
      />
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('turnstile.hcWorkersPage.access_levels')}}</label>
      <n-select
          multiple
          clearable
          filterable
          v-model:value="store.dashboardParams.access_levels"
          :options="store.levelList"
          :loading="store.levelLoading"
          label-field="name"
          value-field="id"
          @update:value="filterEvent"
          :max-tag-count="2"
      />
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('hcEvent.form.direction')}}</label>
      <n-select
          clearable
          v-model:value="store.dashboardParams.direction"
          :options="directionList"
          label-field="name"
          value-field="id"
          @update:value="filterEvent"

      />
      <label class="mt-3 text-xs text-gray-500">{{ $t('content.from') }}</label>
      <n-date-picker
          class="mt-1"
          v-model:value="store.dashboardParams.start"
          @update:value="onChangeDate"
          type="datetime"
          update-value-on-close
          :actions="null"
          clearable />
      <label class="mt-3 text-xs text-gray-500">{{ $t('content.to') }}</label>
      <n-date-picker
          class="mt-1"
          v-model:value="store.dashboardParams.end"
          @update:value="onChangeDate"
          type="datetime"
          update-value-on-close
          :actions="null"
          clearable />
    </template>
  </UIPageFilter>
</template>