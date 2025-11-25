<script setup>
import {useScheduleTableStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import i18n from "@/i18n/index.js"
const store = useScheduleTableStore()

const t = i18n.global.t
const filterEvent = ()=>{
    store._allWorkers()
}


const onSelectWorkDay = (v)=>{

  const selectedType  =store.scheduleTypes.filter(x=>x.id ===v)
  if(selectedType.length === 0) return
  store.workDays = selectedType[0].days.map(item=>{
    return {
      name:`${item?.day} - kun ` + (item?.work_status? `${item?.start_time} - ${item?.end_time}`: 'Dam kuni'),
      id:item.day,
    }
  })

  const options = selectedType[0].days.filter(x=>x?.work_status).map(item=>({
    label: `${item.start_time} - ${item.end_time}`,
    startTime:item.start_time,
    endTime:item.end_time,
    workTime:store._calculateMinute(item.start_time, item.end_time),
    workStatus:true,
    key:item.day,
    icon: () => '⏱️'
  }))

  store.contextOptions = [...options, ...store.defaultOptions]
  filterEvent()
}

const onChangeDate = ()=>{
  store.workerList = []
  store._dayOfMonth(()=>{
    store._allWorkers()
  })
}

</script>

<template>
  <div class="flex gap-2 py-2">
    <div  class="w-[220px]">
      <label class="mt-3 text-xs mb-1 font-medium text-secondary">{{$t('content.year')}}</label>
      <n-select
          v-model:value="store.params.year"
          :options="Utils.yearList"
          label-field="name"
          value-field="id"
          @update:value="onChangeDate"
      />
    </div>
    <div  class="w-[220px]">
      <label class="mt-3 text-xs mb-1 font-medium text-secondary">{{$t('content.month')}}</label>
      <n-select
          v-model:value="store.params.month"
          :options="Utils.monthList"
          label-field="name"
          value-field="id"
          @update:value="onChangeDate"
      />
    </div>
    <div  class="w-[300px]">
      <label class="mt-3 text-xs mb-1 font-medium text-secondary">{{$t('schedule.form.scheduleType')}}</label>
      <n-select
          v-model:value="store.params.type"
          :options="store.scheduleTypes"
          label-field="name"
          value-field="id"
          @update:value="onSelectWorkDay"
          :loading="store.scheduleLoading"
          filterable
      />
    </div>
    <n-button class="!mt-5" type="primary" @click="store._save()" :loading="store.savingLoading">{{$t('content.save')}}</n-button>


  </div>
</template>
