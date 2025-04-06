<script setup>
import contractForm from "./contractForm.vue"
import ContractList from "./ContractList.vue"
import {UIModal,UIPageContent,UIOfficeApp} from "@/components/index.js"
import {useContractStore, useCommandStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import Filter from "./ui/Filter.vue"

const store = useContractStore()
const commandStore = useCommandStore()

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

const onClose = ()=>{
  store.confirmationVisible=false
  store._finishContract(contractData.value?.id)
}

const onSave = ()=>{
  store.confirmationVisible=false
  commandStore.visibleType = true
  commandStore.visible = true
}


const openOffice = (id)=>{
  officeAppRef.value.openPdf(id, Utils.documentModels.contract)
}


onMounted(()=>{
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
  </UIPageContent>
</template>
