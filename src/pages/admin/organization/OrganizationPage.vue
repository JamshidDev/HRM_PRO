<script setup>
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js"
import createForm from "./ui/createForm.vue"
import Table from "./ui/Table.vue"
import {useOrganizationStore, useComponentStore, useAccountStore} from "@/store/modules/index.js"

const store = useOrganizationStore()
const componentStore = useComponentStore()
const accStore = useAccountStore()

const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.organizationsRead)) return
  store.params.page =1
  store._index()
}

const onAdd = ()=>{
  if(!accStore.checkAction(accStore.pn.organizationsWrite)) return
  componentStore._organizationLevel()
  componentStore._organizations()
  store.resetForm()
  store.parentElement = null
  store.visibleType = true
  store.visible = true
}

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.organizationsRead)) return
  store._index()
})
</script>

<template>
<UIPageContent>
  <UIPageFilter
      :show-filter-button="false"
      v-model:search="store.params.search"
      @on-search="onSearch"
      @on-add="onAdd"
      class="mb-6"
  />
  <Table/>
  <UIDrawer
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="store.visibleType? $t('organizationPage.createTitle') : $t('organizationPage.updateTitle')"
  >
    <template #content>
      <createForm/>
    </template>
  </UIDrawer>
</UIPageContent>
</template>
