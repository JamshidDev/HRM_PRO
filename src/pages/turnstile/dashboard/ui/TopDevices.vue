<script setup>
import {useEventStore} from "@/store/modules/index.js"
const store = useEventStore()

</script>

<template>
  <div class="w-full grid grid-cols-12 gap-2 bg-surface-section px-3 py-2 rounded-lg border border-surface-line hover-effect-card">
    <div class="col-span-6">
      <div class="w-full bg-gradient-to-b from-success to-success/60 p-2 rounded-lg text-white leading-[1.2]">
        <p class="font-bold">{{store.devices?.online || 0}}</p>
        <p class="text-xs">{{$t('turnStileDashboard.form.onlineDevice')}}</p>
      </div>
    </div>
    <div class="col-span-6">
      <div class="w-full bg-gradient-to-b from-danger to-danger/60 p-2 rounded-lg text-white leading-[1.2]">
        <p class="font-bold">{{store.devices?.offline || 0}}</p>
        <p class="text-xs">{{$t('turnStileDashboard.form.offlineDevice')}}</p>
      </div>
    </div>
    <div class="col-span-12 flex items-center">
      <span class="text-nowrap text-secondary text-sm">{{$t('turnStileDashboard.form.topOfflineDevices')}}</span>
      <n-divider dashed  class="mx-2 !my-4"/>
      <span class="font-semibold text-secondary">{{store.totalOfflineDeviceCount}}</span>
    </div>
    <template v-for="(item,idx) in store.topOfflineDeviceList" :key="idx">
      <div class="col-span-12 flex gap-2 bg-danger/3 m-1 rounded-lg px-2 py-1 border border-danger/30">
        <div class="w-[32px] h-[32px] flex justify-center items-center rounded-full bg-surface-section text-secondary">
          #{{idx+1}}
        </div>
        <div class="w-[calc(100%-32px)]">
          <p class="text-textColor2 leading-[1.2] font-semibold">{{item.area_name}}</p>
          <p class="text-xs text-secondary leading-[1.2]">{{$t('turnStileDashboard.form.lastSynchronizationTime')}}: {{item.last_sync}}</p>
        </div>
      </div>
    </template>

  </div>
</template>
