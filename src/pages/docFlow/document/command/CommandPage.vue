<script setup>
import {useCommandStore} from "@/store/modules/index.js"
import Table from "./Table.vue"
import CommandForm from "./CommandForm.vue"
import {UIModal} from "@/components/index.js"
const store = useCommandStore()
const emits = defineEmits([ 'openOffice',])
const emitEv = (v)=>{
  emits('openOffice',v)
}
</script>

<template>
<div>
  <Table @openOffice="emitEv"/>
  <UIModal
      :title="store.visibleType? $t('documentPage.command.createTitle') : $t('documentPage.command.updateTitle')"
      :width="1200"
      v-model:visible="store.visible"
  >
    <CommandForm/>
  </UIModal>
</div>
</template>
