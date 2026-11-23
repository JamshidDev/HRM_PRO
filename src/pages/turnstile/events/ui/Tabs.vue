<script setup>
  import { UISegmentTabs } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useEventStore } from '@/store/modules/index.js'
  import HcEventPage from '@/pages/turnstile/events/page.vue'
  import GuestsPage from '@/pages/turnstile/events/guests/GuestsPage.vue'

  const { t } = i18n.global
  const store = useEventStore()

  // Xodimlar — turniket hodisalari; Mehmonlar — korxonaga biriktirilgan shtatdan tashqari odamlar.
  const tab = ref('workers')
  const tabs = computed(() => [
    { id: 'workers', name: t('guestPage.tabWorkers') },
    { id: 'guests', name: t('guestPage.tabGuests') }
  ])

  onBeforeMount(() => {
    store.activeTab = store.tabs[0]
  })
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0 gap-3">
    <div class="shrink-0">
      <UISegmentTabs v-model="tab" :tabs="tabs" />
    </div>
    <!-- `flex-1 flex flex-col` zanjiri: jadval sahifa tubiga yetishi uchun. -->
    <div v-if="tab === 'workers'" class="flex-1 flex flex-col min-h-0">
      <HcEventPage />
    </div>
    <div v-else class="flex-1 flex flex-col min-h-0">
      <GuestsPage />
    </div>
  </div>
</template>
