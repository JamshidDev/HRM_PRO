<script setup>
  import { UIPageContent } from '@/components/index.js'
  import { useAccountStore, useShiftTypeStore } from '@/store/modules/index.js'
  import { Filter, Table, GenerateModal, ScheduleModal, DailyScheduleModal } from './ui/index.js'

  const store = useShiftTypeStore()
  const accStore = useAccountStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsWorkersRead)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <GenerateModal />
    <ScheduleModal />
    <DailyScheduleModal />
  </UIPageContent>
</template>
