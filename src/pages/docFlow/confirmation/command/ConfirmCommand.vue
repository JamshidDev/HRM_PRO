<script setup>
import Table from "./Table.vue"
import {UIOfficeApp, UIPageContent, UIPageFilter} from "@/components/index.js"
import {useConfirmCommandStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()

const store = useConfirmCommandStore()
const officeAppRef = ref(null)
const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.confirmationCommands)) return
  store.params.page=1
  store._index()
}

const openOffice = (v)=>{
  officeAppRef.value.openPdf(v.documentId, Utils.documentModels.command, v.signatureId)
}

const onSignatureEv = (v)=>{
  store._index()
}

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.confirmationCommands)) return
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