<script setup>
import {NoDataPicture} from "@/components/index.js"
import {useSyncLogStore} from "@/store/modules/index.js"
import i18n from "@/i18n/index.js"

const {t} = i18n.global
const store = useSyncLogStore()
</script>

<template>
  <n-spin :show="store.offlineDeviceLoading" style="min-height: 200px">
    <div class="w-full overflow-x-auto h-[calc(100vh-100px)]"  v-if="store.offlineDeviceList.length>0">
      <n-table
          class="mt-4"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="text-center! min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[100px]">{{$t('content.name')}}</th>
          <th class="min-w-[100px] w-[300px]">{{$t('syncLog.form.deviceId')}}</th>
          <th class="min-w-[100px] w-[300px]">{{$t('syncLog.form.logId')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.offlineDeviceList" :key="idx">
          <td>{{idx+1}}</td>
          <td>{{item.name}}</td>
          <td>{{item.hik_central_device_id}}</td>
          <td>{{item.sync_h_c_p_access_log_id}}</td>

        </tr>
        </tbody>
      </n-table>
    </div>
    <NoDataPicture v-if="store.offlineDeviceList.length===0 && !store.offlineDeviceLoading" />
  </n-spin>
</template>
