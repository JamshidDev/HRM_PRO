<script setup>
import FilterApp from "@/components/FilterApp/FilterApp.vue";
import {UIDrawer} from "@/components/index.js";
import {useCategoriesStore} from "@/store/modules/categoriesStore.js";
import createForm from "./ui/createForm.vue"
import Table from "./ui/Table.vue"
import i18n from "../../i18n/index.js"
const {t} = i18n.global
const store = useCategoriesStore()

const openForm = ()=>{
  store.resetPayload()
  store.visibleType = true
  store.openVisible(true)
}

onMounted(()=>{
  store._index()
  store._getAll()
})
</script>

<template>
  <div class="mx-4 my-2 bg-surface-section rounded p-4 border border-surface-line">
    <FilterApp
        v-model:search="store.params.search"
        @on-add="openForm"
        @on-search="store._index()"
        :search-loading="store.loading"
    />
    <UIDrawer
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="store.visibleType? t('categoryPage.form.create') : t('categoryPage.form.update')"

    >
      <template #content>
        <createForm/>
      </template>
    </UIDrawer>
    <Table/>
  </div>

</template>

<style scoped>

</style>