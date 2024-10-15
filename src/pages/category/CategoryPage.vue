<script setup>
import FilterApp from "@/components/FilterApp/FilterApp.vue";
import {UIDrawer} from "@/components/index.js";
import {useCategoriesStore} from "@/store/modules/categoriesStore.js";
import createForm from "./ui/createForm.vue"

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
        :title="`Kategoriya qo'shish`"

    >
      <template #content>
        <createForm/>
      </template>
    </UIDrawer>

  </div>

</template>

<style scoped>

</style>