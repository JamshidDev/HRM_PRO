<script setup>
import {useShiftTypeStore} from "@/store/modules/index.js"
import ShiftTypePage from "../page.vue"
import ScheduleGroupPage from "@/pages/turnstile/scheduleGroup/page.vue"
import ScheduleGroupWorkerPage from "@/pages/turnstile/scheduleWorker/page.vue"

const store = useShiftTypeStore()


onMounted(()=>{
  store.activeTab =1
})
</script>

<template>
  <n-tabs animated v-model:value="store.activeTab" class="hidden-tab-header" type="segment">
    <n-tab-pane :name="1" class="!pt-0">
      <ShiftTypePage/>
    </n-tab-pane>
    <n-tab-pane :name="2" class="!pt-0">
      <ScheduleGroupPage/>
    </n-tab-pane>
    <n-tab-pane :name="3" class="!pt-0">
      <ScheduleGroupWorkerPage/>
    </n-tab-pane>
  </n-tabs>
</template>