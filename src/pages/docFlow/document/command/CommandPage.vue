<script setup>
import {useCommandStore} from "@/store/modules/index.js"
import {UIOfficeApp, UIPageContent, UIPageFilter} from "@/components/index.js"
import Table from "./Table.vue"
import CommandForm from "./CommandForm.vue"
import {UIModal} from "@/components/index.js"
import Utils from "@/utils/Utils.js"
import Filter from "./ui/Filter.vue"

const officeAppRef = ref(null)
const store = useCommandStore()
const emits = defineEmits([ 'openOffice',])

const onSearch = (value)=>{
  store.params.page = 1
  store._index()
}

const onAdd = ()=>{
  store.visibleType = true
  store.resetForm()
  store.visible = true
}

const openCommand = (id)=>{
  officeAppRef.value.openPdf(id, Utils.documentModels.command)
}

onMounted(()=>{
  store._index()
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
</UIPageContent>
</template>
