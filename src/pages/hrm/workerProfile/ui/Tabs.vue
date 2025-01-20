<script setup>
import PersonalForm from "../tabs/PersonalForm.vue"
import {useWorkerProfileStore} from "@/store/modules/index.js"

const store = useWorkerProfileStore()
</script>

<template>
  <n-tabs animated v-model:value="store.activeTab" class="hidden-tab-header" type="segment">
    <n-tab-pane v-for="(item, idx) in store.tabs" :name="item.id" :key="idx">
      <template v-if="store.tabs[0].id === item.id">
        <PersonalForm/>
      </template>
    </n-tab-pane>
  </n-tabs>
</template>

<style scoped>

</style>