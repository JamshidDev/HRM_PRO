<script setup>
import {UIOfficeApp, UIPageContent, UIPageFilter} from "@/components/index.js"
import {useTimesheetStore} from "@/store/modules/index.js"
import Table from "./ui/Table.vue"
import Utils from "@/utils/Utils.js"
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()

const store = useTimesheetStore()
const officeAppRef = ref(null)

const onSearchEv = ()=>{
  if(!accStore.checkAction(accStore.pn.confirmationTable)) return
  store.params.page = 1
  store._index()
}

const openOffice = (v)=>{
  officeAppRef.value.openPdf(v.documentId, Utils.documentModels.timesheet, v.signatureId)
}

const onSignatureEv = (v)=>{
  store._index()
}

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.confirmationTable)) return
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
  <Table @openOffice="openOffice" />
  <UIOfficeApp ref="officeAppRef" @signatureEv="onSignatureEv" />
</UIPageContent>
</template>
