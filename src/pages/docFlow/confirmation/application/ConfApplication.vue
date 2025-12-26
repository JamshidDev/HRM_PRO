<script setup>
  import { UIModal, UIOfficeApp, UIPageContent, UIPageFilter } from '@/components/index.js'
  import createForm from './ui/createForm.vue'
  import Table from './ui/Table.vue'
  import { useConfApplicationStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import Banner from './ui/Banner.vue'
  import { useAccountStore } from '@/store/modules/index.js'
  import { Events, eventBus } from '@utils'

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
    <Table @openOffice="openOffice" />
    <UIOfficeApp ref="officeAppRef" />
  </UIPageContent>
</template>
