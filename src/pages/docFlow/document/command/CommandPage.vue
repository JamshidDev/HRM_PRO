<script setup>
import {useAccountStore, useCommandStore, useComponentStore} from "@/store/modules/index.js"
import {UIOfficeApp, UIPageContent, UIConfirmByFile} from "@/components/index.js"
import Table from "./Table.vue"
import CommandForm from "./CommandForm.vue"
import {UIModal} from "@/components/index.js"
import Utils from "@/utils/Utils.js"
import Filter from "./ui/Filter.vue"

const officeAppRef = ref(null)
const store = useCommandStore()
const componentStore = useComponentStore()
const accStore = useAccountStore()
const emits = defineEmits([ 'openOffice',])


const openCommand = (id)=>{
  officeAppRef.value.openPdf(id, Utils.documentModels.command)
}

const onSuccessEv = (v)=>{
  store._index()
}

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.hrCommandsRead)) return
  store._index()
})

onUnmounted(()=>{
  componentStore.clearCache()
})


</script>

<template>
<UIPageContent>
  <Filter/>
  <Table @openOffice="openCommand"/>
  <UIModal
      :title="store.visibleType? $t('documentPage.command.createTitle') : $t('documentPage.command.updateTitle')"
      :width="1200"
      v-model:visible="store.visible"
  >
    <CommandForm/>
  </UIModal>
  <UIOfficeApp ref="officeAppRef"/>
  <UIConfirmByFile
      :model="Utils.documentModels.command"
      :document-id="store.elementId"
      @onSuccess="onSuccessEv"
  />
</UIPageContent>
</template>
