<script setup>
import {useScheduleGroupWorkerStore} from "@/store/modules/index.js"
import {UIPageContent} from "@/components/index.js"
import Table from "./ui/Table.vue"
import Filter from "./ui/Filter.vue"
import ReplaceModal from "./ui/ReplaceModal.vue"

const store = useScheduleGroupWorkerStore()


onMounted(()=>{
  store._dayOfMonth(()=>{
    store._index()
  })
})
</script>

<template>
  <UIPageContent>
    <Filter/>
    <Table/>
    <ReplaceModal/>
  </UIPageContent>
</template>
