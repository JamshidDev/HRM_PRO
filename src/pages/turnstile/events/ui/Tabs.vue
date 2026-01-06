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
  <n-tabs animated v-model:value="store.activeTab" class="hidden-tab-header" type="segment">
    <n-tab-pane :name="store.tabs[0]" class="!pt-0">
      <HcEventPage />
    </n-tab-pane>
    <n-tab-pane :name="store.tabs[1]" class="!pt-0">
      <HcEventV2Page />
    </n-tab-pane>
  </n-tabs>
</template>
