<script setup>
  import contractForm from './contractForm.vue'
  import ContractFormSteps from './ui/ContractFormSteps.vue'
  import ContractList from './ContractList.vue'
  import { UIModal, UIPageContent, UIOfficeApp } from '@/components/index.js'
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
    <UIModal
      :title="store.visibleType ? $t('documentPage.createTitle') : $t('documentPage.updateTitle')"
      :width="1200"
      card-class="contract-modal-card"
      v-model:visible="store.visible"
      :header-divider="false"
    >
      <!-- Qadamlar sarlavha qatorida: forma faqat maydonlardan iborat qoladi -->
      <template #header-actions>
        <ContractFormSteps />
      </template>
      <contractForm />
    </UIModal>
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
