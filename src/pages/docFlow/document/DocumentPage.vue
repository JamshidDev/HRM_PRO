<script setup>
import {UIPageContent, UIPageFilter, UIModal, UIOnlyOfficeDrawer} from "@/components/index.js"
import Tabs from "./ui/Tabs.vue"
import contractForm from "./ui/contractForm.vue"
import {useDocumentStore, useContractStore, useComponentStore} from "@/store/modules/index.js"
const store = useContractStore()
const componentStore = useComponentStore()
const documentStore = useDocumentStore()


const onAdd = ()=>{
  store.visible = true
  store.visibleType = true
  componentStore.contractPanel=false
  componentStore.selectedWorker=null
  store.resetForm()
}

onMounted(()=>{
  if(documentStore.activeTab ===1){
    store._index()
  }
})

</script>

<template>
<UIPageContent>
  <UIPageFilter
   @onAdd="onAdd"/>
  <Tabs/>
  <UIModal
      :title="$t('documentPage.createTitle')"
      :width="1000"
      v-model:visible="store.visible"
  >
    <contractForm/>
  </UIModal>
  <UIOnlyOfficeDrawer/>
</UIPageContent>
</template>