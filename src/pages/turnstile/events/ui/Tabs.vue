<script setup>
  import { useEventStore } from '@/store/modules/index.js'
  import HcEventPage from '@/pages/turnstile/events/page.vue'

  const store = useEventStore()

  // «Qurilmalar» tabi olib tashlandi — faqat hodisalar.
  onBeforeMount(() => {
    store.activeTab = store.tabs[0]
  })
</script>

<template>
  <n-tabs
    animated
    v-model:value="store.activeTab"
    class="hidden-tab-header flex-1 flex flex-col"
    pane-wrapper-class="flex-1 flex flex-col"
    type="segment"
  >
    <!-- `flex-1 flex flex-col` zanjiri (tabs -> pane-wrapper -> pane): busiz n-tabs
         balandligi kontent bo'yicha aniqlanib, ichidagi `.ui-page-content` ning
         `height: 100%` i `auto` ga aylanardi va jadval sahifa tubiga yetmasdi. -->
    <n-tab-pane :name="store.tabs[0]" class="!pt-0 flex-1 flex flex-col">
      <HcEventPage />
    </n-tab-pane>
  </n-tabs>
</template>
