<script setup>
  import { UIOfficeApp, UIPageContent, UIPageFilter } from '@/components/index.js'
  import {
    useAccountStore,
    useConfirmationMaterialLiabilityStore
  } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import Table from './Table.vue'

  const store = useConfirmationMaterialLiabilityStore()
  const accStore = useAccountStore()
  const officeAppRef = ref(null)

  const openOffice = (v) => {
    officeAppRef.value.openPdf(v.documentId, Utils.documentModels.materialLiability, v.signatureId)
  }

  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.confirmationContracts)) return
    store.params.page = 1
    store._index()
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.confirmationContracts)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <UIPageFilter
      :placeholder="$t('documentSettings.searchPlaceholder')"
      :show-add-button="false"
      v-model:search="store.params.search"
      @onSearch="onSearch"
      :search-loading="store.loading"
    />
    <Table @openOffice="openOffice" />
    <UIOfficeApp ref="officeAppRef" @signatureEv="store._index()" />
  </UIPageContent>
</template>
