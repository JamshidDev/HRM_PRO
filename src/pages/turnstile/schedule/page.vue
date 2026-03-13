<script setup>
  import { UIPageContent } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import Filter from './ui/Filter.vue'
  import SettingModal from './ui/SettingModal.vue'
  import SaveBox from './ui/SaveBox.vue'
  import GrandModal from './ui/GrandModal.vue'
  import ExportModal from './ui/ExportModal.vue'
  import MultipleScheduleAttach from './ui/MultipleScheduleAttach.vue'
  import ReplaceWorkerModal from './ui/ReplaceWorkerModal.vue'

  import { useScheduleTableStore } from '@/store/modules/index.js'

  const store = useScheduleTableStore()

  onMounted(() => {
    store._initialData()
  })
</script>

<template>
  <UIPageContent>
    <Table>
      <template #filter-section>
        <Filter />
      </template>
    </Table>
    <SettingModal />
    <SaveBox />
    <GrandModal />
    <ExportModal />
    <MultipleScheduleAttach />
    <ReplaceWorkerModal />
  </UIPageContent>
</template>
