<script setup>
  import { useEventStore } from '@/store/modules/index.js'
  import HcEventPage from '@/pages/turnstile/events/page.vue'
  import HcEventV2Page from '@/pages/turnstile/eventsV2/page.vue'

  const store = useEventStore()

  onBeforeMount(() => {
    const cashedTab = localStorage.getItem('eventPageView') || null
    store.activeTab = cashedTab ? Number(cashedTab) : 1
  })
</script>

<template>
  <!-- `flex-1 flex flex-col` zanjiri (tabs -> pane-wrapper -> pane): busiz n-tabs
       balandligi kontent bo'yicha aniqlanib, ichidagi `.ui-page-content` ning
       `height: 100%` i `auto` ga aylanardi va jadval sahifa tubiga yetmasdi. -->
  <n-tabs
    animated
    v-model:value="store.activeTab"
    class="hidden-tab-header flex-1 flex flex-col"
    pane-wrapper-class="flex-1 flex flex-col"
    type="segment"
  >
    <n-tab-pane :name="store.tabs[0]" class="!pt-0 flex-1 flex flex-col">
      <HcEventPage />
    </n-tab-pane>
    <n-tab-pane :name="store.tabs[1]" class="!pt-0 flex-1 flex flex-col">
      <HcEventV2Page />
    </n-tab-pane>
  </n-tabs>
</template>
