<script setup>
import {UIPageContent} from "@/components/index.js"
import Table from "./ui/Table.vue"
import Filter from "./ui/Filter.vue"
import CheckWorker from "./ui/CheckWorker.vue"
</script>

<template>
<UIPageContent>
  <Filter/>
  <Table/>
  <CheckWorker/>
</UIPageContent>
</template>

<style scoped>

</style>