<script setup>
import {UIPageFilter, UIPageContent, UIOfficeApp} from "@/components/index.js"
import {useConfirmationAdContractStore} from "@/store/modules/index.js"
import Table from "./Table.vue"
import Utils from "@/utils/Utils.js"

const store = useConfirmationAdContractStore()
const officeAppRef = ref(null)

const openOffice = (v)=>{
  officeAppRef.value.openPdf(v.documentId, Utils.documentModels.adContract, v.signatureId)
}

const onSignatureEv = (v)=>{
  store._index()
}

const onSearch = ()=>{
  store.params.page = 1
  store._index()
}

onMounted(()=>{
  store._index()
})
</script>

<template>
<UIPageContent>
  <UIPageFilter
      :show-add-button="false"
      v-model:search="store.params.search"
      @onSearch="onSearch"
      :search-loading="store.loading"
  />
  <Table @openOffice="openOffice"/>
  <UIOfficeApp ref="officeAppRef" @signatureEv="onSignatureEv" />
</UIPageContent>
</template>