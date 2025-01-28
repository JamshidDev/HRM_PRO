<script setup>
import {UIPageContent, UIPageFilter, UIOfficeApp} from "@/components/index.js"
import Table from "./Table.vue"
import {useConfirmationContractStore} from "@/store/modules/index.js"
const store = useConfirmationContractStore()

const onSearchEv = ()=>{
  store.params.page =1
  store._index()
}

const officeAppRef = ref(null)
const openOffice = (id)=>{
  officeAppRef.value.openPdf(id, 'contracts')
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
      @onSearch="onSearchEv" />

  <Table @openOffice="openOffice" />
  <UIOfficeApp ref="officeAppRef" />
</UIPageContent>
</template>
