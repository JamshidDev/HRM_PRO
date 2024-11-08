<script setup>
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js"
import TabPage from "./ui/TabPage.vue"
import createForm from "./ui/createForm.vue"
import {useDepartmentStore, useComponentStore} from "@/store/modules/index.js"

const store = useDepartmentStore()
const componentStore = useComponentStore()

const onAdd = ()=>{
  store.resetForm()
  store._level()
  componentStore._departments()
  store.parentElement = null
  store.visibleType = true
  store.visible = true
}

const onSearch = ()=>{
  store.params.page =1
  store._index()
}

onMounted(()=>{
  store._index()
})
</script>

<template>
<UIPageContent>
  <UIPageFilter
      @onSearch="onSearch"
      v-model:search="store.params.search"
      @on-add="onAdd"
      :show-filter-button="false"
  />
 <TabPage/>
  <UIDrawer
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="store.visibleType? $t('departmentPage.createTitle') : $t('departmentPage.updateTitle')"

  >
    <template #content>
      <createForm/>
    </template>
  </UIDrawer>
</UIPageContent>
</template>
