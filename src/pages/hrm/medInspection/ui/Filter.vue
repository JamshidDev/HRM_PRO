<script setup>
import {UIPageFilter} from "@/components/index.js"
import {useComponentStore, useMedInspectionStore} from "@/store/modules/index.js"
const store = useMedInspectionStore()
const componentStore = useComponentStore()


const onSearch = ()=>{
  store.params.page = 1
  store._index()
}

const onAdd = ()=>{
  store.resetForm()
  componentStore._structures()
  store.visible = true
}
</script>

<template>
<UIPageFilter
    v-model:search="store.params.search"
    @onSearch="onSearch"
    :search-loading="store.loading"
    @onAdd="onAdd"
    :show-filter-button="false"
/>
</template>

<style scoped>

</style>