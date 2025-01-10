<script setup>
import ContractList from "../contract/ContractList.vue"
import ConfirmationTable from "../confirmation/Table.vue"
import {useDocumentStore, useConfirmationContractStore} from "@/store/modules/index.js"
import {UIOfficeApp} from "@/components/index.js"

const store = useDocumentStore()
const confirmationStore = useConfirmationContractStore()
const officeAppRef = ref(null)

const onChange = ()=>{
 if(store.activeTab === 2){
   if(confirmationStore.list.length === 0){
     confirmationStore._index()
   }
 }
}

const openOffice = (id)=>{
  officeAppRef.value.openPdf(id, 'contracts')
}
</script>

<template>
  <n-tabs
      animated
      v-model:value="store.activeTab"
      @update:value="onChange"
      class="hidden-tab-header1 mt-10"
      type="card"
  >
    <n-tab-pane :name="store.tabList[0].key" :tab="$t(store.tabList[0].name)">
      <ContractList @openOffice="openOffice"/>
    </n-tab-pane>
    <n-tab-pane :name="store.tabList[1].key" :tab="$t(store.tabList[1].name)">
      <ConfirmationTable/>
    </n-tab-pane>
  </n-tabs>
  <UIOfficeApp ref="officeAppRef"/>
</template>