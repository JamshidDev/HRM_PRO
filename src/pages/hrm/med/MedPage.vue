<script setup>
  import { UIModal, UIOfficeApp, UIPageContent } from '@/components/index.js'
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
  const createFormRef = ref(null)

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
    <UIModal
      v-model:visible="store.visible"
      :title="store.visibleType ? $t('medPage.createTitle') : $t('medPage.updateTitle')"
      width="min(700px, calc(100vw - 32px))"
      height="min(85vh, 800px)"
    >
      <createForm ref="createFormRef" />

      <template #footer>
        <div class="flex justify-end gap-2 px-4 pb-2">
          <n-button type="error" ghost class="w-[130px]" @click="store.openVisible(false)">
            {{ $t('content.cancel') }}
          </n-button>
          <n-button
            type="primary"
            class="w-[130px]"
            :loading="store.saveLoading"
            @click="createFormRef?.submit()"
          >
            {{ $t('content.save') }}
          </n-button>
        </div>
      </template>
    </UIModal>
  </UIPageContent>
</template>

<style scoped></style>
