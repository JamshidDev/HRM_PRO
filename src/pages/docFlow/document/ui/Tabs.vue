<script setup>
import ContractList from "./ContractList.vue"
import CreateContractPage from "./CreateContractPage.vue"
import {useDocumentStore} from "@/store/modules/index.js"

const store = useDocumentStore()
</script>

<template>
  <n-tabs
      animated
      v-model:value="store.activeTab"
      class="hidden-tab-header1 mt-10"
      type="card"
  >
    <n-tab-pane :name="store.tabList[0].key" :tab="$t(store.tabList[0].name)">
      <CreateContractPage/>
    </n-tab-pane>
    <n-tab-pane :name="store.tabList[1].key" :tab="$t(store.tabList[1].name)">
      <ContractList/>
    </n-tab-pane>

  </n-tabs>
</template>