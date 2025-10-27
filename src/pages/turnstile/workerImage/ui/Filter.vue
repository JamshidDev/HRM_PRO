<script setup>
import {UIPageFilter} from "@/components/index.js"
import {useWorkerImageStore} from "@/store/modules/index.js"

const store = useWorkerImageStore()

const onSearchEv = ()=>{
  store.params.page = 1
  store._index()
}

const onRefresh = ()=>{
  store._index()
}
</script>

<template>
<UIPageFilter
    v-model:search="store.params.search"
    @onSearch="onSearchEv"
    @onRefresh="onRefresh"
    :show-add-button="false"
    :show-filter-button="false"
>
</UIPageFilter>
</template>
