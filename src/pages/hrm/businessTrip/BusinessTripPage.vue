<script setup>
import {UIPageContent, UIPageFilter} from "@/components/index.js"
import {useBusinessTripStore} from "@/store/modules/index.js"
const store = useBusinessTripStore()
import Table from "./ui/Table.vue"

onMounted(()=>{
  store._index()
})
</script>

<template>
<UIPageContent>
  <UIPageFilter/>
  <Table/>
</UIPageContent>
</template>
