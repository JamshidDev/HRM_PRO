<script setup>
import {useComponentStore, useMedStore} from "@/store/modules/index.js"
import Table from "./ui/Table.vue"
import createForm from "./ui/createForm.vue"
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js"

const store = useMedStore()
const componentStore = useComponentStore()


const onAdd = ()=>{
  store.resetForm()
  componentStore.selectedWorker = null
  store.elementId = null
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
        @onAdd="onAdd"
        :show-filter-button="false"
        v-model:search="store.params.search"
        @on-search="onSearch"
        :search-loading="store.loading"
    />
    <Table/>
    <UIDrawer
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="store.visibleType? $t('medPage.createTitle') : $t('medPage.updateTitle')"
    >
      <template #content>
        <createForm/>
      </template>
    </UIDrawer>
  </UIPageContent>
</template>

<style scoped>

</style>