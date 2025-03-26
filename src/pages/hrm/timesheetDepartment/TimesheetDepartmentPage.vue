<script setup>
import {useTimesheetDepartmentStore} from "@/store/modules";
import Table from './ui/Table.vue'
import {UIPageContent, UIPageFilter} from "@/components/index.js";
const store = useTimesheetDepartmentStore()

const onSearch = (v)=>{
  store.params.page = 1
  store._index()
}


onMounted(()=>{
  store.params.page = 1
  store.params.search = undefined
  store._index()
})
</script>
<template>
<UIPageContent>
  <UIPageFilter
    v-model:search="store.params.search"
    @on-search="onSearch"
    :show-add-button="false"
  />
  <Table />
</UIPageContent>
</template>