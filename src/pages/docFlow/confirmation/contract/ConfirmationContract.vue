<script setup>
import {UIPageContent, UIPageFilter, UIOfficeApp} from "@/components/index.js"
import Table from "./Table.vue"
import {useConfirmationContractStore} from "@/store/modules/index.js"
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()
import Utils from "@/utils/Utils.js"
const store = useConfirmationContractStore()

const onSearchEv = ()=>{
  if(!accStore.checkAction(accStore.pn.confirmationContracts)) return
  store.params.page =1
  store._index()
}

const officeAppRef = ref(null)
const openOffice = (v)=>{
  officeAppRef.value.openPdf(v.documentId, Utils.documentModels.contract, v.signatureId)
}

const onSignatureEv = (v)=>{
  store._index()
}


onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.confirmationContracts)) return
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
  <UIOfficeApp ref="officeAppRef" @signatureEv="onSignatureEv" />
</UIPageContent>
</template>
