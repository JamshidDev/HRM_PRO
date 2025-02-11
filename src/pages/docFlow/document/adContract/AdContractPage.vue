<script setup>
import Table from "./Table.vue"
import adContractForm from "./adContractForm.vue"
import {UIModal} from "@/components/index.js"
import {useAdContractStore} from "@/store/modules/index.js"

const store = useAdContractStore()

</script>

<template>
<div>
  <Table/>
  <UIModal
      :title="store.visibleType? $t('adContractPage.createTitle') : $t('adContractPage.updateTitle')"
      :width="1200"
      v-model:visible="store.visible"
  >
    <adContractForm/>
  </UIModal>
</div>
</template>