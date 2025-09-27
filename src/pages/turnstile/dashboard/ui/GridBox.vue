<script setup>
import TopDevices from './TopDevices.vue'
import DailyEventChart from './DailyEventChart.vue'
import MiniCard from './MiniCard.vue'
import {useEventStore} from "@/store/modules/index.js"

const store = useEventStore()
</script>

<template>
  <div class="grid grid-cols-12 gap-4">
    <template v-for="(device, idx) in store.deviceStatusList" :key="idx">
      <div class="col-span-3">
        <MiniCard
            :type="device.type"
            :status="device.status"
            :device-count="device.count"
        />
      </div>
    </template>
    <div class="lg:col-span-8 col-span-12">
      <DailyEventChart/>
    </div>
    <div class="lg:col-span-4 md:col-span-6 col-span-12">
      <TopDevices/>
    </div>
  </div>
</template>
