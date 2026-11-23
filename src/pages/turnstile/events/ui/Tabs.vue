<script setup>
  import { useEventStore } from '@/store/modules/index.js'
  import HcEventPage from '@/pages/turnstile/events/page.vue'

  const store = useEventStore()

  // Mehmonlar alohida tab emas — sahifadagi «Mehmonlar» kartasi va modali orqali.
  onBeforeMount(() => {
    store.activeTab = store.tabs[0]
  })
</script>

<template>
  <!-- `flex-1 flex flex-col` zanjiri: jadval sahifa tubiga yetishi uchun. -->
  <div class="flex-1 flex flex-col min-h-0">
    <HcEventPage />
  </div>
</template>
