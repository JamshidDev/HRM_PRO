<script setup>
  import { UIPageContent, UIOfficeApp } from '@/components/index.js'
  import { useConfirmationReportStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'

  const store = useConfirmationReportStore()
  const officeAppRef = ref(null)

  const openReport = (v) => {
    console.log(v)
    officeAppRef.value.openPdf(v.documentId, Utils.documentModels.report, v.signatureId)
  }

  onMounted(() => {
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table @openOffice="openReport" />
    <UIOfficeApp ref="officeAppRef" />
  </UIPageContent>
</template>
