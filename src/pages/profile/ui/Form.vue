<script setup>
import {useAccountStore} from "@/store/modules/accountStore.js";

const store = useAccountStore()
</script>

<template>
  <n-tabs animated v-model:value="store.activeTab" class="hidden-tab-header" type="segment">
    <n-tab-pane :name="store.tabs[0]">
      <h2>1</h2>
    </n-tab-pane>
    <n-tab-pane :name="store.tabs[1]">
      <h2>2</h2>
    </n-tab-pane>
  </n-tabs>
</template>

<style scoped>

</style>