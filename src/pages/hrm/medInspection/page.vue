<script setup>
import {UIDrawer} from "@/components/index.js"
import {useMedInspectionStore} from "@/store/modules/index.js"
import Filter from "./ui/Filter.vue"
import Table from "./ui/Table.vue"
import createForm from "./ui/createForm.vue"

const store = useMedInspectionStore()
const emits = defineEmits(['openOffice'])




onMounted(()=>{
  store._index()
})
</script>

<template>
<div>
  <Filter/>
  <Table @openEv="(v)=>emits('openOffice',v)"/>
  <UIDrawer
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="store.visibleType? $t('medInspection.createTitle') : $t('medInspection.updateTitle')"
  >
    <template #content>
      <createForm/>
    </template>
  </UIDrawer>
</div>
</template>