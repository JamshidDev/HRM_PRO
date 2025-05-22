<script setup>
import {UIPageContent, UIPageFilter} from "@/components/index.js"
import Table from "./ui/Table.vue"
import {useAccountStore, useWorkerProfileStore} from "@/store/modules/index.js"
import Filter from "./ui/Filter.vue"

const store = useWorkerProfileStore()
const accStore = useAccountStore()

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.hrUsersRead)) return
  store._userRole()
})
</script>

<template>
<UIPageContent>
  <Filter/>
  <Table/>
</UIPageContent>
</template>
