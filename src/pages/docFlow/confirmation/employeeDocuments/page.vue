<script setup>
  import { UIOfficeApp, UIPageContent, UIPageFilter } from '@/components/index.js'
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

  const openOffice = (v) => {
    officeAppRef.value.openPdf(v.documentId, Utils.documentModels.documents, v.signatureId)
  }

  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.confirmationContracts)) return
    store.params.page = 1
    store._index()
  }

  onMounted(() => {
    store.params.type = route.meta?.notice ? 'notice' : null
    store.params.page = 1
    store.list = []
    if (!accStore.checkAction(accStore.pn.confirmationContracts)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
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
