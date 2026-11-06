<script setup>
  import { TurnstileDownloadModal, UIOfficeApp, UIPageContent } from '@/components/index.js'
  import { useArchiveStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'

  const store = useArchiveStore()
  const officeAppRef = ref(null)

  // Bo'shatish buyrug'i — sarlavha «№45 — turi» (buyruqlar sahifasidagi kabi).
  const openCommand = (cmd) => {
    if (!cmd?.id) return
    const number = cmd.command_number ? `№${cmd.command_number}` : null
    const title = [number, cmd.type_name].filter(Boolean).join(' — ') || undefined
    officeAppRef.value?.openPdf(cmd.id, Utils.documentModels.command, undefined, title)
  }

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
    <Table @openCommand="openCommand" />
    <TurnstileDownloadModal />
    <UIOfficeApp ref="officeAppRef" />
  </UIPageContent>
</template>
