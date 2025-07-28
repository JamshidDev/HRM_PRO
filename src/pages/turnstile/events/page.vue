<script setup>
import {UIPageContent} from "@/components/index.js"
import Filter from "./ui/Filter.vue"
import Table from "./ui/Table.vue"
import {useAccountStore, useEventStore} from "@/store/modules/index.js"

const store = useEventStore()
const accStore = useAccountStore()

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.turnstileHikCentralEvents)) return
  store._index()
})
</script>

<template>
<UIPageContent>
  <Filter/>
  <Table/>
</UIPageContent>
</template>
