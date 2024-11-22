<script setup>
import {UIPageContent} from "@/components/index.js"
import Tabs from "./ui/Tabs.vue"
import {useDocumentStore, useContractStore} from "@/store/modules/index.js"
const store = useDocumentStore()
const contractStore = useContractStore()

onMounted(()=>{
  if(store.activeTab ===1){
    contractStore._index()
  }
})

</script>

<template>
<UIPageContent>
<Tabs/>
</UIPageContent>
</template>

<style scoped>

</style>