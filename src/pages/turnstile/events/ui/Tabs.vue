<script setup>
  import { useEventStore } from '@/store/modules/index.js'
  import HcEventPage from '@/pages/turnstile/events/page.vue'
  import HcDeviceEventPage from '@/pages/turnstile/deviceEvents/page.vue'

  const store = useEventStore()

  onBeforeMount(() => {
    // Saqlangan qiymat mavjud tablar orasida bo'lmasa (masalan olib tashlangan
    // "Ish vaqti" tabi) — birinchisiga tushamiz.
    const cashedTab = Number(localStorage.getItem('eventPageView'))
    store.activeTab = store.tabs.includes(cashedTab) ? cashedTab : store.tabs[0]
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
      <HcDeviceEventPage />
    </n-tab-pane>
  </n-tabs>
</template>
