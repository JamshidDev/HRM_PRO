<script setup>
import {useDocSettingStore} from "@/store/modules/index.js"
import DocumentExample from "./DocumentExample.vue"
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
        <DocumentExample/>
      </n-tab-pane>
    </template>
  </n-tabs>
</template>


<style scoped>

</style>