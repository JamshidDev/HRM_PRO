<script setup>
import {useTurnstileDashboardStore} from "@/store/modules/index.js"
import {ArrowCircleDown48Regular} from "@vicons/fluent"
import i18n from "@/i18n/index.js"
import {useAppSetting} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import { onMounted, getCurrentInstance } from "vue"
import {useDebounce} from "@/utils/index.js"

const {t} = i18n.global
const dashboardStore = useTurnstileDashboardStore()

const statusOptions = [
  {
    name:t('turnStileDashboard.options.max'),
    id:'max'
  },
  {
    name:t('turnStileDashboard.options.min'),
    id:'min'
  }
]
const filterVisible = ref({
    date:false,
    hours:false,
    start_time:false,
    end_time:false,
    norm_hours:false,
    status:false,
})
const resetFilterVisible = ()=>{
  Object.keys(filterVisible.value).forEach((key)=>{filterVisible.value[key] = false})
}
const filterEvent = ()=>{
  dashboardStore._preview(true)
}
const debouncedEvent = useDebounce(filterEvent,600)



const onSearchEv=()=>{
  debouncedEvent()
}



const controlFilterEv = (v)=>{

  resetFilterVisible()
  dashboardStore.resetPreviewParams()
  const cardType = dashboardStore.previewParams.type

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const todayTimestamp = today.getTime()
  const yesterdayTimestamp = yesterday.getTime()
  dashboardStore.previewParams.date = dashboardStore.yesterday? yesterdayTimestamp : todayTimestamp
  filterVisible.value.date = true

  if(dashboardStore.cardTypes.late_come.key === cardType){
    filterVisible.value.start_time = true

    dashboardStore.previewParams.start_time = localStorage.getItem('turnstile_start_time') || '09:00';

  }else if(dashboardStore.cardTypes.not_come.key === cardType && dashboardStore.yesterday){
  }else if(dashboardStore.cardTypes.early_leave.key === cardType && dashboardStore.yesterday){
    filterVisible.value.end_time = true

    dashboardStore.previewParams.end_time =localStorage.getItem('turnstile_end_time') || '18:00';
  }else if(dashboardStore.cardTypes.early_leave.key === cardType && dashboardStore.yesterday){
    filterVisible.value.end_time = true

    dashboardStore.previewParams.end_time = localStorage.getItem('turnstile_end_time') || '18:00';
  }else if(dashboardStore.cardTypes.daily_attendance.key === cardType){
    filterVisible.value.start_time = true
    filterVisible.value.end_time = true

    dashboardStore.previewParams.start_time =dashboardStore.timeRange?.start_time || dashboardStore.previewParams.start_time
    dashboardStore.previewParams.end_time =dashboardStore.timeRange?.end_time || dashboardStore.previewParams.end_time
  }else if(dashboardStore.cardTypes.devices.key === cardType){
    dashboardStore.previewParams.date = null
    filterVisible.value.date = false

  }else if(dashboardStore.cardTypes.device_status.key === cardType){
    filterVisible.value.date = false
  }else if(dashboardStore.cardTypes.lesson_worked.key === cardType){
    filterVisible.value.norm_hours = true
    filterVisible.value.status = true
    dashboardStore.previewParams.norm_hours = '8'
    dashboardStore.previewParams.status = 'max'
  }


  

  
  dashboardStore._preview()
}

const onEnter = ()=>{
  dashboardStore._preview()
}

const handleTimeKeydownWithEnter = (event, key) => {
  if (event.key === 'Enter') {
    onEnterTime(key)
  } else {
    Utils.handleTimeKeydown(event)
  }
}

const onEnterTime = (key)=>{
  if(dashboardStore.previewParams.start_time?.length===5 || dashboardStore.previewParams.end_time?.length===5){
    const value =key === 'turnstile_start_time'? dashboardStore.previewParams.start_time : dashboardStore.previewParams.end_time
    localStorage.setItem(key,value)
    dashboardStore._preview()
  }

}

onMounted(()=>{
  controlFilterEv()
  debouncedEvent.cancel()
})


</script>

<template>
   <div class="w-full grid gap-2 grid-cols-12 mb-2">
     <div class="col-span-2">
       <label class="mt-3 text-xs text-gray-500">{{$t('content.search')}}</label>
       <n-input
           class="w-full"
           type="text"
           v-model:value="dashboardStore.previewParams.search"
           :loading="dashboardStore.previewLoading"
           :on-keyup="onSearchEv"
           @clear="onSearchEv"
           @paste="onSearchEv"
           clearable
       />
     </div>
     <div v-if="filterVisible.date" class="col-span-2">
         <label class="mt-3 text-xs text-gray-500">{{ $t('content.date') }}</label>
         <n-date-picker
             v-model:value="dashboardStore.previewParams.date"
             @update:value="filterEvent"
             type="date"
             :format="useAppSetting.datePicketFormat"
             :loading="dashboardStore.previewLoading"
             :disabled="dashboardStore.previewLoading"
             :actions="[]"
             />
       </div>

      <div v-if="filterVisible.norm_hours" class="col-span-2">
        <label class="text-textColor3 ml-1">{{$t('turnStileDashboard.perview.norm_hours')}}</label>
        <n-input
            v-mask="'#'"
            class="w-full"
            type="text"
            v-model:value="dashboardStore.previewParams.norm_hours"
            @keydown.enter="onEnter"
            :loading="dashboardStore.previewLoading"
            :disabled="dashboardStore.previewLoading"
        />
      </div>
     
      <div v-if="filterVisible.hours" class="col-span-2">
        <label class="text-textColor3 ml-1">{{$t('hcEvent.form.hours')}}</label>
        <n-input
            v-mask="'##'"
            class="w-full"
            type="text"
            v-model:value="dashboardStore.previewParams.hours"
            @keydown.enter="onEnter"
            :loading="dashboardStore.previewLoading"
            :disabled="dashboardStore.previewLoading"
        />
      </div>
       <div v-if="filterVisible.start_time" class="col-span-2">
         <label class="text-textColor3 ml-1">{{$t('hcEvent.form.start_time')}}</label>
         <n-input
             v-mask="'##:##'"
             class="w-full"
             type="text"
             @keydown="handleTimeKeydownWithEnter($event, 'turnstile_start_time')"
             v-model:value="dashboardStore.previewParams.start_time"
             :loading="dashboardStore.previewLoading"
             :disabled="dashboardStore.previewLoading"
             placeholder="09:00"
             maxlength="5"
         />
       </div>
       <div v-if="filterVisible.status" class="col-span-2">
        <label class="text-textColor3 ml-1">{{$t('turnStileDashboard.options.status')}}</label>
        <n-select
            v-model:value="dashboardStore.previewParams.status"
            :options="statusOptions"
            @update:value="filterEvent"
            :loading="dashboardStore.previewLoading"
            value-field="id"
            label-field="name"
        />
       </div>
      <div v-if="filterVisible.end_time" class="col-span-2">
        <label class="text-textColor3 ml-1">{{$t('hcEvent.form.end_time')}}</label>
        <n-input
            v-mask="'##:##'"
            class="w-full"
            type="text"
            v-model:value="dashboardStore.previewParams.end_time"
            @keydown="handleTimeKeydownWithEnter($event, 'turnstile_end_time')"
            :loading="dashboardStore.previewLoading"
            :disabled="dashboardStore.previewLoading"
            placeholder="18:00"
            maxlength="5"
        />
      </div>
      <div class="col-span-2">
        <n-button @click="dashboardStore._download()" :loading="dashboardStore.previewLoading" type="default" class="!mt-5 !w-full">
          {{$t('content.download')}}
          <template #icon>
            <ArrowCircleDown48Regular/>
          </template>
        </n-button>
      </div>

    </div>
</template>
