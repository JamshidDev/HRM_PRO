<script setup>
import {UIPageContent} from "@/components/index.js";
import Table from "./ui/Table.vue"
import {useExportStore} from "@/store/modules/index.js";
import i18n from "@/i18n/index.js"
import Filter from "./ui/Filter.vue"

const store = useExportStore()


onMounted(()=>{
  store._tasks()
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