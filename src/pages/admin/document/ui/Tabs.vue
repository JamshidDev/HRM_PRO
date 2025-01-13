<script setup>
import {useDocSettingStore} from "@/store/modules/index.js"
import ServicePage from "../service/OrgServicePage.vue"
import ContractTemplate from "../contractTemplate/ContractTemplate.vue"
import CommandTemplate from "../commandTemplate/CommandTemplate.vue"
const store = useDocSettingStore()
</script>

<template>
  <n-tabs
      animated
      v-model:value="store.activeTab"
      class="hidden-tab-header1 mt-10"
      type="card"
  >
    <template v-for="(tab, idx) in store.tabList" :key="idx">
      <n-tab-pane :name="tab.id" :tab="$t(tab.name)">
        <template v-if="tab.id === 1">
          <ContractTemplate/>
        </template>
        <template v-if="tab.id === 2">
          <CommandTemplate/>
        </template>
        <template v-if="tab.id === 3">
          <ServicePage/>
        </template>
      </n-tab-pane>
    </template>
  </n-tabs>
</template>


<style scoped>

</style>