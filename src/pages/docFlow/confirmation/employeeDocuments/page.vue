<script setup>
  import { UIOfficeApp, UIPageContent, UIPageFilter, UISegmentTabs } from '@/components/index.js'
  import ConfApplication from '@/pages/docFlow/confirmation/application/ConfApplication.vue'
  import i18n from '@/i18n/index.js'
  import {
    useAccountStore,
    useConfirmationEmployeeDocumentStore
  } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import Table from './Table.vue'
  import { useRoute } from 'vue-router'

  const store = useConfirmationEmployeeDocumentStore()
  const accStore = useAccountStore()
  const officeAppRef = ref(null)
  // «Bildirgilar» menyusi — faqat bildirgilar; «Xodim hujjatlari» — qolganlari (backend bildirgini chiqarmaydi).
  const route = useRoute()
  const notice = computed(() => Boolean(route.meta?.notice))
  // Bildirgilar: «Menga kelgan» (HR'dan) va «Men yuborgan» (xodim bildirgisi — ariza oqimi).
  const { t } = i18n.global
  const tab = ref('inbox')
  const tabs = computed(() => [
    { id: 'inbox', name: t('noticesPage.tabs.inbox') },
    { id: 'sent', name: t('noticesPage.tabs.sent') }
  ])

  const openOffice = (v) => {
    officeAppRef.value.openPdf(v.documentId, Utils.documentModels.documents, v.signatureId)
  }

  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.confirmationContracts)) return
    store.params.page = 1
    store._index()
  }

  watch(tab, (v) => {
    if (v === 'inbox' && accStore.checkAction(accStore.pn.confirmationContracts)) store._index()
  })

  onMounted(() => {
    store.params.type = route.meta?.notice ? 'notice' : null
    store.params.page = 1
    store.list = []
    if (!accStore.checkAction(accStore.pn.confirmationContracts)) return
    store._index()
  })
</script>

<template>
  <ConfApplication v-if="notice && tab === 'sent'" notice>
    <template #top><UISegmentTabs v-model="tab" :tabs="tabs" /></template>
  </ConfApplication>
  <UIPageContent v-else>
    <UISegmentTabs v-if="notice" v-model="tab" :tabs="tabs" />
    <UIPageFilter
      :placeholder="$t('documentSettings.searchPlaceholder')"
      :show-add-button="false"
      :show-filter-button="false"
      v-model:search="store.params.search"
      @onSearch="onSearch"
      :search-loading="store.loading"
    />
    <Table @openOffice="openOffice" />
    <UIOfficeApp ref="officeAppRef" @signatureEv="store._index()" />
  </UIPageContent>
</template>
