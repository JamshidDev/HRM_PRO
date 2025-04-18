<script setup>
import {useUsefulStore} from "@/store/modules/index.js"

const store = useUsefulStore()

onMounted(()=>{
  store._codex()
})
</script>
<template>
  <n-spin :show="store.loading" class="h-full">
    <div v-html="store.codex" />
  </n-spin>
</template>