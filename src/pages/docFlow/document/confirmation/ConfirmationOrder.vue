<script setup>
import {UIPageContent, UIPageFilter} from "@/components/index.js"
import Table from "./Table.vue"
import {useConfirmationContractStore} from "@/store/modules/index.js"
const store = useConfirmationContractStore()

const onSearchEv = ()=>{
  store.params.page =1
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
      :show-add-button="false"
      :search-loading="store.loading"
      @onSearch="onSearchEv"
  />
  <Table/>
</UIPageContent>
</template>

<style scoped>

</style>