<script setup>
  import { useRoute } from 'vue-router'
  import { TurnstileDownloadModal, UIOfficeApp, UIPageContent, UISegmentTabs } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import Filter from './ui/Filter.vue'
  import CommandForm from '@/pages/docFlow/document/command/CommandForm.vue'
  import {
    useAccountStore,
    useApplicationStore,
    useCommandStore,
    useComponentStore
  } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  const route = useRoute()
  const store = useApplicationStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()
  const officeAppRef = ref(null)

  const openApplication = (id) => {
    officeAppRef.value.openPdf(id, Utils.documentModels.workerApplication)
  }

  const commandStore = useCommandStore()
  const prefillLoading = ref(false)

  // Bog'langan buyruq — buyruqlar sahifasidagi kabi PDF oynasida.
  const openCommand = (cmd) => {
    const title = cmd.command_number ? `№${cmd.command_number}` : undefined
    officeAppRef.value?.openPdf(cmd.id, Utils.documentModels.command, undefined, title)
  }

  // Tasdiqlangan arizadan buyruq: korxona/tur/xodim arizadan to'ldirilib qulflanadi.
  const createCommand = (row) => {
    if (prefillLoading.value || !accStore.checkAction(accStore.pn.hrCommandsWrite)) return
    prefillLoading.value = true
    $ApiService.applicationService
      ._commandPrefill({ id: row.id })
      .then((res) => commandStore.openFromApplication(res.data.data))
      .finally(() => {
        prefillLoading.value = false
      })
  }

  // Buyruq saqlangach ustunda raqami ko'rinadi.
  watch(
    () => commandStore.applicationLinkedAt,
    () => store._index()
  )

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
    if (route.query.confirmation) {
      store.params.confirmation = Number(route.query.confirmation)
    }
    store._index()
  })

  onUnmounted(() => {
    componentStore.clearCache()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <UISegmentTabs
      v-model="store.params.stage"
      :tabs="stageTabs"
      @update:model-value="onStageChange"
    />
    <Table
      @openOffice="openApplication"
      @openCommand="openCommand"
      @createCommand="createCommand"
    />
    <CommandForm />
    <TurnstileDownloadModal />
    <UIOfficeApp ref="officeAppRef" />
  </UIPageContent>
</template>
