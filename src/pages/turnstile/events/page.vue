<script setup>
  import { UIModal, UIPageContent } from '@/components/index.js'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'
  import syncForm from './ui/syncForm.vue'
  import { useAccountStore, useEventStore } from '@/store/modules/index.js'

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
      <!--    <jobForm/>-->
      <syncForm />
    </UIModal>
  </UIPageContent>
</template>
