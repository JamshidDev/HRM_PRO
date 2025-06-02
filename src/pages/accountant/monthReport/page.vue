<script setup>
import {UIPageContent} from "@/components/index.js"
import Filter from "./ui/Filter.vue"
import Table from "./ui/Table.vue"
import {useMonthReportStore} from "@/store/modules/index.js"

const store = useMonthReportStore()


onMounted(()=>{
  store.params.year = new Date().getFullYear()
  store.params.month = new Date().getMonth()
  store._index()
})

</script>

<template>
  <UIPageContent>
    <Filter/>
    <Table/>
  </UIPageContent>
</template>