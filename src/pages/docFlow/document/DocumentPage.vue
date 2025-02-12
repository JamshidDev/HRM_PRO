<script setup>
import {UIPageContent, UIPageFilter} from "@/components/index.js"
import Tabs from "./ui/Tabs.vue"
import {useContractStore, useComponentStore, useCommandStore, useDocumentStore, useAdContractStore} from "@/store/modules/index.js"
const contractStore = useContractStore()
const componentStore = useComponentStore()
const commandStore = useCommandStore()
const adContractStore = useAdContractStore()
const store = useDocumentStore()


const onAdd = ()=>{
  if(store.activeTab === store.tabList[0].key){
    addContract()
  }else if(store.activeTab === store.tabList[1].key){
    addCommand()
  }
  else if(store.activeTab === store.tabList[2].key){
    addAdContract()
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
  componentStore.isSelectedWorker=false
  componentStore.selectedWorker=null
  contractStore.resetForm()
  contractStore.visible = true
}

const addAdContract = ()=>{
  adContractStore.visibleType = true
  adContractStore.elementId = true
  adContractStore.resetForm()
  adContractStore.visible = true
}
</script>

<template>
<UIPageContent>
  <UIPageFilter
      :show-filter-button="false"
      @onAdd="onAdd"/>
  <Tabs/>
</UIPageContent>
</template>