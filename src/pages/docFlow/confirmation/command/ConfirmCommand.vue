<script setup>
import Table from "./Table.vue"
import {UIOfficeApp, UIPageContent, UIPageFilter} from "@/components/index.js"
import {useConfirmCommandStore} from "@/store/modules/index.js"

const store = useConfirmCommandStore()
const officeAppRef = ref(null)
const onSearch = ()=>{
  store.params.page=1
  store._index()
}

const openOffice = (v)=>{
  officeAppRef.value.openPdf(v.documentId, 'commands', v.signatureId)
}

const onSignatureEv = (v)=>{
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
      @onSearch="onSearch"
  />
  <Table @openOffice="openOffice" />
  <UIOfficeApp ref="officeAppRef" @signatureEv="onSignatureEv" />
</UIPageContent>
</template>

<style scoped>

</style>