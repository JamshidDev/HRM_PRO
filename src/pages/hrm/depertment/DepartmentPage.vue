<script setup>
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js"
import TabPage from "./ui/TabPage.vue"
import createForm from "./ui/createForm.vue"
import {useDepartmentStore, useComponentStore} from "@/store/modules/index.js"
import Filter from "./ui/Filter.vue"

const store = useDepartmentStore()
const componentStore = useComponentStore()

const onAdd = ()=>{
  store.resetForm()
  store._level()
  componentStore._departments()
  store.activeDeep = 1

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
  <Filter/>

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
