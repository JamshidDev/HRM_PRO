<script setup>
import {useTurnstileHikCentralStore} from "@/store/modules/index.js"
import {ArrowSync24Filled, DeviceEq24Filled, Search48Filled} from "@vicons/fluent"
const store = useTurnstileHikCentralStore()

const onSearchEv = () => {
  let query =store.searchModel?.toString()?.trim()?.toLowerCase()
  if(!Boolean(query)){
    store.onlineDeviceList = store.originList
  }else{
    store.onlineDeviceList = store.originList.filter(v=>v?.name?.toString()?.toLowerCase()?.includes(query))
  }

}
</script>

<template>
<div class="w-full">
  <n-spin :show="store.onlineDeviceLoading">
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12 md:col-span-6">
        <n-input
            v-model:value="store.searchModel"
            class="w-full skip-format"
            :placeholder="$t('content.search')"
            :on-keyup="onSearchEv"
            :loading="store.onlineDeviceLoading"
        >
          <template #suffix>
            <n-icon :component="Search48Filled" />
          </template>
        </n-input>
      </div>
      <div class="col-span-12 md:col-span-6 flex justify-end">
        <n-button type="primary" @click="store._refreshDevice()" :loading="store.onlineDeviceLoading">
          {{$t('content.refresh')}}
          <template #icon>
            <ArrowSync24Filled/>
          </template>
        </n-button>
      </div>
    </div>
    <div class="h-[calc(100vh-200px)] overflow-auto mt-2 px-2">
      <div class="grid grid-cols-12 gap-2 gap-y-2">
        <template v-for="item in store.onlineDeviceList" :key="item.id">
          <div class="col-span-12 md:col-span-6
        flex flex-col bg-surface-ground/30 border border-surface-line px-4
         py-2 rounded-lg">
            <span class="text-xs flex items-center gap-2" :class="[item.status===1? 'text-success' : 'text-danger']">
                   <span class="relative flex size-3">
  <span :class="[item.status===1? 'animate-ping bg-success/90' : 'bg-danger/90']" class="absolute inline-flex h-full w-full  rounded-full  opacity-75"></span>
  <span :class="[item.status===1? 'bg-success' : 'bg-danger']" class="relative inline-flex size-3 rounded-full"></span>
</span>
                 {{item.name}}</span>
          </div>
        </template>
        <template v-if="store.onlineDeviceList.length === 0">
          <div class="col-span-12 text-secondary text-center">{{$t('content.no-data')}}</div>
        </template>
      </div>
    </div>

  </n-spin>

</div>
</template>