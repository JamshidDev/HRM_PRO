<script setup>
import {UIPageContent, UIPageFilter, UIModal, UIOnlyOfficeDrawer, UIPdfSignatureDrawer} from "@/components/index.js"
import Tabs from "./ui/Tabs.vue"
import contractForm from "./confirmation/contractForm.vue"
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
  store._index()
})

</script>

<template>
<UIPageContent>
  <UIPageFilter
   @onAdd="onAdd"/>
  <Tabs/>
  <UIModal
      :title="$t('documentPage.createTitle')"
      :width="1200"
      v-model:visible="store.visible"
  >
    <contractForm/>
  </UIModal>
</UIPageContent>
</template>