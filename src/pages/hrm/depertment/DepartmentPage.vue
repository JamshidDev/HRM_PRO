<script setup>
import {UIDrawer, UIPageContent} from "@/components/index.js"
import TabPage from "./ui/TabPage.vue"
import createForm from "./ui/createForm.vue"
import {useDepartmentStore, useAccountStore} from "@/store/modules/index.js"
import Filter from "./ui/Filter.vue"
const accStore = useAccountStore()


const store = useDepartmentStore()


onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.hrDepartmentsRead)) return
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
