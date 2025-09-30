<script setup>
import TopDevices from './TopDevices.vue'
import TopDevicesSkeleton from './TopDevicesSkeleton.vue'
import DailyEventChart from './DailyEventChart.vue'
import DailyEventChartSkeleton from './DailyEventChartSkeleton.vue'
import MiniCard from './MiniCard.vue'
import WorkAnalyticCard from './WorkAnalyticCard.vue'
import WorkAnalyticCardSkeleton from './WorkAnalyticCardSkeleton.vue'
import MiniCardSkeleton from './MiniCardSkeleton.vue'
import {useEventStore} from "@/store/modules/index.js"

const store = useEventStore()
</script>

<template>
  <div class="grid grid-cols-12 gap-4">
    <!-- Skeleton kartalar: faqat dastlabki yuklanishda (ro'yxatlar bo'sh bo'lsa) ko'rsatilsin -->
    <template v-if="store.dashboardLoading && (!store.workerStatuses || !store.workerStatuses.length)" v-for="idx in 4" :key="'skeleton-' + idx">
      <div class="lg:col-span-3 md:col-span-6 col-span-12">
        <MiniCardSkeleton />
      </div>
    </template>


    <template v-if="store.workerStatsLoading">
      <div v-for="idx in 4" :key="idx"  class="lg:col-span-3 md:col-span-6 col-span-12">
        <MiniCardSkeleton />
      </div>
    </template>
    <template v-else>
      <div v-for="(item, idx) in store.workerStatuses" :key="idx" class="lg:col-span-3 md:col-span-6 col-span-12">
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
      <DailyEventChartSkeleton v-if="store.dailyAttendanceLoading" :height="240" :bars="12" />
      <DailyEventChart v-else />
    </div>

    <div class="lg:col-span-4 md:col-span-6 col-span-12">
      <WorkAnalyticCardSkeleton v-if="store.workDurationsLoading" />
      <WorkAnalyticCard v-else />
    </div>

    <template v-if="store.devicesLoading">
      <div v-for="idx in 3" :key="'device-skeleton-' + idx"  class="lg:col-span-3 md:col-span-6 col-span-12">
        <MiniCardSkeleton />
      </div>
    </template>
    <template v-else>
      <div v-for="(device, idx) in store.deviceStatusList" :key="idx" class="lg:col-span-3 md:col-span-6 col-span-12">
        <MiniCard
            :loading="store.dashboardLoading"
            :type="device.type"
            :badge-text="device.status"
            :count="device.count"
            :description="device.description"
            :icon="device.icon"
        />
      </div>
    </template>


    <div class="lg:col-span-3 md:col-span-6 col-span-12">
      <TopDevicesSkeleton v-if="store.devicesLoading" />
      <TopDevices v-else />
    </div>
  </div>
</template>
