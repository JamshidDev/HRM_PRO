<script setup>
import {UIPageContent, UIPageFilter} from "@/components/index.js"
import {useBusinessTripStore} from "@/store/modules/index.js"
const store = useBusinessTripStore()
import Table from "./ui/Table.vue"

const onSearch = ()=>{
  store.params.page = 1
  store._index()
}

onMounted(()=>{
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
