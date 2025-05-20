<script setup>
import dayjs from "dayjs"
import {useTurnstileWorkDurationStore} from "@/store/modules/index.js"

const store = useTurnstileWorkDurationStore()

const value = ref(dayjs().add(1, 'days').valueOf())

const filterEvent = () => {
  store._instance()
}

const onPanelChange = ({year, month}) => {
  store.workerParams.year = year
  store.workerParams.month = month
  filterEvent()
}

onMounted(() => {
  store.workerParams.year = new Date().getFullYear()
  store.workerParams.month = new Date().getMonth() + 1
  filterEvent()
})

onUnmounted(() => {
  store.instanceData = {}
  store.workerInstance = null
  store.workerParams.day = null
})

const dateToKey = (year, month, date) => {
  return dayjs(`${year}.${String(month).padStart(2, '0')}.${String(date).padStart(2, '0')}`).format("DDMMYYYY")
}

</script>

<template>
<!--  :value="store.workerParams.day ? 2 : 1"-->
  <n-spin :show="store.instanceLoading">
    <n-tabs :value="1" :tab-style="{display: 'none'}" animated>
      <n-tab-pane :name="1">
        <n-calendar
            @panel-change="onPanelChange"
            v-model:value="store.workerParams.day"
            #="{ year, month, date }"
        >
          <div class="absolute top-[50%] left-[50%] translate-[-50%]">
            <n-button v-if="store.instanceData[dateToKey(year, month, date)]?.hours" size="large" circle type="primary">
              {{ store.instanceData[dateToKey(year, month, date)]?.hours }}
            </n-button>
          </div>
        </n-calendar>
      </n-tab-pane>
      <n-tab-pane :name="2">
        <n-button @click="store.workerParams.day = null">Back</n-button>
      </n-tab-pane>
    </n-tabs>
  </n-spin>
</template>