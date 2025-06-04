<script setup>
import {UIPageFilter} from "@/components/index.js"
import {useTicketStore} from "@/store/modules/index.js"

const store = useTicketStore()

const onAdd = ()=>{
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

const onSearch = ()=>{
  store.params.page = 1
  store._index()
}
</script>

<template>
<UIPageFilter
    v-model:search="store.params.search"
    :search-loading="store.loading"
    @onSearch="onSearch"
    @onAdd="onAdd"
/>
</template>
