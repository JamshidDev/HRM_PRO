<script setup>
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js"
import {useDepartmentPositionStore, useComponentStore} from "@/store/modules/index.js"
import createFrom from "./ui/createForm.vue"
import Table from "./ui/Table.vue"

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
  <UIPageFilter
      v-model:search="store.params.search"
      @on-add="onAdd"
      @on-search="onSearch"
  />
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