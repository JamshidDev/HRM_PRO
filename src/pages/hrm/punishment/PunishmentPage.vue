<script setup>
import {UIPageContent, UIPageFilter} from "@/components/index.js"
import Table from "./ui/Table.vue"
import {usePunishmentStore, useAccountStore} from "@/store/modules/index.js"


const store = usePunishmentStore()
const accStore = useAccountStore()


const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.hrPunishmentRead)) return
  store.params.page = 1
  store._index()
}

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.hrPunishmentRead)) return
  store._index()
})
</script>

<template>

  <UIPageContent>
    <UIPageFilter
        @onSearch="onSearch"
        v-model:search="store.params.search"
        :search-loading="store.loading"
        :show-add-button="false"
    />
    <Table/>
  </UIPageContent>
</template>
