<script setup>
  import { useHKWorkDurationStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { UIUser } from '@/components/index.js'
  import { computed } from 'vue'

  const store = useHKWorkDurationStore()

  const calendarItemData = computed(() => {
    const data = {}
    if (store.previewList && store.previewList.length > 0) {
      store.previewList.forEach((item) => {
        if (item.event_date) {
          data[item.event_date] = {
            minute: Math.ceil(item.daily_minutes || 0),
            date: item.event_date,
            id: item.worker_id
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
  <n-calendar
    :key="`${store.params.year}-${store.params.month}`"
    class="mt-10 w-full min-h-[700px]! h-auto! custom-calendar"
    v-model:value="store.currentTime"
    :default-value="store.currentTime"
    @panel-change="onChangeMonth"
  >
    <template #header="{ year, month, date }">
      <div class="flex">
        <div class="text-textColor0 w-[100px]">
          {{ year }}
          <p class="text-sm text-secondary !mt-0 leading-[1.2]">
            {{ Utils.getMonthNameById(month) }}
          </p>
        </div>
        <UIUser
          :short="false"
          class="w-[260px]"
          :data="{
            photo: store?.workerData.photo,
            firstName: store?.workerData.first_name,
            middleName: store?.workerData.middle_name,
            lastName: store?.workerData.last_name,
            position: store?.workerData.position_name
          }"
        />
      </div>
    </template>

    <template #default="{ year, month, date }">
      <div
        class="flex flex-col w-full h-full p-1"
        @click="onViewDetail(getItemByDate(year, month, date))"
      >
        <div>
          <template v-if="getItemByDate(year, month, date)?.minute">
            <n-button circle type="primary" size="large">{{
              Math.ceil(getItemByDate(year, month, date)?.minute / 60)
            }}</n-button>
          </template>
        </div>
      </div>
    </template>
  </n-calendar>
</template>
