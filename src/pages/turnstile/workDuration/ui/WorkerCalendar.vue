<script setup>
import dayjs from "dayjs"
import {useTurnstileWorkDurationStore} from "@/store/modules/index.js"
import {UIBadge, UIUser} from "@/components/index.js"
import {ChevronLeft12Regular} from '@vicons/fluent'
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
  closeDayLogs()
})
</script>

<template>
    <n-spin  class="worker-calendar" :show="store.instanceLoading">
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
            <div class="flex gap-2 items-center">
              <n-button circle secondary @click="closeDayLogs">
                <template #icon>
                  <n-icon :component="ChevronLeft12Regular" />
                </template>
              </n-button>
              <p class="text-lg" v-if="store.dayLogParams.date">{{Utils.timeOnlyDate(store.dayLogParams.date)}}</p>
            </div>
            <p class="truncate text-lg font-bold">
              {{store.dayLogParams.building?.name}}
            </p>
          </div>
          <div class="min-h-[500px] max-h-[600px] overflow-y-auto py-3 flex flex-col log-timeline">
              <template
                  v-for="(item, idx) in store.dayLogList" :key="idx"
              >
                <div class="flex gap-3 justify-center h-[50px]">
                  <div class="w-[300px] translate-y-[-5px]">
                    <template v-if="item.event_type">
                      <div class="flex items-center gap-2 justify-end">
                        <n-button type="primary" text size="tiny">
                          <span class="text-[14px]">{{$t('turnstile.workDurationPage.enter')}}</span>
                        </n-button>
                        <div>
                          <UIBadge :show-icon="false" :label="Utils.timeWithMonth(item?.event_time)" />
                        </div>
                      </div>
                    </template>
                  </div>
                  <div class="h-full relative">
                    <div :class="{'leave-dot': item.event_type, 'enter-dot': !item.event_type}" />
                    <div v-if="idx!==store.dayLogList.length-1" class="action-line" :class="{'leave-line': item.event_type, 'enter-line': !item.event_type}" />
                  </div>
                  <div class="w-[300px] translate-y-[-5px]">
                    <template v-if="!item.event_type">
                      <div class="flex items-center gap-2">
                        <div>
                          <UIBadge  :show-icon="false" :label="Utils.timeWithMonth(item?.event_time)" />
                        </div>
                        <n-button type="success" text size="tiny">
                          <span class="text-[14px]">{{$t('turnstile.workDurationPage.exit')}}</span>
                        </n-button>
                      </div>
                    </template>
                  </div>
                </div>
              </template>

          </div>
        </n-tab-pane>
      </n-tabs>
    </n-spin>
</template>

<style lang="scss">
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

.log-timeline{
  .leave-dot{
    z-index: 1;
    background: var(--surface-ground);
    position: relative;
    width: 16px;
    height: 16px;
    border: 3px solid var(--primary-color);
    border-radius: 50%;
  }

  .enter-dot{
    z-index: 1;
    background: var(--surface-ground);
    position: relative;
    width: 16px;
    height: 16px;
    border: 3px solid var(--success-color);
    border-radius: 50%;
  }
  .action-line{
    width: 2px;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%);
    right: 0;
    bottom: 0;
  }
  .enter-line{
    background-image: repeating-linear-gradient(
            to bottom,
            var(--success-color) 0px 5px,
            transparent 5px 10px
    );
  }

  .leave-line{
    background-image: repeating-linear-gradient(
            to bottom,
            var(--primary-color) 0px 5px,
            transparent 5px 10px
    );
  }

}

</style>