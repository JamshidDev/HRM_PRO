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
  // notice — HR «Bildirgilar» menyusidan: xodimlardan kelgan bildirgilar.
  const props = defineProps({ notice: { type: Boolean, default: false } })
  const route = useRoute()
  const store = useApplicationStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()
  const officeAppRef = ref(null)

  // Ko'rish oynasi sarlavhasi — «№1 — Ariza turi» (berilmasa UUID chiqardi).
  const openApplication = (id) => {
    const row = store.list.find((x) => x.id === id)
    const title = Utils.documentTitle(row?.number, row?.type?.name)
    officeAppRef.value.openPdf(id, Utils.documentModels.workerApplication, undefined, title)
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
  // Yagona holat tablari (xodim tomoni bilan bir xil) — backend `stage` filtri.
  const stageTabs = computed(() => [
    { id: 'all', name: t('applicationPage.hrTabs.all') },
    ...['returned', 'checking', 'process', 'approved', 'rejected'].map((id) => ({
      id,
      name: t(`applicationPage.statuses.${id}`)
    }))
  ])
  const onStageChange = () => {
    store.params.page = 1
    store._index()
  }

  onMounted(() => {
    store.params.kind = props.notice ? 'notice' : null
    store.params.page = 1
    store.list = []
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
    <slot name="top" />
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
