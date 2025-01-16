<script setup>
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js"
import Tabs from "./ui/Tabs.vue"
import ContractForm  from "./contractTemplate/ui/createForm.vue"
import CommandForm from "./commandTemplate/ui/createForm.vue"
import {useDocSettingStore, useComponentStore, useCommandTempStore} from "@/store/modules/index.js"
const store = useDocSettingStore()
const compStore = useComponentStore()
const commandStore = useCommandTempStore()

const onAdd = ()=>{

  if(store.activeTab === 1){
    addContract()
  }else if(store.activeTab === 2){
    addCommand()
  }
}

const addContract = ()=>{
  store.resetForm()
  store.elementId = null
  store.visible = true
  store.visibleType = true
}

const addCommand = ()=>{
  commandStore.resetForm()
  commandStore.elementId = null
  commandStore.visible = true
  commandStore.visibleType = true
}

const onSearch = ()=>{
  store.params.page = 1
  store._index()
}

onMounted(()=>{
  compStore._enumsAdmin()
  store._index()
})


</script>

<template>
<UIPageContent>
  <UIPageFilter
      @onAdd="onAdd"
      @onSearch="onSearch"
      :show-filter-button="false"
      :search-loading="store.loading"
      v-model:search="store.params.search"

  />
  <Tabs/>


  <UIDrawer
      :width="500"
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="store.visibleType? $t('documentSetting.createTitle') : $t('documentSetting.updateTitle')"
  >
    <template #content>
      <ContractForm/>
    </template>
  </UIDrawer>

  <UIDrawer
      :width="500"
      :visible="commandStore.visible"
      @update:visible="(v)=>commandStore.visible = v"
      :title="commandStore.visibleType? $t('documentSetting.command.createTitle') : $t('documentSetting.command.updateTitle')"
  >
    <template #content>
      <CommandForm/>
    </template>
  </UIDrawer>
</UIPageContent>
</template>