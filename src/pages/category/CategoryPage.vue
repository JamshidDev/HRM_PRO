<script setup>
import FilterApp from "@/components/FilterApp/FilterApp.vue";
import {UIDrawer} from "@/components/index.js";
import {useCategoriesStore} from "@/store/modules/categoriesStore.js";
import createForm from "./ui/createForm.vue"
import Table from "./ui/Table.vue"

const store = useCategoriesStore()


onMounted(()=>{
  store._index()
})
</script>

<template>
  <div class="mx-4 my-2 bg-surface-section rounded p-4 border border-surface-line">
    <FilterApp
        @on-add="store.openVisible(true)"
    />
    <UIDrawer
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="store.visibleType? $t('categoryPage.form.create') : $t('categoryPage.form.update')"

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