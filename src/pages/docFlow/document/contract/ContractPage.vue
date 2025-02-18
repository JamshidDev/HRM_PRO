<script setup>
import contractForm from "./contractForm.vue"
import CommandForm from "../command/CommandForm.vue"
import ContractList from "./ContractList.vue"
import { FlowchartCircle20Filled} from "@vicons/fluent"
import {UIModal, UIDConfirm} from "@/components/index.js"
import {useContractStore, useCommandStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useContractStore()
const commandStore = useCommandStore()
const emits = defineEmits([ 'openOffice',])

const contractData = ref(null)

const emitEv = (v)=>{
  emits('openOffice',v)
}

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


</script>

<template>
<ContractList
    @openOffice="emitEv"
    @commandEv="openCommand"
/>
  <UIModal
      :title="store.visibleType? $t('documentPage.createTitle') : $t('documentPage.updateTitle')"
      :width="1200"
      v-model:visible="store.visible"
  >
    <contractForm/>
  </UIModal>
  <UIModal
      :title="commandStore.visibleType? $t('documentPage.command.createTitle') : $t('documentPage.command.updateTitle')"
      :width="1200"
      v-model:visible="commandStore.visible"
  >
    <CommandForm
        :data="contractData"
    />
  </UIModal>
  <UIDConfirm
      @onClose="onClose"
      @onSave="onSave"
      v-model:visible="store.confirmationVisible"
      :submit-btn-text="$t('content.yes')"
      :close-btn-text="$t('content.no')"
  >
    <template #icon>
     <div class="flex justify-center p-4">
       <n-icon size="86" class="text-primary mx-auto">
         <FlowchartCircle20Filled/>
       </n-icon>
     </div>
    </template>
    <template #default>
      <span class="w-full text-xl font-medium text-center py-4 inline-block">{{$t('contractPage.confirmText', {n: contractData.number})}}</span>
    </template>
  </UIDConfirm>
</template>
