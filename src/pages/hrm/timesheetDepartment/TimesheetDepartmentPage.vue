<script setup>
import {useTimesheetDepartmentStore, useAccountStore} from "@/store/modules";
import Table from './ui/Table.vue'
import Filter from './ui/Filter.vue'
import {UIPageContent} from "@/components/index.js";

const store = useTimesheetDepartmentStore()
const accStore = useAccountStore()



onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.hrTableRead)) return
  store.params.page = 1
  store.params.search = undefined
  store._index()
})
</script>
<template>
<UIPageContent>
 <Filter/>
  <Table />
</UIPageContent>
</template>