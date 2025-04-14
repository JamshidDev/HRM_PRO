<script setup>
import {FullScreenMaximize16Regular, AddCircle24Filled} from '@vicons/fluent'
import {useReportStore} from "@/store/modules/index.js"
const store = useReportStore()
</script>

<template>
<div
    class="w-full rounded-lg"
    style="min-height: calc(100vh - 80px)"
    :class="[store.fullScreen && 'container-fullscreen']"
>
  <div class="w-full flex justify-between px-2 py-1 border-b border-surface-line mb-2">
    <div class="flex items-center gap-2">
      <template v-for="item in store.barList" :key="item.id">
        <div
            @click="store.addPanel(item)"
            class="text-wrap cursor-pointer flex items-center gap-2 border
             text-primary
            border-blue-200 rounded-2xl px-2 py-1 text-xs font-medium">{{item.name}}
          <n-icon size="20">
            <AddCircle24Filled/>
          </n-icon>
        </div>

      </template>
    </div>
      <n-button
          @click="store.changeScreenMode()"
          circle size="small">
        <template #icon>
          <FullScreenMaximize16Regular/>
        </template>
      </n-button>
  </div>

      <div class="flex gap-2 h-full px-2">
      <slot name="default"></slot>
      </div>



</div>
</template>

<style>
  .container-fullscreen {
    position: fixed;
    width: 100% !important;
    height: 100% !important;
    top: 0;
    left: 0;
    z-index: 999;
  }
</style>