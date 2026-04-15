<script setup>
  import { UIModal, UIPageContent } from '@/components/index.js'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'
  import syncForm from './ui/syncForm.vue'
  import DownloadModal from '../eventsV2/ui/DownloadModal.vue'
  import { useAccountStore, useEventStore, useEventV2Store } from '@/store/modules/index.js'

  const store = useEventStore()
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
    <DownloadModal />
  </UIPageContent>
</template>
