<script setup>
import {UIPageContent} from "@/components/index.js"
import Filter from "./ui/Filter.vue"
import Table from "./ui/Table.vue"
import {useEventStore} from "@/store/modules/index.js"

const store = useEventStore()

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
