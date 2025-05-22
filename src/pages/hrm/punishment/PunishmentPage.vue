<script setup>
import {UIPageContent, UIPageFilter} from "@/components/index.js"
import Table from "./ui/Table.vue"
import Filter from "./ui/Filter.vue"
import {usePunishmentStore, useAccountStore} from "@/store/modules/index.js"


const store = usePunishmentStore()
const accStore = useAccountStore()


onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.hrPunishmentRead)) return
  store._index()
})
</script>

<template>

  <UIPageContent>
    <Filter/>
    <Table/>
  </UIPageContent>
</template>
