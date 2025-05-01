<script setup>
import Table from "./Table.vue"
import adContractForm from "./adContractForm.vue"
import {UIDConfirm, UIModal, UIPageContent, UIOfficeApp} from "@/components/index.js"
import {useAdContractStore, useCommandStore} from "@/store/modules/index.js"
import {FlowchartCircle20Filled} from "@vicons/fluent"
import CommandForm from "@/pages/docFlow/document/command/CommandForm.vue"
import Utils from "@/utils/Utils.js"
import Filter from "./ui/Filter.vue"


const store = useAdContractStore()
const commandStore = useCommandStore()
const officeAppRef = ref(null)

const emits = defineEmits([ 'openOffice',])
const contractData = ref(null)
const emitEv = (v)=>{
  emits('openOffice',v)
}
const openCommand = (v)=>{
  contractData.value = {
    id:v.id,
    number:v.number,
    type:v.type,
    workers:[v.worker.id],
    model:Utils.documentModels.adContract
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

const onSearchEv = ()=>{
  store.params.page = 1
  store._index()
}

const onAdd = ()=>{
  store.visibleType = true
  store.resetForm()
  store.visible = true
}

const openContract = (id)=>{
  officeAppRef.value.openPdf(id, Utils.documentModels.adContract)
}

onMounted(()=>{
  store._index()
})

</script>

<template>
<UIPageContent>
  <Filter/>
  <Table @openOffice="openContract"
         @commandEv="openCommand"
  />
  <UIModal
      :title="store.visibleType? $t('adContractPage.createTitle') : $t('adContractPage.updateTitle')"
      :width="1200"
      v-model:visible="store.visible"
  >
    <adContractForm/>
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
      <span class="w-full text-xl font-medium text-center py-4 inline-block">{{$t('contractPage.confirmAdText', {n: contractData?.number})}}</span>
    </template>
  </UIDConfirm>
  <UIOfficeApp ref="officeAppRef"/>
</UIPageContent>
</template>