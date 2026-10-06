<script setup>
  import { TurnstileDownloadModal, UIOfficeApp, UIPageContent } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import Filter from './ui/Filter.vue'
  import { useAccountStore, useApplicationStore, useComponentStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  const store = useApplicationStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()
  const officeAppRef = ref(null)

  const openApplication = (id) => {
    officeAppRef.value.openPdf(id, Utils.documentModels.workerApplication)
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrWorkerApplicationsRead)) return
    store._index()
  })

  onUnmounted(() => {
    componentStore.clearCache()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table @openOffice="openApplication" />
    <TurnstileDownloadModal />
    <UIOfficeApp ref="officeAppRef" />
  </UIPageContent>
</template>
