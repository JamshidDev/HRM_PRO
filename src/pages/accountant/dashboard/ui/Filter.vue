<script setup>
import {UIPageFilter} from "@/components/index.js"
import {useAccDashboardStore} from "@/store/modules/index.js"

const store = useAccDashboardStore()

const filterEvent = ()=>{
  store.params.page = 1
  store._index()
}
</script>

<template>
<UIPageFilter
    v-model:search="store.params.search"
    :search-loading="store.loading"
    @onSearch="filterEvent"
/>
</template>