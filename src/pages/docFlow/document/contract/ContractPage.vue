<script setup>
  import ContractModal from './ContractModal.vue'
  import ContractList from './ContractList.vue'
  import { UIPageContent, UIOfficeApp } from '@/components/index.js'
  import { useContractStore, useAccountStore, useComponentStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import Filter from './ui/Filter.vue'
  import ResendSignersModal from '@/pages/docFlow/document/command/ResendSignersModal.vue'
  const accStore = useAccountStore()
  const componentStore = useComponentStore()
  const store = useContractStore()

  const contractData = ref(null)
  const officeAppRef = ref(null)

  const openCommand = (v) => {
    contractData.value = {
      id: v.id,
      number: v.number,
      type: v.type.id,
      workers: [v.worker.id],
      model: Utils.documentModels.contract
    }
    store.confirmationVisible = true
  }

  const openOffice = (id) => {
    officeAppRef.value.openPdf(id, Utils.documentModels.contract)
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrContractsRead)) return
    store._index()
  })

  onUnmounted(() => {
    componentStore.clearCache()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <ContractList @openOffice="openOffice" @commandEv="openCommand" />
    <ContractModal
      v-model:visible="store.visible"
      :title="store.visibleType ? $t('documentPage.createTitle') : $t('documentPage.updateTitle')"
    />
    <!-- Tahrir saqlanganda: qayta imzolashga barchaga yoki tanlanganlarga. -->
    <ResendSignersModal
      v-model:visible="store.resendVisible"
      :rows="store.resendRows"
      :content-changed="true"
      :loading="store.resendLoading"
      @confirm="(v) => store._confirmEdit(v)"
    />
    <UIOfficeApp ref="officeAppRef" />
  </UIPageContent>
</template>
