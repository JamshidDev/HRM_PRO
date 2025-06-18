<script setup>
import {useTaxFiveStore} from "@/store/modules/index.js"
import Table from "./ui/Table.vue"
import Filter from "./ui/Filter.vue"
import {UIPageContent} from "@/components/index.js"


const store = useTaxFiveStore()

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

<style scoped>

</style>