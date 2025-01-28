<script setup>
import ContractPage from "../contract/ContractPage.vue"
import CommandPage from "../command/CommandPage.vue"
import {useDocumentStore, useCommandStore} from "@/store/modules/index.js"
import {UIOfficeApp} from "@/components/index.js"

const store = useDocumentStore()
const commandStore = useCommandStore()
const officeAppRef = ref(null)

const onChange = ()=>{
 if(store.activeTab === 2){
   commandStore._index()
 }
}

const openOffice = (id)=>{
  officeAppRef.value.openPdf(id, 'contracts')
}

const openCommand = (id)=>{
  officeAppRef.value.openPdf(id, 'commands')
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
    <n-tab-pane v-for="(item, idx) in store.tabList" :key="idx" :name="item.key" :tab="$t(item.name)">
      <template v-if="item.key === store.tabList[0].key">
        <ContractPage @openOffice="openOffice"/>
      </template>
      <template v-if="item.key === store.tabList[1].key">
       <CommandPage @openOffice="openCommand"/>
      </template>
    </n-tab-pane>
  </n-tabs>
  <UIOfficeApp ref="officeAppRef"/>
</template>