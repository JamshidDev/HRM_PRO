<script setup>
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js"
import Tabs from "./ui/Tabs.vue"
import createForm from "./ui/createForm.vue"
import {useDocumentStore, useContractStore, useComponentStore} from "@/store/modules/index.js"
const store = useDocumentStore()
const contractStore = useContractStore()
const componentStore = useComponentStore()


const onAdd = ()=>{
  store.visible = true
  store.visibleType = true
}

onMounted(()=>{
  if(store.activeTab ===1){
    contractStore._index()
    componentStore._enums()
    componentStore._docExample()
    componentStore._departments()
    componentStore._positions()
    componentStore._confirmations()
  }
})

</script>

<template>
<UIPageContent>
  <UIPageFilter
  @onAdd="onAdd"
  />
  <Tabs/>
  <UIDrawer
      :width="800"
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="store.visibleType? $t('documentPage.createTitle') : $t('documentPage.updateTitle')"
  >
    <template #content>
      <createForm/>
    </template>
  </UIDrawer>
</UIPageContent>
</template>