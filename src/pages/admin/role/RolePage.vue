<script setup>
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js";
import Table from "./ui/Table.vue"
import {useUserRoleStore} from "@/store/modules/index.js";
import createFrom from "./ui/createForm.vue"
import i18n from "@/i18n/index.js"
const {t} = i18n.global
const store = useUserRoleStore();

const onSearch = (v)=>{
  store.params.search = v
  store.params.page = 1
  store._index()
}

const onAdd = ()=>{
  store.resetForm()
  store.visibleType = true
  store.visible = true
}



onMounted(()=>{
  store._index()
  store._getAllPermission()
})
</script>

<template>
  <UIPageContent>
    <UIPageFilter
        @on-search="onSearch"
        :search-loading="store.loading"
        @on-add="onAdd"
        :show-filter-button="false"
    />
    <Table/>
    <UIDrawer
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="store.visibleType? t('userRole.createTitle') : t('userRole.updateTitle')"

    >
      <template #content>
        <createFrom/>
      </template>
    </UIDrawer>
  </UIPageContent>

</template>

<style scoped>

</style>