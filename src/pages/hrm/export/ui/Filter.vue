<script setup>

import {UIPageFilter, UISelect} from "@/components/index.js"
import {
  useAccountStore,
  useComponentStore, useExportStore, useOrganizationLeaderStore,
} from "@/store/modules/index.js"
import {useAppSetting} from "@/utils/index.js"
import {ArrowSync16Regular} from "@vicons/fluent"


const store = useExportStore();
const accStore = useAccountStore()
const componentStore = useComponentStore()


const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.hrLeadersRead)) return
  store.params.page = 1
  store._tasks()
}


const filterEvent = ()=>{
  store._tasks()
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
      :show-add-button="false"
  >
    <template #filterAction>
      <n-button type="primary" @click="store._tasks()" :loading="store.loading">
        {{$t('content.refresh')}}
        <template #icon>
          <ArrowSync16Regular />
        </template>
      </n-button>
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
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
          :loading="componentStore.structureLoading"
          @onSubmit="filterEvent"
      />
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('content.created')}}</label>
      <n-date-picker
          class="w-full"
          v-model:value="store.params.created"
          type="date"
          :format="useAppSetting.datePicketFormat"
          @update:value="filterEvent"
          clearable
      />
    </template>
  </UIPageFilter>
</template>
