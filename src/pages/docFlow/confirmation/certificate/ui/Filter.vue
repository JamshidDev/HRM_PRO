<script setup>
import {useComponentStore, useConfCertificateStore} from "@stores"
import {UIPageFilter} from "@components"


const store = useConfCertificateStore()
const componentStore = useComponentStore()

const onSearch = ()=>{
  store.params.page = 1
  store._index()
}

</script>
<template>
  <UIPageFilter
      v-model:search="store.params.search"
      @onSearch="onSearch"
      :search-loading="store.loading"
      :show-add-button="false"
      :show-filter-button="false"
  />
</template>