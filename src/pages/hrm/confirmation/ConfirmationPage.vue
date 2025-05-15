<script setup>
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js"
import {useConfirmationStore, useComponentStore, useAccountStore} from "@/store/modules/index.js"
import Table from "./ui/Table.vue"
import createFrom from "./ui/createForm.vue"

const store = useConfirmationStore()
const compStore = useComponentStore()
const accStore = useAccountStore()


const onAdd = ()=>{
  if(!accStore.checkAction(accStore.pn.hrConfirmationsWrite)) return
  compStore.selectedWorker = null
  store.resetForm()
  store.elementId = null
  store.visibleType = true
  store.visible = true
}

const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.hrConfirmationsRead)) return
  store.params.page = 1
  store._index()
}

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.hrConfirmationsRead)) return
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
      :search-loading="store.loading"
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