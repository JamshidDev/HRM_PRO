<script setup>
import contractForm from "./contractForm.vue"
import CommandForm from "../command/CommandForm.vue"
import ContractList from "./ContractList.vue"
import { FlowchartCircle20Filled} from "@vicons/fluent"
import {UIModal, UIDConfirm} from "@/components/index.js"
import {useContractStore, useCommandStore} from "@/store/modules/index.js"

const store = useContractStore()
const commandStore = useCommandStore()
const emits = defineEmits([ 'openOffice',])

const emitEv = (v)=>{
  emits('openOffice',v)
}

const openCommand = (v)=>{
  commandStore.payload.contract_id = v.id
  commandStore.contractNumber= v.number
  commandStore.payload.workers= [v.worker.id]
  store.number = v.number
  store.confirmationVisible=true
}

const onClose = ()=>{
  store.confirmationVisible=false
  store._finishContract(commandStore.payload.contract_id)
}

const onSave = ()=>{
  store.confirmationVisible=false
  commandStore.visibleType = true
  commandStore.visible = true
}

const files = ref([])

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
    <CommandForm/>
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
      <span class="w-full text-xl font-medium text-center py-4 inline-block">{{$t('contractPage.confirmText', {n: store.number})}}</span>
    </template>
  </UIDConfirm>
</template>
