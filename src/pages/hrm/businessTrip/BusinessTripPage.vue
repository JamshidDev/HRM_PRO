<script setup>
import {UIPageContent, UIPageFilter} from "@/components/index.js"
import {useAccountStore, useBusinessTripStore} from "@/store/modules/index.js"
const store = useBusinessTripStore()
import Table from "./ui/Table.vue"

const accStore = useAccountStore()

const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.hrBusinessTripRead)) return
  store.params.page = 1
  store._index()
}

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.hrBusinessTripRead)) return
  store._index()
})
</script>

<template>
<UIPageContent>
  <UIPageFilter
      :search-loading="store.loading"
      v-model:search="store.params.search"
      :show-add-button="false"
      @onSearch="onSearch"
  />
  <Table/>
</UIPageContent>
</template>
