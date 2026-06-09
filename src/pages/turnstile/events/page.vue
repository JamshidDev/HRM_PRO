<script setup>
  import { UIModal, UIPageContent } from '@/components/index.js'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'
  import syncForm from './ui/syncForm.vue'
  import DownloadModal from '../eventsV2/ui/DownloadModal.vue'
  import CalendarAndTimelineTabs from '../eventsV2/ui/CalendarAndTimelineTabs.vue'
  import Preview from '../eventsV2/ui/Preview.vue'
  import { useAccountStore, useEventStore, useEventV2Store } from '@/store/modules/index.js'

  const store = useEventStore()
  const v2Store = useEventV2Store()
  const accStore = useAccountStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.turnstileHikCentralEvents)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <UIModal v-model:visible="store.visible" :width="400" :title="$t('hcEvent.syncTitle')">
      <syncForm />
    </UIModal>
    <UIModal v-model:visible="v2Store.visible" :title="$t('content.view')" :width="600">
      <Preview />
    </UIModal>
    <UIModal v-model:visible="v2Store.calendarVisible" :title="$t('content.view')" :width="1000">
      <CalendarAndTimelineTabs />
    </UIModal>
    <DownloadModal />
  </UIPageContent>
</template>
