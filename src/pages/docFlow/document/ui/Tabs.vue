<script setup>
import ContractList from "./ContractList.vue"
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
    <template v-for="(deep, idx) in store.tabList" :key="idx">
      <n-tab-pane :name="(idx+1)" :tab="$t(deep.name)">
       <ContractList/>
      </n-tab-pane>
    </template>
  </n-tabs>
</template>