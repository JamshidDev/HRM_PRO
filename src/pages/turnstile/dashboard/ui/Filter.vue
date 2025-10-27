<script setup>
import {useAccountStore, useComponentStore, useEventStore, useTurnstileDashboardStore} from "@/store/modules/index.js"
import {UISelect} from "@/components/index.js"
import {selectRender} from "@/utils/index.js"


const store = useEventStore()
const dashboardStore = useTurnstileDashboardStore()
const accStore = useAccountStore()
const componentStore = useComponentStore()

let timer = null
const filterEvent = ()=>{
  if(!accStore.checkAction(accStore.pn.turnstileDashboardRead)) return
  clearTimeout(timer)
  timer = setTimeout(()=>{
    dashboardStore._dashboard()
  }, 1000)

}


const onChangeStructure = (v)=>{
  dashboardStore.dashboardParams.organizations=v
  componentStore.depParams.organizations = v.map((x) => x.id)
  componentStore.departmentList = []
  dashboardStore.dashboardParams.departments = []
  filterEvent()
  componentStore._departments()
}

const handleTimeKeydownWithEnter = (event, key) => {
  if (event.key === 'Enter') {
    onEnterTime(key)
  } else {
    Utils.handleTimeKeydown(event)
  }
}

const onEnterTime = (key)=>{
  if(dashboardStore.dashboardParams.start_time?.length===5 && dashboardStore.dashboardParams.end_time?.length===5){
    const value =key === 'turnstile_start_time'? dashboardStore.dashboardParams.start_time : dashboardStore.dashboardParams.end_time
    localStorage.setItem(key,value)
    filterEvent()
  }

}
const onChangeDepartment = ()=>{
  console.log(dashboardStore.dashboardParams.departments)
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
        <div class="text-lg lg:col-span-2 md:col-span-6 col-span-12 flex items-center text-textColor2 font-medium">
          {{ $t('turnStileDashboard.name') }}
        </div>
        <div class="lg:col-span-2 md:col-span-6 col-span-12">
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
       <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('content.department')}}</label>
       <n-select
           v-model:value="dashboardStore.dashboardParams.departments"
           :options="componentStore.departmentList"
           multiple
           filterable
           label-field="name"
           value-field="id"
           :render-label="selectRender.label"
           :render-tag ="selectRender.value"
           clearable
           @update:value="onChangeDepartment"
           :max-tag-count="1"
           :filter="()=>true"
           :loading="componentStore.departmentLoading"
           @search="componentStore._onSearchDepartment"
           @scroll="componentStore._onScrollDepartment"
       />
     </div>
        <div class="lg:col-span-2 md:col-span-6 col-span-12">
          <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('turnstile.hcWorkersPage.access_levels')}}</label>
          <n-select
              filterable
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
        <div class="lg:col-span-2 md:col-span-6 col-span-12">
          <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('hcEvent.form.start_time')}}</label>
          <n-input
              v-mask="'##:##'"
              class="w-full"
              type="text"
              @keydown="handleTimeKeydownWithEnter($event, 'turnstile_start_time')"
              v-model:value="dashboardStore.dashboardParams.start_time"
              :loading="dashboardStore.loading"
              :disabled="dashboardStore.loading"
              placeholder="09:00"
              maxlength="5"
          />
        </div>
        <div class="lg:col-span-2 md:col-span-6 col-span-12">
          <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('hcEvent.form.end_time')}}</label>
        <n-input
            v-mask="'##:##'"
            class="w-full"
            type="text"
            v-model:value="dashboardStore.dashboardParams.end_time"
            @keydown="handleTimeKeydownWithEnter($event, 'turnstile_end_time')"
            :loading="dashboardStore.loading"
            :disabled="dashboardStore.loading"
            placeholder="18:00"
            maxlength="5"
        />
        </div>
        
      </div>
</template>