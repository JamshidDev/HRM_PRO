<script setup>
import {UIPageContent} from "@/components/index.js"
import {useAccountStore, useBusinessTripStore} from "@/store/modules/index.js"
const store = useBusinessTripStore()
import Table from "./ui/Table.vue"
import Filter from "./ui/Filter.vue"

const accStore = useAccountStore()


onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.hrBusinessTripRead)) return
  store._index()
})
</script>

<template>
<UIPageContent>
  <Filter/>
  <Table/>
</UIPageContent>
</template>
