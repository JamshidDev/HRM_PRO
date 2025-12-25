<script setup>
import {useScheduleGroupWorkerStore} from "@/store/modules/index.js"
import SearchElement from "@/pages/turnstile/schedule/ui/SearchElement.vue"
import Utils from "@/utils/Utils.js"
import MonthTab from "./MonthTab.vue"
import {MoreHorizontal32Filled} from "@vicons/fluent"
import {UIPagination} from "@components"


const store = useScheduleGroupWorkerStore()
const currentScheduleList = ref([])
const start = ref(null)
const end = ref(null)

watchEffect(()=>{
  currentScheduleList.value = store.list.map(v=>{
    const fullName = Utils.combineFullName(v)
    return {
      workerId:v.worker_id,
      workerPositionId:v.worker_position_id,
      fullName,
      position:v.position_name,
      days:v.days.map(e=>({
        date:e.date,
        isWorkDay:e.work_status,
        startTime:e.start_time || null,
        endTime:e.end_time || null,
        workTime:e.daily_minutes,
        isEmpty:e.id === null,
      })),
    }
  })
})

const calculateWorkTime = (index)=>{
  const totalMinute =  currentScheduleList.value[index].days.reduce((sum, item)=>sum+item.workTime, 0)
  return Math.floor(totalMinute/60)
}

const selectedDate = ref(null)

onMounted(()=>{
  start.value = store.params.year1+'-'+store.params.month1
  end.value =store.params.year2+'-'+store.params.month2
  selectedDate.value = store.params.year1+'-'+store.params.month1.toString().padStart(2, '0')
})

const onChange = (v)=>{

  store.params.year1 = v.split('-')[0]
  store.params.month1 = v.split('-')[1]
  store._dayOfMonth(()=>{
    store._index()
  })
}

const onChangePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onReplace = (v)=>{
    store.selectedWorker = v
    store._workers()
    store.replacePayload.positonId = null
    store.replacePayload.date = new Date().getTime()
    store.replaceVisible = true
}

</script>

<template>
  <div>
    <n-spin :show="store.dayOfMonthLoading || store.loading">
      <MonthTab
          v-if="selectedDate"
          class="mt-4"
          :start="start"
          :end="end"
          v-model:date="selectedDate"
          @update:date="onChange"
      />
      <div class="w-full overflow-auto relative h-[calc(100vh-290px)] mt-2">
        <div class="schedule-header-row flex z-[10] w-fit min-w-full sticky top-0">
          <div class="rounded-tl-lg border-r border-t border-l border-b border-surface-line p-2 w-[60px] min-w-[60px] h-[50px] sticky left-0 top-0 z-[20] bg-surface-section flex-shrink-0">
            N0
          </div>
          <div class="border-r border-t border-l-[0] border-b border-surface-line flex text-secondary font-medium justify-center items-center w-[320px] min-w-[340px] h-[50px] sticky left-[60px] top-0 z-[20] bg-surface-section flex-shrink-0">
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
        <template v-if="currentScheduleList.length>0">
          <div
              v-for="(worker, index) in currentScheduleList"
              :key="index"
              class="schedule-header-body-row flex w-fit min-w-full bg-surface-section"
          >
            <!-- Worker Name - Sticky Left -->
            <div class="border-r  border-l border-b border-t-0  border-surface-line text-center  p-2 w-[60px] min-w-[60px] h-[50px] border sticky left-0 bg-surface-section flex-shrink-0 z-[5] flex items-center justify-center">
              <span class="leading-[1.2] text-secondary font-medium">{{ (store.params.page - 1) * store.params.per_page + index + 1 }}</span>
            </div>
            <div class="border-r  border-l-[0] border-b border-t-0  border-surface-line  p-2 w-[340px] min-w-[320px] h-[50px] border sticky left-[60px] bg-surface-section flex-shrink-0 z-[5] flex items-center">
             <div class="w-[calc(100%-28px)]">
               <div class="line-clamp-1 leading-[1.2] font-medium">{{worker.fullName}}</div>
               <div class="text-xs line-clamp-1 leading-[1.2] text-secondary">{{worker.position}}</div>
             </div>

              <div @click="onReplace(worker)" class="w-[28px] h-[28px] border border-surface-line rounded-lg flex justify-center items-center text-secondary cursor-pointer">
                <n-icon size="20">
                  <MoreHorizontal32Filled/>
                </n-icon>
              </div>
            </div>

            <!-- Day Cells -->
            <template v-for="(day, dayIndex) in worker.days" >
              <div
                  class="border-r text-center  border-l border-b border-t-0 -ml-[1px] border-surface-line w-[60px] min-w-[60px] h-[50px] border text-xs text-secondary p-2 pb-0 flex-shrink-0 cursor-pointer relative"
              >
                <template v-if="worker.days?.[dayIndex].isEmpty"></template>
                <template v-else-if="worker.days?.[dayIndex].isWorkDay">
                  <div class="leading-[1.2] pt-3">{{worker.days?.[dayIndex]?.startTime}}</div>
                  <div class="leading-[1.2]">{{worker.days?.[dayIndex]?.endTime}}</div>
                  <div class="absolute top-[0] left-[0] w-[16px] h-[16px] bg-secondary/80 text-white text-xs rounded"> {{Math.floor(worker.days?.[dayIndex]?.workTime/60)}}</div>
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
      <UIPagination
          :page="store.params.page"
          :per_page="store.params.per_page"
          :total="store.totalItems"
          @change-page="onChangePage"
          :show-size-picker="false"
      />
    </n-spin>
  </div>
</template>
