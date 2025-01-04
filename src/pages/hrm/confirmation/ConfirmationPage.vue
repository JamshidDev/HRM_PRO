<script setup>
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js"
import {useConfirmationStore, useComponentStore} from "@/store/modules/index.js"
const store = useConfirmationStore()
const compStore = useComponentStore()
import Table from "./ui/Table.vue"
import createFrom from "./ui/createForm.vue"


const onAdd = ()=>{

  compStore.selectedWorker = null
  store.resetForm()
  store.elementId = null
  store.visibleType = true
  store.visible = true
}

const onSearch = ()=>{
  store.params.page = 1
  store._index()
}

onMounted(()=>{
  store._index()
})
</script>




<template>
<UIPageContent>
  <UIPageFilter
      @onAdd="onAdd"
      :show-filter-button="false"
      v-model:search="store.params.search"
      @on-search="onSearch"
  />
  <Table/>
  <UIDrawer
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="store.visibleType? $t('confirmationPage.createTitle') : $t('confirmationPage.updateTitle')"
  >
    <template #content>
      <createFrom/>
    </template>
  </UIDrawer>
</UIPageContent>
</template>