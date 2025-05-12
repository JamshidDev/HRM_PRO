<script setup>
import {UIPageContent, UIPageFilter} from "@/components/index.js"
import Table from "./ui/Table.vue"
import {usePunishmentStore} from "@/store/modules/index.js"


const store = usePunishmentStore()


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
        @onSearch="onSearch"
        v-model:search="store.params.search"
        :search-loading="store.loading"
        :show-add-button="false"
    />
    <Table/>
  </UIPageContent>
</template>
