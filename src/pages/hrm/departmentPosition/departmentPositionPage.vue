<script setup>
import {UIDrawer, UIPageContent} from "@/components/index.js"
import {useDepartmentPositionStore, useComponentStore} from "@/store/modules/index.js"
import createFrom from "./ui/createForm.vue"
import Table from "./ui/Table.vue"
import Filter from "./ui/Filter.vue"

const store = useDepartmentPositionStore()
const componentStore = useComponentStore()

const onAdd = ()=>{
  componentStore._enums()
  componentStore._departments()
  componentStore._positions()
  store.resetForm()
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
  <Filter/>
  <Table/>
  <UIDrawer
      :width="800"
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="store.visibleType? $t('departmentPositionPage.createTitle') : $t('departmentPositionPage.updateTitle')"

  >
    <template #content>
      <createFrom/>
    </template>
  </UIDrawer>
</UIPageContent>
</template>

<style scoped>

</style>