<script setup>
import {useTopicExamResultStore} from "@/store/modules/index.js";




import {UIPageContent, UIPageFilter} from "@/components/index.js";
import Table from './ui/Table.vue'

const search = ref()
const store = useTopicExamResultStore()

onMounted(()=>{
  store.params = {
    page: 1,
    per_page: 10,
    search: null
  }
  store._index()
})

const onSearch = (v)=>{
  store.params.page = 1
  store._index()
}

</script>
<template>
<UIPageContent>
  <UIPageFilter
      @on-search="onSearch"
      :show-add-button="false"
      v-model:search="store.params.search"
  />
  <Table />
</UIPageContent>
</template>