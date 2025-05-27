<script setup>
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js"
import Table from "./ui/Table.vue"
import Form from "./ui/Form.vue"
import {useAccountStore, useCategoryStore} from "@/store/modules/index.js"

const store = useCategoryStore()
const accStore = useAccountStore()

const onAdd = ()=>{
  if(!accStore.checkAction(accStore.pn.examCategoriesWrite)) return
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.examCategoriesRead)) return

  store.params.page = 1
  store._index()
}

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.examCategoriesRead)) return
  store.params.page = 1
  store._index()
})
</script>

<template>
  <UIPageContent>
    <UIPageFilter
        :show-search-input="false"
        v-model:search="store.params.search"
        @onSearch="onSearch"
        @onAdd="onAdd"
    />
    <Table/>
<!--    That is a good category    -->
    <UIDrawer
        :width="300"
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="store.visibleType? $t('categoryPage.createCategory') : $t('categoryPage.editCategory')"
    >
      <template #content>
        <Form/>
      </template>
    </UIDrawer>
  </UIPageContent>
</template>
