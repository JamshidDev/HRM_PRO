<script setup>
import {UIPageContent, UIPageFilter} from "@/components/index.js";
import {useUserStore} from "@/store/modules/index.js";
import Table from "./ui/Table.vue"
const store = useUserStore()


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