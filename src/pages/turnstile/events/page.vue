<script setup>
  import { UIModal, UIPageContent } from '@/components/index.js'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'
  import syncForm from './ui/syncForm.vue'
  import DownloadModal from '../eventsV2/ui/DownloadModal.vue'
  import CalendarAndTimelineTabs from '../eventsV2/ui/CalendarAndTimelineTabs.vue'
  import Preview from '../eventsV2/ui/Preview.vue'
  import AttendanceCards from './ui/AttendanceCards.vue'
  import { PreviewList } from '../dashboard/ui/index.js'
  import {
    useAccountStore,
    useEventStore,
    useEventV2Store,
    useTurnstileDashboardStore
  } from '@/store/modules/index.js'

  const store = useEventStore()
  const v2Store = useEventV2Store()
  const accStore = useAccountStore()
  const dashboardStore = useTurnstileDashboardStore()
  const previewTitle = computed(
    () => dashboardStore.cardTypes[dashboardStore.previewParams.type]?.name ?? ''
  )

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.turnstileHikCentralEventsRead)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <AttendanceCards />
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
    <UIModal v-model:visible="dashboardStore.previewVisible" :width="1400">
      <template #header-title>
        <h1 class="text-lg font-medium text-fig-text-primary flex items-center gap-4">
          {{ $t('hcEvent.preview') }}
          <span
            v-if="previewTitle"
            class="bg-primary/10 text-primary py-1 px-2 rounded-2xl text-sm"
          >
            #{{ $t(previewTitle) }}
          </span>
        </h1>
      </template>
      <PreviewList />
    </UIModal>
  </UIPageContent>
</template>
