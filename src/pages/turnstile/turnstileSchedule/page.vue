<script setup>
  import { UIPageContent } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import Filter from './ui/Filter.vue'
  import LoaderBox from './ui/LoaderBox.vue'
  import GrandModal from './ui/GrandModal.vue'

  import { useAccountStore, useTurnstileScheduleStore } from '@/store/modules/index.js'

  const store = useTurnstileScheduleStore()
  const accStore = useAccountStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.turnstileScheduleRead)) return
    store._initialData()
  })
</script>

<template>
  <UIPageContent>
    <Table>
      <template #filter-section>
        <Filter />
      </template>
      <template #loading-place>
        <LoaderBox />
      </template>
    </Table>
    <GrandModal />
  </UIPageContent>
</template>
