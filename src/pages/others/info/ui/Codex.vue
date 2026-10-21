<script setup>
  import { sanitizeHtml } from '@/utils/sanitize.js'
  import { useUsefulStore } from '@stores'

  const store = useUsefulStore()

  onMounted(() => {
    store._codex()
  })
</script>
<template>
  <n-spin
    style="height: calc(100vh - 150px)"
    :show="store.loading"
    class="bg-surface-section overflow-auto"
  >
    <div v-html="sanitizeHtml(store.codex)" />
  </n-spin>
</template>
