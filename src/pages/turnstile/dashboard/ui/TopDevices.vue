<script setup>
import {useEventStore} from "@/store/modules/index.js"
const store = useEventStore()

</script>

<template>
  <div class="w-full !h-full bg-surface-section px-3 py-2 rounded-lg border border-surface-line hover-effect-card">
    <div class="grid grid-cols-12">
      <div class="col-span-12 flex items-center">
        <span class="text-nowrap text-danger text-sm">{{$t('turnStileDashboard.form.topOfflineDevices')}}</span>
        <n-divider dashed  class="mx-2 !my-4"/>
        <span class="font-semibold text-secondary">{{store.totalOfflineDeviceCount}}</span>
      </div>
      <template v-for="(item,idx) in store.topOfflineDeviceList" :key="idx">
        <div class="col-span-12 flex gap-2 bg-dark/3 mb-1 rounded-lg px-2 border-b border-b-surface-line">
          <div class="flex justify-between w-full">
            <p class="text-textColor2 leading-[1.2]">{{item.area_name}}</p>
            <p class="text-xs text-secondary leading-[1.2]">{{item.last_sync}}</p>
          </div>
        </div>
      </template>
    </div>

  </div>
</template>
