<script setup>
import {UIPageFilter, UISelect} from "@/components/index.js"
import {
  useAccountStore,
  useComponentStore,
  useTurnstileHikCentralStore,
  useTurnstileHikCentralWorkerStore
} from "@/store/modules/index.js"
import {ArrowSync24Filled} from "@vicons/fluent"

const levelStore = useTurnstileHikCentralStore()
const store = useTurnstileHikCentralWorkerStore()
const componentStore = useComponentStore()
const accStore = useAccountStore()

const filterEvent = ()=>{
  if(!accStore.checkAction(accStore.pn.turnstileHikCentralWorkersRead)) return
  store.params.page = 1
  store._index()
}


const onAdd = ()=>{
  if(!accStore.checkAction(accStore.pn.turnstileHikCentralWorkersWrite)) return
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

const onSearch = ()=>{
  store.params.page = 1
  filterEvent()
}


const onChangeStructure = (v)=>{
  store.params.organizations=v
  filterEvent()
}

const beforeShow = (v)=>{
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }
  store._levels()
}

const resetFilter = ()=>{
  store.params.organizations = []
  store.params.access_level_id = null
  filterEvent()
}

const filterCount = computed(()=>Number(Boolean(store.params.organizations.length)) + Boolean(store.params.access_level_id))

</script>

<template>
  <UIPageFilter
      v-model:search="store.params.search"
      @onSearch="onSearch"
      :search-loading="store.loading"
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
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('turnstile.hcWorkersPage.access_levels')}}</label>
      <n-select
          filterable
          v-model:value="store.params.access_level_id"
          :options="store.levelList"
          :loading="store.levelLoading"
          label-field="name"
          value-field="id"
          @update:value="filterEvent"
      />
    </template>
    <template #filterAction>
        <n-button :loading="levelStore.onlineDeviceLoading" @click="levelStore._onlineDevice()" type="success">
          {{$t('turnstile.hcWorkersPage.device')}}
          <template #icon>
            <ArrowSync24Filled/>
          </template>
        </n-button>
    </template>
  </UIPageFilter>
</template>




