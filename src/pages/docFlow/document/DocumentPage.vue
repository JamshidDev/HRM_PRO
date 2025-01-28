<script setup>
import {UIPageContent, UIPageFilter, UIModal} from "@/components/index.js"
import Tabs from "./ui/Tabs.vue"
import {useContractStore, useComponentStore, useCommandStore, useDocumentStore} from "@/store/modules/index.js"
const contractStore = useContractStore()
const componentStore = useComponentStore()
const commandStore = useCommandStore()
const store = useDocumentStore()


const onAdd = ()=>{
  if(store.activeTab === store.tabList[0].key){
    addContract()
  }else if(store.activeTab === store.tabList[1].key){
    addCommand()
  }
}

const addCommand = ()=>{
  commandStore.visibleType = true
  commandStore.elementId = null
  commandStore.resetForm()
  commandStore.visible = true
}

const addContract = ()=>{
  contractStore.visibleType = true
  componentStore.contractPanel=false
  componentStore.selectedWorker=null
  contractStore.resetForm()
  contractStore.visible = true
}

onMounted(()=>{
  contractStore._index()
})

</script>

<template>
<UIPageContent>
  <UIPageFilter
      :show-filter-button="false"
      @onAdd="onAdd"/>
  <Tabs/>
</UIPageContent>
</template>