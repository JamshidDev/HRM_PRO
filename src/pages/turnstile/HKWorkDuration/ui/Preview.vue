<script setup>
import { useHKWorkDurationStore } from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import { UIUser } from "@/components/index.js"
import { computed } from "vue"
import {Circle12Regular} from "@vicons/fluent"

const store = useHKWorkDurationStore()

// Computed property for calendar item data
const calendarItemData = computed(() => {
  const data = {}
  if (store.previewList && store.previewList.length > 0) {
    store.previewList.forEach(item => {
      if (item.event_date) {
        data[item.event_date] = {
          minute: Math.ceil(item.daily_minutes || 0),
          date: item.event_date,
          id: item.worker_id,
        }
      }
    })
  }
  return data
})

const getItemByDate = (year, month, day) => {
  const date = `${year}-${month.toString().length > 1 ? month : '0' + month}-${day.toString().length > 1 ? day : '0' + day}`
  return calendarItemData.value[date] || { minute: 0, date }
}

const onChangeMonth = ({ month, year }) => {
  const date = `${year}-${month.toString().length > 1 ? month : '0' + month}-'01`
  store.currentTime = new Date(date).getTime() || null
  store.params.year = year
  store.params.month = month
  store._show()
}

const onViewDetail = (v) => {
  if (!v.minute) return
  store._showEventsInDay(v.date, v.id)

}

</script>

<template>
  <n-spin :show="store.previewLoading">
    <n-tabs animated v-model:value="store.activeTab" class="hidden-tab-header" type="segment">
      <n-tab-pane :name="1">
        <n-calendar :key="`${store.params.year}-${store.params.month}`"
          class="mt-10 w-full min-h-[700px]! h-auto! custom-calendar" v-model:value="store.currentTime"
          :default-value="store.currentTime" @panel-change="onChangeMonth">
          <template #header="{ year, month, date }">
            <div class="flex">
              <div class="text-textColor0 w-[100px]">{{ year }}
                <p class="text-sm text-secondary !mt-0 leading-[1.2]">{{ Utils.getMonthNameById(month) }}</p>
              </div>
              <UIUser :short="false" class="w-[260px]" :data="{
                photo: store?.workerData.photo,
                firstName: store?.workerData.first_name,
                middleName: store?.workerData.middle_name,
                lastName: store?.workerData.last_name,
                position: store?.workerData.position_name,
              }" />

            </div>

          </template>


          <template #default="{ year, month, date }">
            <div class="flex flex-col w-full h-full p-1" @click="onViewDetail(getItemByDate(year, month, date))">
              <div>
                <template v-if="getItemByDate(year, month, date)?.minute">
                  <n-button circle type="primary" size="large">{{ getItemByDate(year, month, date)?.minute }}</n-button>
                </template>
              </div>
            </div>
          </template>
        </n-calendar>
      </n-tab-pane>
      <n-tab-pane :name="2">
        <div class="!min-h-[700px] flex flex-col overflow-y-auto">
          <div>
            <UIUser :short="false" class="w-[260px]" :data="{
                photo: store?.workerData.photo,
                firstName: store?.workerData.first_name,
                middleName: store?.workerData.middle_name,
                lastName: store?.workerData.last_name,
                position: store?.workerData.position_name,
              }" />
          </div>
          <template v-for="(item, idx) in store.eventInDayList" :key="idx">
            <div class="flex min-h-[40px] mx-auto">
              <div class="w-[200px] pb-4">
                <template v-if="!item.direction">
                  <p class="text-danger  text-right">{{ $t('hcWorkDuration.form.exit')  }}</p>
                <p class="text-secondary text-xs text-right">{{ item.event_date }} {{ item.event_time }}</p>
                </template>
                
              </div>
              <div class="w-[30px] flex flex-col">
                <n-icon :class="[item.direction? 'text-success' : 'text-danger']" class="mx-auto" :size="20"  :component="Circle12Regular" />
                <div class="h-full bg-surface-line w-[1px] mx-auto"></div>
              </div>
              <div class="w-[200px] pb-4">
               <template v-if="item.direction">
                <p class="text-success">{{ $t('hcWorkDuration.form.enter') }}</p>
                <p class="text-secondary text-xs">{{ item.event_date }} {{ item.event_time }}</p>
               </template>
              </div>
          </div>
          </template>
          
        </div>
      </n-tab-pane>
    </n-tabs>
  </n-spin>
</template>
