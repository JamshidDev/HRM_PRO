<script setup>
import contractForm from "./contractForm.vue"
import ContractList from "./ContractList.vue"
import {UIModal,UIPageContent,UIOfficeApp, UIConfirmByFile} from "@/components/index.js"
import {useContractStore, useAccountStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import Filter from "./ui/Filter.vue"
const accStore = useAccountStore()
const store = useContractStore()

const contractData = ref(null)
const officeAppRef = ref(null)

const openCommand = (v)=>{
  contractData.value = {
    id:v.id,
    number:v.number,
    type:v.type.id,
    workers:[v.worker.id],
    model:Utils.documentModels.contract
  }
  store.confirmationVisible=true
}

const openOffice = (id)=>{
  officeAppRef.value.openPdf(id, Utils.documentModels.contract)
}

const onSuccessEv = (v)=>{
  store._index()
}


onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.hrContractsRead)) return
  store._index()
})


</script>

<template>

  <UIPageContent>
   <Filter/>
    <ContractList
        @openOffice="openOffice"
        @commandEv="openCommand"
    />
    <UIModal
        :title="store.visibleType? $t('documentPage.createTitle') : $t('documentPage.updateTitle')"
        :width="1200"
        v-model:visible="store.visible"
    >
      <contractForm />
    </UIModal>
    <UIOfficeApp ref="officeAppRef"/>
    <UIConfirmByFile
        :model="Utils.documentModels.contract"
        :document-id="store.elementId"
        @onSuccess="onSuccessEv"/>
  </UIPageContent>
</template>
