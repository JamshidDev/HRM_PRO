<script setup>
  import { UIOfficeApp, UIPageContent, UIPageFilter } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import Table from './ui/Table.vue'
  import Filter from './ui/Filter.vue'
  import { useIncentiveStore, useAccountStore } from '@/store/modules/index.js'
  import { useRoute } from 'vue-router'

  const accStore = useAccountStore()
  const store = useIncentiveStore()
  const route = useRoute()
  const officeAppRef = ref(null)

  // Rag'batlantirish buyrug'ini ko'rish oynasida ochish (buyruqlar sahifasidagidek PDF).
  const openCommand = (row) => {
    const title = row?.number ? `№${row.number} — ${row.gift ?? ''}` : row?.gift
    officeAppRef.value.openPdf(row.command_id, Utils.documentModels.command, undefined, title)
  }

  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.hrIncentivesRead)) return
    store.params.page = 1
    store._index()
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrIncentivesRead)) return
    store.uuid = route.query.id
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table @openCommand="openCommand" />
    <UIOfficeApp ref="officeAppRef" />
  </UIPageContent>
</template>
