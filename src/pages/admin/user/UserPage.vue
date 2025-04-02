<script setup>
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js"
import {useUserStore} from "@/store/modules/index.js";
import Table from "./ui/Table.vue"
import createForm from "./ui/createForm.vue"
const store = useUserStore()


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
  :show-filter-button="false"
  :show-add-button="false"
  />
  <Table/>
  <UIDrawer
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="store.visibleType? $t('userPage.createTitle') : $t('userPage.updateTitle')"
  >
    <template #content>
      <createForm/>
    </template>
  </UIDrawer>
</UIPageContent>
</template>