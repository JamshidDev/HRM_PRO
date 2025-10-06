<script setup>
import {useEventStore, useTurnstileDashboardStore} from "@/store/modules/index.js"
const store = useEventStore()
const dashboardStore = useTurnstileDashboardStore()

</script>

<template>
  <div class="w-full !h-full bg-surface-section px-3 pt-1 rounded-lg border border-surface-line hover-effect-card">
    <div class="grid grid-cols-12">
      <div class="col-span-12 flex items-center">
        <span class="xl:text-sm lg:text-xs text-sm xl:text-nowrap lg:text-wrap text-nowrap leading-[1.2]  mb-2">{{$t('turnStileDashboard.form.topOfflineDevices')}}</span>
        <n-divider dashed  class="mx-2 !my-4"/>
        <span class="font-semibold text-secondary text-nowrap">{{dashboardStore.totalOfflineDeviceCount}}</span>
      </div>
      <template v-for="(item,idx) in dashboardStore.topOfflineDeviceList" :key="idx">
        <div class="col-span-12 flex gap-2 mb-1 rounded-lg px-2">
          <div class="flex justify-between w-full">
            <p class="leading-[1.2]  text-xs text-secondary">{{item.area_name}}</p>
            <p class="text-xs text-danger bg-danger/10 rounded-lg px-2 leading-[1.2]">{{item.last_sync}}</p>
          </div>
        </div>
      </template>
    </div>

  </div>
</template>
