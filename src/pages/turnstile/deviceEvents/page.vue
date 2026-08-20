<script setup>
  import { useDeviceEventStore, useEventStore, useAccountStore } from '@/store/modules/index.js'
  import { UIPageContent } from '@/components/index.js'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'
  import PhotoModal from './ui/PhotoModal.vue'

  const store = useDeviceEventStore()
  const eventStore = useEventStore()
  const accStore = useAccountStore()

  onMounted(() => {
    // Ro'yxat faqat shu tab ochilganda yuklanadi (boshqa tabga kirganda so'rov ketmasin).
    if (eventStore.activeTab !== eventStore.tabs[1]) return
    if (!accStore.checkPermission(accStore.pn.turnstileHikCentralEventsRead)) return
    store._index()
  })

  watch(
    () => eventStore.activeTab,
    (v) => {
      if (v !== eventStore.tabs[1] || store.list.length) return
      if (!accStore.checkPermission(accStore.pn.turnstileHikCentralEventsRead)) return
      store._index()
    }
  )
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <PhotoModal />
  </UIPageContent>
</template>
