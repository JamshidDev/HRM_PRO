<script setup>
  import { UIModal, UIOfficeApp, UIPageContent, UISegmentTabs } from '@/components/index.js'
  import ApplicationPage from '@/pages/docFlow/document/application/page.vue'
  import i18n from '@/i18n/index.js'
  import {
    useAccountStore,
    useComponentStore,
    useEmployeeDocumentStore
  } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import ResendSignersModal from '@/pages/docFlow/document/command/ResendSignersModal.vue'
  import Filter from './Filter.vue'
  import Table from './Table.vue'
  import Form from './Form.vue'
  import { useRoute } from 'vue-router'

  const store = useEmployeeDocumentStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()
  const officeAppRef = ref(null)
  // «Bildirgilar» menyusi shu sahifani `meta.notice` bilan ochadi.
  const route = useRoute()
  const notice = computed(() => Boolean(route.meta?.notice))
  // Bildirgilar: «Xodimlarga yuborilgan» (HR yaratadi) va «Xodimlardan kelgan» (ariza oqimi).
  const { t } = i18n.global
  const tab = ref('outbox')
  const tabs = computed(() => [
    { id: 'outbox', name: t('noticesPage.tabs.outbox') },
    { id: 'fromWorkers', name: t('noticesPage.tabs.fromWorkers') }
  ])
  // Tab qaytganda ro'yxat qayta yuklanadi (store holati ariza sahifasi bilan almashmaydi).
  watch(tab, (v) => {
    if (v === 'outbox') {
      store.setMode(true)
      if (accStore.checkAction(accStore.pn.hrContractsRead)) store._index()
    }
  })

  const openDocument = (id) => {
    officeAppRef.value.openPdf(id, Utils.documentModels.documents)
  }

  onMounted(() => {
    store.setMode(notice.value)
    if (!accStore.checkAction(accStore.pn.hrContractsRead)) return
    store._index()
  })

  onUnmounted(() => {
    componentStore.clearCache()
  })
</script>

<template>
  <ApplicationPage v-if="notice && tab === 'fromWorkers'" notice>
    <template #top><UISegmentTabs v-model="tab" :tabs="tabs" /></template>
  </ApplicationPage>
  <UIPageContent v-else>
    <UISegmentTabs v-if="notice" v-model="tab" :tabs="tabs" />
    <Filter />
    <Table @openOffice="openDocument" />
    <UIModal
      :title="
        notice
          ? $t(store.editId ? 'noticesPage.updateTitle' : 'noticesPage.createTitle')
          : $t(store.editId ? 'employeeDocumentsPage.updateTitle' : 'employeeDocumentsPage.createTitle')
      "
      :width="1000"
      v-model:visible="store.visible"
    >
      <Form />
    </UIModal>
    <ResendSignersModal
      v-model:visible="store.resendVisible"
      :rows="store.resendRows"
      :content-changed="true"
      :loading="store.resendLoading"
      @confirm="(v) => store._confirmEdit(v)"
    />
    <UIOfficeApp ref="officeAppRef" @signatureEv="store._index()" />
  </UIPageContent>
</template>
