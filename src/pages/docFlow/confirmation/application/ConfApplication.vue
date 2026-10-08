<script setup>
  import { UIModal, UIOfficeApp, UIPageContent, UIPageFilter } from '@/components/index.js'
  import createForm from './ui/createForm.vue'
  import Table from './ui/Table.vue'
  import { useConfApplicationStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import Banner from './ui/Banner.vue'
  import { useAccountStore } from '@/store/modules/index.js'
  import { Events, eventBus } from '@utils'
  import { useNotify } from '@/composables/useNotify'
  import i18n from '@/i18n'

  const t = i18n.global.t
  const DRAFT_CONFIRMATION = 6

  const accStore = useAccountStore()

  const store = useConfApplicationStore()

  const officeAppRef = ref(null)
  const onAdd = () => {
    store.resetForm()
    store.visibleType = true
    store.visible = true
  }

  const onSearch = () => {
    store.params.page = 1
    store._index()
  }

  const openOffice = (v) => {
    officeAppRef.value.openPdf(v.documentId, Utils.documentModels.workerApplication, v.signatureId)
  }

  // Ariza holati tablari: 0 Hammasi (standart), 1 Jarayonda, 6 Qoralama, 3 Tasdiqlangan, 4 Rad etilgan.
  const statusTabs = computed(() => [
    { id: 0, name: t('applicationPage.hrTabs.all') },
    { id: 1, name: t('content.Process') },
    { id: DRAFT_CONFIRMATION, name: t('applicationPage.draft') },
    { id: 3, name: t('applicationPage.approved') },
    { id: 4, name: t('content.Rejected') }
  ])
  const onFilterChange = () => {
    store.params.page = 1
    store._index()
  }

  // Yangi qoralama: hujjatni ochib imzolashni so'raymiz (mobil bilan bir xil).
  watch(
    () => store.signPromptRow,
    (row) => {
      if (!row) return
      store.signPromptRow = null
      openOffice({ documentId: row.worker_application.id, signatureId: row.id })
      useNotify().info(t('applicationPage.draftSignTitle'), {
        description: t('applicationPage.draftSignBody')
      })
    }
  )

  const onUpdateItem = (v) => {
    const index = store.list.findIndex((x) => x.id === v.documentId)
    if (index === -1) return
    store.list[index].worker_application.generate = 3
  }

  onMounted(() => {
    eventBus.on(Events.APPLICATION_GENERATED, onUpdateItem)
    if (!accStore.checkAction(accStore.pn.confirmationWorkerApplications)) return
    store._index()
  })

  onUnmounted(() => {
    eventBus.off(Events.APPLICATION_GENERATED, onUpdateItem)
  })
</script>

<template>
  <UIPageContent>
    <Banner />
    <UIPageFilter
      class="mt-4"
      v-model:search="store.params.search"
      :show-filter-button="false"
      :show-add-button="false"
      @onSearch="onSearch"
      @onAdd="onAdd"
    />
    <UIModal
      :width="600"
      :visible="store.visible"
      @update:visible="(v) => (store.visible = v)"
      :title="
        store.visibleType
          ? $t('applicationPage.createWorkerApplication')
          : $t('applicationPage.updateWorkerApplication')
      "
    >
      <template #default>
        <createForm />
      </template>
    </UIModal>
    <n-tabs
      v-model:value="store.params.application_confirmation"
      type="line"
      size="small"
      class="mt-2"
      @update:value="onFilterChange"
    >
      <n-tab v-for="tab in statusTabs" :key="tab.id" :name="tab.id" :tab="tab.name" />
    </n-tabs>
    <Table @openOffice="openOffice" />
    <UIOfficeApp ref="officeAppRef" />
  </UIPageContent>
</template>
