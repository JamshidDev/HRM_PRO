<script setup>
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js"
import Tabs from "./ui/Tabs.vue"
import createForm from "./ui/createForm.vue"
import {useDocSettingStore, useComponentStore} from "@/store/modules/index.js"
const store = useDocSettingStore()
const compStore = useComponentStore()

const onAdd = ()=>{
  store.resetForm()
  store.elementId = null
  store.visible = true
  store.visibleType = true
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
      :width="700"
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="store.visibleType? $t('documentSetting.createTitle') : $t('documentSetting.updateTitle')"

  >
    <template #content>
      <createForm/>
    </template>
  </UIDrawer>
</UIPageContent>
</template>