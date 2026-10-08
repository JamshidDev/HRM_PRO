<script setup>
  import { TurnstileDownloadModal, UIOfficeApp, UIPageContent } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import Filter from './ui/Filter.vue'
  import { useAccountStore, useApplicationStore, useComponentStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  const store = useApplicationStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()
  const officeAppRef = ref(null)

  const openApplication = (id) => {
    officeAppRef.value.openPdf(id, Utils.documentModels.workerApplication)
  }

  const { t } = i18n.global
  // HR bo'limlari — backend `stage` filtri; standart «Hammasi».
  const stageTabs = computed(() =>
    ['all', 'new', 'process', 'rejected', 'approved', 'closed'].map((id) => ({
      id,
      name: t(`applicationPage.hrTabs.${id}`)
    }))
  )
  const onStageChange = () => {
    store.params.page = 1
    store._index()
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
    <n-tabs
      v-model:value="store.params.stage"
      type="line"
      size="small"
      class="mt-2"
      @update:value="onStageChange"
    >
      <n-tab v-for="tab in stageTabs" :key="tab.id" :name="tab.id" :tab="tab.name" />
    </n-tabs>
    <Table @openOffice="openApplication" />
    <TurnstileDownloadModal />
    <UIOfficeApp ref="officeAppRef" />
  </UIPageContent>
</template>
