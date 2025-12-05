<script setup>
import {useShiftTypeStore} from "@/store/modules/index.js"
import {UIPageContent} from "@/components/index.js"
import Table from "./ui/Table.vue"
import Filter from "./ui/Filter.vue"
import GenerateModal from "@/pages/turnstile/shiftType/ui/GenerateModal.vue"
import DailyScheduleModal from "@/pages/turnstile/shiftType/ui/DailyScheduleModal.vue"

const route = useRoute()

const store = useShiftTypeStore()

onMounted(()=>{
  if(route.path === '/turnstile/shift-type-group'){
    store.groupParams.schedule_type = null
    store.activeTab = 2
  }
  store.groupParams.page = 1
  store._group()
})
</script>

<template>
  <UIPageContent>
    <Filter/>
    <Table/>
    <GenerateModal/>
    <DailyScheduleModal/>
  </UIPageContent>
</template>