<script setup>
import {UIDrawer, UIPageContent} from "@/components/index.js"
import TabPage from "./ui/TabPage.vue"
import createForm from "./ui/createForm.vue"
import {useDepartmentStore, useAccountStore} from "@/store/modules/index.js"
import Filter from "./ui/Filter.vue"
import Utils from "@/utils/Utils.js"

const store = useDepartmentStore()
const accountStore = useAccountStore()


onMounted(()=>{
  if(!accountStore.checkPermission(Utils.appPermissions.hrDepartmentsRead)) return
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
