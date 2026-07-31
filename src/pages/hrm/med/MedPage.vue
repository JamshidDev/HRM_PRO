2
<script setup>
  import { UIDrawer, UIOfficeApp, UIPageContent } from '@/components/index.js'
  import { useAccountStore, useComponentStore, useMedStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import MedInspectionPage from '../medInspection/page.vue'
  import PolyclinicPage from '../polyclinic/page.vue'
  import createForm from './ui/createForm.vue'
  import Filter from './ui/Filter.vue'
  import IndicatorBoxes from './ui/IndicatorBoxes.vue'
  import Table from './ui/Table.vue'

  const store = useMedStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()
  const officeAppRef = ref(null)

  const openOffice = (id) => {
    officeAppRef.value.openPdf(id, Utils.documentModels.med)
  }

  onMounted(() => {
    store._dashboard()

    if (!accStore.checkAction(accStore.pn.hrMedRead)) return
    store._index()
  })

  onUnmounted(() => {
    componentStore.clearCache()
  })
</script>

<template>
  <UIPageContent>
    <IndicatorBoxes>
      <template #panel-1>
        <Filter />
        <Table />
      </template>
      <template #panel-2>
        <PolyclinicPage />
      </template>
      <template #panel-3>
        <MedInspectionPage @openOffice="openOffice" />
      </template>
    </IndicatorBoxes>
    <UIOfficeApp ref="officeAppRef" />
    <UIDrawer
      :visible="store.visible"
      @update:visible="(v) => (store.visible = v)"
      :title="store.visibleType ? $t('medPage.createTitle') : $t('medPage.updateTitle')"
    >
      <template #content>
        <createForm />
      </template>
    </UIDrawer>
  </UIPageContent>
</template>

<style scoped></style>
