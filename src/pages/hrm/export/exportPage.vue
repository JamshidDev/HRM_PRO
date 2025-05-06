<script setup>
import {UIPageContent, UIPageFilter} from "@/components/index.js";
import Table from "./ui/Table.vue"
import {useExportStore} from "@/store/modules/index.js";
import i18n from "@/i18n/index.js"
import {ArrowSync16Regular} from '@vicons/fluent'


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
<!--        :search-loading="store.loading"-->
<!--        v-model:search="store.params.search"-->
<!--        @on-search="onSearch"-->
    <UIPageFilter
        :show-search-input="false"
        :show-filter-button="false"
        :show-add-button="false"
    >
      <template #filterAction>
        <n-button type="primary" @click="store._tasks()" :loading="store.loading">
          {{$t('content.refresh')}}
          <template #icon>
            <ArrowSync16Regular />
          </template>
        </n-button>
      </template>
    </UIPageFilter>
    <Table/>
  </UIPageContent>

</template>

<style scoped>

</style>