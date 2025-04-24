<script setup>
import {UIPageFilter} from "@/components/index.js"
import {useDocumentArchiveStore} from "@/store/modules/index.js"

const store = useDocumentArchiveStore()

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
      @onAdd="onAdd"
      v-model:search="store.params.search"
      @onSearch="onSearch"
      :search-loading="store.loading"
  />
</template>