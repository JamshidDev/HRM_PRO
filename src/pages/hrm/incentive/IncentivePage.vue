<script setup>
import {UIPageContent, UIPageFilter} from "@/components/index.js"
import Table from "./ui/Table.vue"
import {useIncentiveStore, useAccountStore} from "@/store/modules/index.js"
import {useRoute} from "vue-router"

const accStore = useAccountStore()
const store = useIncentiveStore()
const route = useRoute()


const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.hrIncentivesRead)) return
  store.params.page = 1
  store._index()
}

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.hrIncentivesRead)) return
  store.uuid = route.query.id
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
