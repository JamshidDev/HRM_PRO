<script setup>
import {UIPageContent} from "@/components/index.js"
import Table from "./ui/Table.vue"
import Filter from "./ui/Filter.vue"
import {useMedWorkerStore} from "@/store/modules/index.js"

const store = useMedWorkerStore()

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
