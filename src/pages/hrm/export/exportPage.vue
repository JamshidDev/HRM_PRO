<script setup>
import {UIPageContent, UIPageFilter} from "@/components/index.js";
import Table from "./ui/Table.vue"
import {useExportStore} from "@/store/modules/index.js";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
const store = useExportStore();

const onSearch = (v)=>{
  store.params.page = 1
  store._tasks()
}

// const onAdd = ()=>{
//
//   store.visibleType = true
//   store.visible = true
// }



onMounted(()=>{
  store._tasks()
})
</script>

<template>
  <UIPageContent>
<!--    <UIPageFilter-->
<!--        v-model:search="store.params.search"-->
<!--        @on-search="onSearch"-->
<!--        :search-loading="store.loading"-->
<!--        :show-filter-button="false"-->
<!--        :show-add-button="false"-->
<!--    />-->
    <Table/>
  </UIPageContent>

</template>

<style scoped>

</style>