<script setup>
import {UIPageContent} from "@/components/index.js"
import {useTaxFourStore} from "@/store/modules/index.js"
import Table from "./ui/Table.vue"
import Filter from "./ui/Filter.vue"

const store = useTaxFourStore()

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
