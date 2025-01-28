<script setup>
import Table from "./Table.vue"
import {UIPageContent, UIPageFilter} from "@/components/index.js"
import {useConfirmCommandStore} from "@/store/modules/index.js"

const store = useConfirmCommandStore()

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

<style scoped>

</style>