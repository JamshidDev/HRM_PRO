<script setup>
import {useUsefulStore} from "@/store/modules/index.js"

const store = useUsefulStore()

onMounted(()=>{
  store._codex()
})
</script>
<template>
  <n-spin style="height: calc(100vh - 150px);" :show="store.loading" class="bg-surface-section overflow-auto">
    <div v-html="store.codex" />
  </n-spin>
</template>