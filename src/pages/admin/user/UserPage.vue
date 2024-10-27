<script setup>
import {UIPageContent, UIPageFilter} from "@/components/index.js";
import {useUserStore} from "@/store/modules/index.js";
import Table from "./ui/Table.vue"
const store = useUserStore()


const onSearch = (v)=>{
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
  v-model:search="store.params.search"
  @on-search="onSearch"
  :search-loading="store.loading"
  :show-filter-button="false"
  />
  <Table/>
</UIPageContent>
</template>