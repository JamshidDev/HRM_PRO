<script setup>
import {UIPageContent, UIPageFilter, UIDrawer} from "@/components/index.js"
import Table from "./ui/Table.vue"
import createFrom from "./ui/createFrom.vue"
import {useWorkdayStore} from "@/store/modules/index.js"

const store = useWorkdayStore()

const onAdd = ()=>{
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

const onSearch = (v)=>{
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
      @on-search="onSearch"
      :search-loading="store.loading"
      @on-add="onAdd"
      :show-filter-button="false"
  />
  <Table/>
  <UIDrawer
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="store.visibleType? $t('schedulePage.createTitle') : $t('schedulePage.updateTitle')"
  >
    <template #content>
      <createFrom/>
    </template>
  </UIDrawer>
</UIPageContent>
</template>

<style scoped>

</style>