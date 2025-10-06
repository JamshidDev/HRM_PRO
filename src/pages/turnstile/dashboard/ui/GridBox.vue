<script setup>
import TopDevices from './TopDevices.vue'
import DailyEventChart from './DailyEventChart.vue'
import MiniCard from './MiniCard.vue'
import WorkAnalyticCard from './WorkAnalyticCard.vue'
import {
  TopDevicesSkeleton,
  DailyEventChartSkeleton,
  WorkAnalyticCardSkeleton,
  MiniCardSkeleton
} from './skeleton/index.js'
import {useEventStore, useTurnstileDashboardStore} from "@/store/modules/index.js"

const dashboardStore = useTurnstileDashboardStore()


const onPreview = (v)=>{
  dashboardStore.yesterday = false
  dashboardStore.previewParams.type = v
  dashboardStore.previewList = []
  dashboardStore.previewVisible = true
}

const onPreviewDevice = (v)=>{
  dashboardStore.isOnlineDevice = v
  onPreview('device_status')
}

const onClickBar = (v)=>{
  dashboardStore.timeRange = v
  onPreview('daily_attendance')
}
</script>

<template>
  <div class="grid grid-cols-12 gap-4">

    <template v-if="dashboardStore.workerStatsLoading">
      <div v-for="idx in 4" :key="idx"  class="lg:col-span-3 md:col-span-6 col-span-12">
        <MiniCardSkeleton />
      </div>
    </template>
    <template v-else>
      <div v-for="(item, idx) in dashboardStore.workerStatuses" :key="idx" class="lg:col-span-3 md:col-span-6 col-span-12">
        <MiniCard
            @click="onPreview(item.previewType)"
            :type="item.type"
            :badge-text="item.status"
            :count="item.count"
            :description="item.description"
            :icon="item.icon"
        />
      </div>
    </template>

    <div class="lg:col-span-8 col-span-12">
      <DailyEventChartSkeleton v-if="dashboardStore.dailyAttendanceLoading" :height="240" :bars="12" />
      <DailyEventChart
      @bar-click="onClickBar"
       v-else />
       <!-- @click="onPreview('daily_attendance')" -->
    </div>

    <div class="lg:col-span-4 col-span-12">
      <WorkAnalyticCardSkeleton v-if="dashboardStore.workDurationsLoading" />
      <WorkAnalyticCard @click="onPreview('lesson_worked')" v-else />
    </div>

    <template v-if="dashboardStore.devicesLoading">
      <div v-for="idx in 3" :key="'device-skeleton-' + idx"  class="lg:col-span-3 md:col-span-6 col-span-12">
        <MiniCardSkeleton />
      </div>
    </template>
    <template v-else>
      <div v-for="(device, idx) in dashboardStore.deviceStatusList" :key="idx" class="lg:col-span-3 md:col-span-6 col-span-12">
        <MiniCard
            @click="onPreviewDevice(device.isOnlineDevice)"
            :loading="dashboardStore.dashboardLoading"
            :type="device.type"
            :badge-text="device.status"
            :count="device.count"
            :description="device.description"
            :icon="device.icon"
        />
      </div>
    </template>


    <div class="lg:col-span-3 md:col-span-6 col-span-12">
      <TopDevicesSkeleton v-if="dashboardStore.devicesLoading" />
      <TopDevices  @click="onPreview('devices')" v-else />
    </div>
  </div>
</template>
