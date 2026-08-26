<script setup>
  import { UIPageContent } from '@/components/index.js'
  import { useArchiveStore } from '@/store/modules/index.js'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'

  const store = useArchiveStore()

  onMounted(() => {
    store._index()
  })
</script>

<template>
  <UIPageContent class="!gap-6">
    <!-- Izoh ildiz elementning ICHIDA: ildizdan oldin qo'yilsa sahifa fragment
         ildizga aylanadi va marshrut almashganda `<transition mode="out-in">`
         qotib qoladi.

         Maketda (node 3332:65659) sahifa cheti 16px, qidiruv qatori bilan
         jadval orasi esa 24px (`UIPageContent` ning standart oralig'i 16px). -->
    <Filter />
    <Table />
  </UIPageContent>
</template>
