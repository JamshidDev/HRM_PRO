<script setup>
import {useTimesheetDepartmentStore} from "@/store/modules";
import Table from './ui/Table.vue'
import {UIPageContent} from "@/components/index.js";
const store = useTimesheetDepartmentStore()

onMounted(()=>{
  store.params.page = 1
  store.params.search = undefined
  store._index()
})
</script>
<template>
<UIPageContent >
  <Table />
</UIPageContent>
</template>