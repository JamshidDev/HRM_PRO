<script setup>
import {UIPageFilter} from "@/components/index.js"
import {useAccountStore, useDocumentArchiveStore} from "@/store/modules/index.js"

const store = useDocumentArchiveStore()
const accStore = useAccountStore()

const onAdd = ()=>{
  if(!accStore.checkAction(accStore.pn.hrDocumentsWrite)) return
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.hrDocumentsRead)) return
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