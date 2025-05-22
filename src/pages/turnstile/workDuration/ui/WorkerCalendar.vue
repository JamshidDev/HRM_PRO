<script setup>
import dayjs from "dayjs"
import {useTurnstileWorkDurationStore} from "@/store/modules/index.js"
import {UIUser} from "@/components/index.js"
import {Dismiss32Regular, ChevronLeft12Regular, HatGraduation12Filled} from '@vicons/fluent'
import Utils from "@/utils/Utils.js"

const store = useTurnstileWorkDurationStore()

const filterEvent = () => {
  store._instance()
}

const onPanelChange = ({year, month}) => {
  store.calendarParams.year = year
  store.calendarParams.month = month
  filterEvent()
}

const viewDayLogs = (date, building)=>{
  console.log(date, building)
  store.dayLogParams.date = date
  store.dayLogParams.building = building
  store._logs()
}

const closeDayLogs = ()=>{
  store.dayLogParams.date = null
  store.dayLogParams.building = null
  store.dayLogList = []
}

onMounted(() => {
  store.calendarParams.year = new Date().getFullYear()
  store.calendarParams.month = new Date().getMonth() + 1
  filterEvent()
})

onUnmounted(() => {
  store.workerInstance = null
})
</script>

<template>
    <n-spin  class="worker-calendar" :show="store.instanceLoading">
<!--  <n-card-->
<!--      title="Modal"-->
<!--      :bordered="false"-->
<!--      size="huge"-->
<!--      role="dialog"-->
<!--      aria-modal="true"-->
<!--      class="p-3 worker-calendar pt-6"-->
<!--      :style="{width:'1000px'}"-->
<!--      closable-->
<!--  >-->
<!--    <div class="absolute top-1 right-3 cursor-pointer">-->
<!--      <n-button circle size="tiny" type="error" secondary @click="store.workerInstance = null">-->
<!--        <template #icon>-->
<!--          <n-icon :component="Dismiss32Regular"/>-->
<!--        </template>-->
<!--      </n-button>-->
<!--    </div>-->
      <n-tabs :value="store.dayLogParams.building ? 2 : 1" :tab-style="{display: 'none'}" :pane-style="{padding: 0}" animated>
        <n-tab-pane :name="1">
          <n-calendar
              @panel-change="onPanelChange"
              :value="null"
          >
            <template #default="{ year, month, date }">
              <div
                  class="absolute top-0 left-0 right-0 bottom-0 rounded-full gap-1 p-5 justify-center items-center flex flex-wrap"
                  v-if="store.instanceData[store.dateToKey(year, month, date)]">
                <template v-for="(data, idx) in store.instanceData[store.dateToKey(year, month, date)].data" :key="idx">
                  <div class="grow shrink-0 basis-[40px] flex justify-center items-center">
                    <n-tooltip trigger="hover">
                      <template #trigger>
                        <div
                            @click="viewDayLogs(store.instanceData[store.dateToKey(year, month, date)].date, data.building)"
                            class="h-[40px] w-[40px] transition-all
                              bg-primary hover:bg-primary/80 rounded-full flex
                              justify-center items-center
                              text-surface-section
                              font-bold text-xl
                              cursor-pointer">
                          {{ Math.round(data.total_minutes/60) }}

                        </div>
                      </template>
                      {{ data.building.name }}
                    </n-tooltip>

                  </div>
                </template>
              </div>
            </template>
            <template v-slot:header="{year, month}">
              <div class="pl-2 flex items-center">
                <UIUser
                    v-if="store.workerInstance"
                    :data="{
                       photo:store.workerInstance.worker?.photo,
                       lastName:store.workerInstance.worker.last_name,
                       firstName:store.workerInstance.worker.first_name,
                       middleName:store.workerInstance.worker.middle_name,
                       position:store.workerInstance.worker_position
                    }"
                />
                <p class="grow basis-auto text-center">
                  {{ dayjs(`${year}.${String(month).padStart(2, '0')}.01`).format("MMM, YYYY") }}</p>
              </div>
            </template>
          </n-calendar>
        </n-tab-pane>
        <n-tab-pane :name="2">
          <div class="flex justify-between p-2 pl-0 border-b border-surface-line">
            <n-button circle secondary @click="closeDayLogs">
              <template #icon>
                <n-icon :component="ChevronLeft12Regular" />
              </template>
            </n-button>
            <p class="truncate text-lg font-bold">
              {{store.dayLogParams.building?.name}}
            </p>
          </div>
          <div class="min-h-[250px] max-h-[600px] overflow-y-auto">
            <n-timeline item-placement="right" class="w-full mt-3 p-3">
              <template
                  v-for="(item, idx) in store.dayLogList" :key="idx"
              >
                <n-timeline-item
                    :type="item.event_type ? 'success' : 'error'"
                    :time="Utils.timeWithMonth(item?.event_time)"
                    :title="$t(item.event_type ? 'turnstile.workDurationPage.enter' : 'turnstile.workDurationPage.exit')"
                    :content="$t(item.status === 'in-work' ? 'turnstile.workDurationPage.at_work' : 'turnstile.workDurationPage.outside')"
                    line-type="dashed"
                />
              </template>

            </n-timeline>
          </div>
        </n-tab-pane>
      </n-tabs>
<!--  </n-card>-->
    </n-spin>
</template>

<style>
.worker-calendar .n-calendar-header__title {
  width: 100%;
}

.worker-calendar .n-calendar-cell {
  cursor: default !important;
}

.worker-calendar .n-calendar-cell:hover {
  background-color: initial !important;
}

.worker-calendar .n-calendar-cell--other-month {
  pointer-events: none;
  background-color: var(--surface-ground);
}

.worker-calendar .n-calendar-cell--other-month .n-calendar-date__date {
  display: none !important;
}

.worker-calendar .n-calendar-cell--other-month .n-calendar-date {
  justify-content: end !important;
}

</style>