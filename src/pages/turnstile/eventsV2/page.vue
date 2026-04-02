<script setup>
import {UIModal, UIPageContent} from '@/components/index.js'
import Filter from './ui/Filter.vue'
import Table from './ui/Table.vue'
import Preview from './ui/Preview.vue'
import DownloadModal from './ui/DownloadModal.vue'
import CalendarAndTimelineTabs from './ui/CalendarAndTimelineTabs.vue'
import {useAccountStore, useEventV2Store} from '@/store/modules/index.js'

const store = useEventV2Store()
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
    <UIModal v-model:visible="store.visible" :title="$t('content.view')" :width="600">
      <Preview />
    </UIModal>
    <UIModal v-model:visible="store.calendarVisible" :title="$t('content.view')" :width="1000">
      <CalendarAndTimelineTabs />
    </UIModal>
    <DownloadModal />
  </UIPageContent>
</template>
