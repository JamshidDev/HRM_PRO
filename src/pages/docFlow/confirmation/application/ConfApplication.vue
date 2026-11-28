<script setup>
  import { UIModal, UIOfficeApp, UIPageContent, UIPageFilter, UISegmentTabs } from '@/components/index.js'
  import createForm from './ui/createForm.vue'
  import ApplicationSteps from './ui/ApplicationSteps.vue'
  import Table from './ui/Table.vue'
  import { useConfApplicationStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { useAccountStore } from '@/store/modules/index.js'
  import { Events, eventBus } from '@utils'
  import { useNotify } from '@/composables/useNotify'
  import i18n from '@/i18n'

  const t = i18n.global.t
  // notice — Bildirgilar menyusidan: xodim bildirgilari (ro'yxat, tur tanlovi, sarlavha).
  const props = defineProps({ notice: { type: Boolean, default: false } })

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

  // PDF'ni backend yaratadi; qolgan `${…}` backendda bo'sh satrga aylanadi.
  const openOffice = (v) => {
    officeAppRef.value.openPdf(v.documentId, Utils.documentModels.workerApplication, v.signatureId)
  }

  // Yagona holat tablari (jadvaldagi «Holati» bilan bir xil).
  const statusTabs = computed(() => [
    { id: 'all', name: t('applicationPage.hrTabs.all'), badge: store.stateCounts.all ?? 0 },
    ...['draft', 'returned', 'checking', 'process', 'approved', 'rejected'].map((id) => ({
      id,
      name: t(`applicationPage.statuses.${id}`),
      badge: store.stateCounts[id] ?? 0
    }))
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
    store.noticeMode = props.notice
    store.params.page = 1
    store.list = []
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
    <slot name="top" />
    <!-- Sarlavhadagi banner (Xush kelibsiz + pie chart) olib tashlandi — ariza boshqa sahifalardagi
         kabi qidiruv qatoridagi «Qo'shish» tugmasi bilan yaratiladi. -->
    <UIPageFilter
      :placeholder="$t('documentSettings.searchPlaceholder')"
      v-model:search="store.params.search"
      :show-filter-button="false"
      @onSearch="onSearch"
      @onAdd="onAdd"
    >
      <!-- Holat tablari qidiruv bilan bir qatorda. -->
      <template #filterSearch>
        <div class="conf-app-tabs min-w-0 overflow-x-auto">
          <UISegmentTabs
            v-model="store.params.app_state"
            :tabs="statusTabs"
            @update:model-value="onFilterChange"
          />
        </div>
      </template>
    </UIPageFilter>
    <UIModal
      :width="600"
      :visible="store.visible"
      @update:visible="(v) => (store.visible = v)"
      :title="
        props.notice
          ? $t(store.visibleType ? 'noticesPage.createWorkerNotice' : 'noticesPage.updateWorkerNotice')
          : store.visibleType
            ? $t('applicationPage.createWorkerApplication')
            : $t('applicationPage.updateWorkerApplication')
      "
    >
      <!-- Sarlavha o'rnida qadamlar (ariza); bildirgida — oddiy sarlavha. -->
      <template v-if="!props.notice" #header-title>
        <ApplicationSteps />
      </template>
      <template #default>
        <createForm />
      </template>
    </UIModal>
    <Table @openOffice="openOffice" />
    <UIOfficeApp ref="officeAppRef" />
  </UIPageContent>
</template>

<style scoped>
  /* Sig'masa tablar siqilmaydi (matn ustma-ust tushmaydi) — yon tomonga suriladi. */
  .conf-app-tabs :deep(.seg-tabs > div) {
    min-width: max-content;
  }
</style>
