<script setup>
import {useAccountStore, useComponentStore, useEventStore, useTurnstileDashboardStore} from "@/store/modules/index.js"
import {UISelect} from "@/components/index.js"


const store = useEventStore()
const dashboardStore = useTurnstileDashboardStore()
const accStore = useAccountStore()

let timer = null
const filterEvent = ()=>{
  if(!accStore.checkAction(accStore.pn.turnstileDashboardRead)) return
  clearTimeout(timer)
  timer = setTimeout(()=>{
    dashboardStore._dashboard()
  }, 1000)

}

const componentStore = useComponentStore()

const onChangeStructure = (v)=>{
  dashboardStore.dashboardParams.organizations=v
  filterEvent()
}



onMounted(()=>{
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }
  if(store.levelList.length===0){
    store._levels()
  }
})

onBeforeUnmount(()=>{
  clearTimeout(timer)
})





</script>

<template>
   <div class="grid grid-cols-12 gap-2">
        <div class="text-lg lg:col-span-6 md:col-span-6 col-span-12 flex items-center text-textColor2 font-medium">
          {{ $t('turnStileDashboard.name') }}
        </div>
        <div class="lg:col-span-4 md:col-span-6 col-span-12">
          <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('actionLog.table.structure')}}</label>
          <UISelect
              :options="componentStore.structureList"
              :modelV="dashboardStore.dashboardParams.organizations"
              :checkedVal="dashboardStore.structureCheck2"
              :loading="componentStore.structureLoading"
              v-model:search="componentStore.structureParams.search"
              @defaultValue="(v)=>dashboardStore.dashboardParams.organizations=v"
              @updateModel="onChangeStructure"
              @updateCheck="(v)=>dashboardStore.structureCheck2=v"
              @onSearch="componentStore._structures"
              @onSubmit="filterEvent"
          />
        </div>
        <div class="lg:col-span-2 md:col-span-6 col-span-12">
          <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('turnstile.hcWorkersPage.access_levels')}}</label>
          <n-select
              clearable 
              multiple
              v-model:value="dashboardStore.dashboardParams.access_levels"
              :options="store.levelList"
              :loading="store.levelLoading"
              label-field="name"
              value-field="id"
              @update:value="filterEvent"
              :max-tag-count="1"
          />
        </div>
        <!-- <div class="lg:col-span-2 md:col-span-4 col-span-12">
          <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('hcEvent.form.direction')}}</label>
          <n-select
              clearable
              v-model:value="dashboardStore.dashboardParams.direction"
              :options="directionList"
              label-field="name"
              value-field="id"
              @update:value="filterEvent"

          />
        </div>
        <div class="lg:col-span-2 md:col-span-4 col-span-12">
          <label class="mt-3 text-xs text-gray-500">{{ $t('content.from') }}</label>
          <n-date-picker
              v-model:value="dashboardStore.dashboardParams.start"
              @update:value="onChangeDate"
              type="datetime"
              update-value-on-close
              :actions="null"
              clearable />
        </div>
        <div class="lg:col-span-2 md:col-span-4 col-span-12">
          <label class="mt-3 text-xs text-gray-500">{{ $t('content.to') }}</label>
          <n-date-picker
              v-model:value="dashboardStore.dashboardParams.end"
              @update:value="onChangeDate"
              type="datetime"
              update-value-on-close
              :actions="null"
              clearable />
        </div> -->
      </div>
</template>