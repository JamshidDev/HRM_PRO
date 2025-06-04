<script setup>
import {UIPageContent, UIPageFilter} from "@/components/index.js"
import {useExpiredHealthStore} from "@/store/modules/index.js"
import Filter from "./ui/Filter.vue"
import Table from "./ui/Table.vue"

const store = useExpiredHealthStore()

onMounted(()=>{
  store._index()
})
</script>

<template>
<UIPageContent>
  <Filter/>
  <Table/>
</UIPageContent>
</template>
