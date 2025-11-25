<script setup>
import scheduleJson from "@/assets/json/schedule.json"
import {UILottieReader} from "@/components/index.js"
import {useScheduleTableStore} from "@/store/modules/index.js"

const store = useScheduleTableStore()
</script>

<template>
  <div v-if="store.dayOfMonthLoading || store.workerLoading && store.workerList.length === 0" class="w-full h-full flex flex-col absolute top-0 left-0 bottom-0  bg-surface-section  z-[99]">
    <div class="w-full h-[50px] border-b border-surface-line"></div>
    <UILottieReader
        class="mx-auto opacity-60"
        style="height:400px"
        :file-url="scheduleJson"
        :auto-run="true"
    />
  </div>
</template>
