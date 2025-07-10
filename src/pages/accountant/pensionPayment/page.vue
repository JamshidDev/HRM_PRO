<script setup>
import {UIPageContent} from "@/components/index.js"
import Filter from "./ui/Filter.vue"
import Table from "./ui/Table.vue"
import {useAccountStore, usePensionStore} from "@/store/modules/index.js"

const store = usePensionStore()
const accStore = useAccountStore()
onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.economistPensionPaymentsRead)) return
  if(store.list.length===0){
    store.resetParams()
    store._index()
  }
})
</script>

<template>
  <UIPageContent>
    <Filter/>
    <Table/>
  </UIPageContent>
</template>
