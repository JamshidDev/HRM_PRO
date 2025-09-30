<script setup>
import TopDevices from './TopDevices.vue'
import DailyEventChart from './DailyEventChart.vue'
import MiniCard from './MiniCard.vue'
import WorkAnalyticCard from './WorkAnalyticCard.vue'
import {useEventStore} from "@/store/modules/index.js"

const store = useEventStore()
</script>

<template>
  <div class="grid grid-cols-12 gap-4">
    <template v-for="(item, idx) in store.workerStatuses" :key="idx">
      <div class="lg:col-span-3 md:col-span-6 col-span-12">
        <MiniCard
            :type="item.type"
            :badge-text="item.status"
            :count="item.count"
            :description="item.description"
            :icon="item.icon"
        />
      </div>
    </template>
    <div class="lg:col-span-8 col-span-12">
      <DailyEventChart/>
    </div>
    <div class="lg:col-span-4 md:col-span-6 col-span-12">
      <WorkAnalyticCard/>
    </div>
    <template v-for="(device, idx) in store.deviceStatusList" :key="idx">
      <div class="lg:col-span-3 md:col-span-6 col-span-12">
        <MiniCard
            :type="device.type"
            :badge-text="device.status"
            :count="device.count"
            :description="device.description"
            :icon="device.icon"
        />
      </div>
    </template>
    <div class="lg:col-span-3 md:col-span-6 col-span-12">
      <TopDevices/>
    </div>
  </div>
</template>
