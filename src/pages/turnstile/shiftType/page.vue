<script setup>
import {UIPageContent} from "@/components/index.js"
import {useShiftTypeStore} from "@/store/modules/index.js"
import {Filter, Table, GenerateModal, ScheduleModal, DailyScheduleModal} from "./ui/index.js"

const store = useShiftTypeStore()


onMounted(()=>{
  store._index()
})

</script>

<template>
  <UIPageContent>
    <Filter/>
    <Table/>
    <GenerateModal/>
    <ScheduleModal/>
    <DailyScheduleModal/>
  </UIPageContent>
</template>
