<script setup>
import {UIPageFilter} from "@/components/index.js"
import {usePolyclinicStore} from "@/store/modules/index.js"


const store = usePolyclinicStore()

const onSearch = (v)=>{
  store.params.page = 1
  store._index()
}

const onAdd = ()=>{
  store.resetForm()
  store.visibleType = true
  store.visible = true
}
</script>

<template>
<UIPageFilter
    v-model:search="store.params.search"
    :search-loading="store.loading"
    @onSearch="onSearch"
    @onAdd="onAdd"
    :show-filter-button="false"
>

</UIPageFilter>
</template>
