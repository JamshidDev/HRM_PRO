<script setup>
import {useShiftTypeStore} from "@/store/modules/index.js"
import {UIModal, UINSelect} from "@/components/index.js"
import SearchElement from "@/pages/turnstile/schedule/ui/SearchElement.vue"
import MonthTab from "@/pages/turnstile/scheduleWorker/ui/MonthTab.vue"

const store = useShiftTypeStore()

const currentScheduleList = ref([])

const onSubmit = ()=>{
  const data = {
    start_date:`${store.generatePayload.year1}-${store.generatePayload.month1.toString().padStart(2, '0')}-01`,
    end_date:`${store.generatePayload.year2}-${store.generatePayload.month2.toString().padStart(2, '0')}-01`,
    schedule_type:store.elementId,
    count:store.showGroupCountField? store.generatePayload.count : undefined,
    schedule_workers:store.workers.map((v, index)=>({
      worker_position_id:v.id,
      day:index+1,
    }))
  }
  store._generateWorkerSchedule(data)
}

watchEffect(()=>{
  const month = store.uiParams.month?.toString()?.length>1? store.uiParams.month : '0'+store.uiParams.month
  const date = `${store.uiParams.year}-${month}`

  currentScheduleList.value = store.scheduleList.map(v=>{
     return v.filter(x=>x.date.startsWith(date)).map(e=>({
       date:e.date,
      isWorkDay:e.work_status,
      startTime:e.start_time || null,
      endTime:e.end_time || null,
      workTime:e.daily_minutes,
    }))
  })


})

const calculateWorkTime = (index)=>{
  const month = store.uiParams.month?.toString()?.length>1? store.uiParams.month : '0'+store.uiParams.month
  const date = `${store.uiParams.year}-${month}`
  const totalMinute =  store.scheduleList[index].filter(x=>x.date.startsWith(date)).reduce((sum, item)=>sum+item.daily_minutes, 0)
  return Math.floor(totalMinute/60)
}


const onChange = (v)=>{
  store.scheduleParams.year = v.split('-')[0]
  store.scheduleParams.month = v.split('-')[1]
  store._dayOfMonth()
}

const onSearch = (v)=>{
  store.workerParams.search = v
  store.workerParams.page = 1
  store._getWorkers()

}


</script>

<template>
  <UIModal
      v-model:visible="store.scheduleVisible"
      :width="'90%'"
      :title="$t('shiftType.createTitle')">

    <div>
      <n-spin :show="store.dayOfMonthLoading">
        <MonthTab
            v-if="store.scheduleVisible"
            class="mt-4"
            :start="store.generatePayload.year1+'-'+store.generatePayload.month1"
            :end="store.generatePayload.year2+'-'+store.generatePayload.month2"
            v-model:date="store.selectedDate"
            @update:date="onChange"
        />
        <div class="w-full overflow-auto relative h-[460px] mt-4">
          <div class="schedule-header-row flex z-[10] w-fit min-w-full sticky top-0">
            <div class="rounded-tl-lg border-r border-t border-l border-b border-surface-line p-2 w-[60px] min-w-[60px] h-[50px] sticky left-0 top-0 z-[20] bg-surface-section flex-shrink-0">
              N0
            </div>
            <div class="border-r border-t border-l-[0] border-b border-surface-line flex text-secondary font-medium justify-center items-center w-[260px] min-w-[320px] h-[50px] sticky left-[60px] top-0 z-[20] bg-surface-section flex-shrink-0">
              <SearchElement/>
            </div>
            <template v-for="item in store.dayOfMonth" :key="`header-${item}`">
              <div
                  :class="[[6,0].includes(item.weekDay)? 'bg-[#ffe5e2]' : 'bg-[#fff9e2]']"
                  class="border-r border-t border-l border-b -ml-[1px] border-surface-line w-[60px] min-w-[60px] h-[50px] text-xs text-secondary  flex-shrink-0">
                <div class="text-center p-1 font-bold">{{ item?.day }}</div>
                <div class="text-center p-1">{{store.shortNameOfWeek[item.weekDay] || '-'}}</div>
              </div>
            </template>
            <div class="rounded-tr-lg border-r border-t border-l border-b -ml-[1px] text-xs text-secondary flex justify-center items-center p-2 border-surface-line w-[80px] min-w-[80px] h-[50px] sticky right-0 top-0 bg-surface-section flex-shrink-0 z-[20]">
              {{$t('schedule.form.workTime')}}
            </div>
          </div>
          <template v-if="currentScheduleList?.[0]?.length>0">
            <div
                v-for="(worker, index) in currentScheduleList"
                :key="index"
                class="schedule-header-body-row flex w-fit min-w-full bg-surface-section"
            >
              <!-- Worker Name - Sticky Left -->
              <div class="border-r  border-l border-b border-t-0  border-surface-line text-center  p-2 w-[60px] min-w-[60px] h-[50px] border sticky left-0 bg-surface-section flex-shrink-0 z-[5] flex items-center justify-center">
                <span class="leading-[1.2] text-secondary font-medium">{{index+1}}</span>
              </div>
              <div class="border-r  border-l-[0] border-b border-t-0  border-surface-line  p-2 w-[320px] min-w-[260px] h-[50px] border sticky left-[60px] bg-surface-section flex-shrink-0 z-[5] flex flex-col">
                <UINSelect
                    clearable
                    :query="store.workerParams.search"
                    :options="store.workerList"
                    :value-field="'id'"
                    v-model:value="store.workers[index].id"
                    @onSearch="onSearch"
                    :loading="store.workerLoading"
                />
              </div>

              <!-- Day Cells -->
              <template v-for="(day, dayIndex) in worker" >
                <div
                    class="border-r text-center  border-l border-b border-t-0 -ml-[1px] border-surface-line w-[60px] min-w-[60px] h-[50px] border text-xs text-secondary p-2 pb-0 flex-shrink-0 cursor-pointer relative"
                >
                  <template v-if="worker?.[dayIndex].isWorkDay">
                    <div class="leading-[1.2] pt-3">{{worker?.[dayIndex]?.startTime}}</div>
                    <div class="leading-[1.2]">{{worker?.[dayIndex]?.endTime}}</div>
                    <div class="absolute top-[0] left-[0] w-[16px] h-[16px] bg-secondary/80 text-white text-xs rounded"> {{Math.floor(worker?.[dayIndex]?.workTime/60)}}</div>
                  </template>
                  <template v-else>
                    <div class="absolute top-[0] left-[0] w-[16px] h-[16px] bg-success/10 text-white text-xs rounded hover:bg-success/50"> D</div>
                  </template>

                </div>
              </template>

              <!-- Total - Sticky Right -->
              <div class="border-r border-l border-b -ml-[1px] border-surface-line  w-[80px] min-w-[80px] h-[50px] sticky right-0 bg-surface-section flex-shrink-0 z-[5] flex items-center justify-center">
                {{calculateWorkTime(index)}}
              </div>
            </div>
          </template>
          <template v-else>
            <div class="w-full text-center h-[300px] sticky left-0 flex justify-center items-center text-secondary">{{$t('content.no-data')}}</div>
          </template>

        </div>
      </n-spin>
      <div class="flex justify-end gap-4 pt-6">
        <n-button @click="store.scheduleVisible=false" type="error">{{$t('content.cancel')}}</n-button>
        <n-button :loading="store.saveLoading" type="primary" @click="onSubmit">{{$t('content.save')}}</n-button>
      </div>
    </div>

  </UIModal>
</template>
