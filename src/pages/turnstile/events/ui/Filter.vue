<script setup>
import {useAccountStore, useComponentStore, useEventStore} from "@/store/modules/index.js"
import {ArrowSync24Filled} from "@vicons/fluent"
import {UIPageFilter, UISelect} from "@/components/index.js"
import i18n from "@/i18n/index.js"

const {t} = i18n.global
const store = useEventStore()
const accStore = useAccountStore()

const filterEvent = ()=>{
  if(!accStore.checkAction(accStore.pn.turnstileHikCentralEventsRead)) return
  store.params.page = 1
  store._index()
  store._dashboard()
}

const componentStore = useComponentStore()

const onChangeStructure = (v)=>{
  store.params.organizations=v
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
  store.params.organizations = []
  store.params.access_levels = []
  store.params.direction = null
  store.params.start = null
  store.params.end = null
  filterEvent()
}

const filterCount = computed(()=>Number(Boolean(store.params.organizations.length))
    + Number(Boolean(store.params.access_levels.length))
    + Number(Boolean(store.params.start))
    + Number(Boolean(store.params.end))
    + Number(Boolean(store.params.direction)) )

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

const checkLastClick = ()=>{
    const TIMEOUT = 60 // minute
    const now = Date.now()
    const lastClickTime = localStorage.getItem("lastClickTime")


  if (lastClickTime) {
    const diffMs = now - parseInt(lastClickTime, 10)
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    if (diffMs < TIMEOUT*60*1000) {
      $Toast.warning(t('content.lastClickTime', {n:(TIMEOUT-diffMinutes)}))
      return false
    }
  }
  return true
}

const onSync = ()=>{
  if(!checkLastClick()) return
  store.syncPayload.from_date = null
  store.syncPayload.to_date = null
  store.syncPayload.access_level_ids = []
  store.visible = true
}

</script>

<template>
  <UIPageFilter
      v-model:search="store.params.search"
      :search-loading="store.loading"
      @onSearch="filterEvent"
      @show="beforeShow"
      :filter-count="filterCount"
      @onClear="resetFilter"
      :show-add-button="false"
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
          multiple
          clearable
          filterable
          v-model:value="store.params.access_levels"
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
          v-model:value="store.params.direction"
          :options="directionList"
          label-field="name"
          value-field="id"
          @update:value="filterEvent"

      />
      <label class="mt-3 text-xs text-gray-500">{{ $t('content.from') }}</label>
      <n-date-picker
          class="mt-1"
          v-model:value="store.params.start"
          @update:value="onChangeDate"
          type="datetime"
          update-value-on-close
          :actions="null"
          clearable />
      <label class="mt-3 text-xs text-gray-500">{{ $t('content.to') }}</label>
      <n-date-picker
          class="mt-1"
          v-model:value="store.params.end"
          @update:value="onChangeDate"
          type="datetime"
          update-value-on-close
          :actions="null"
          clearable />
    </template>
    <template #filterAction>
      <n-button :loading="store.jobLoading" @click="onSync" type="primary">
        {{$t('turnstile.accessLevelPage.sync')}}
        <template #icon>
          <ArrowSync24Filled/>
        </template>
      </n-button>
    </template>
  </UIPageFilter>
</template>