<script setup>
import {useExamAttemptStore, useTopicExamResultStore} from "@/store/modules/index.js";

import {UIModal, UIPageContent, UIPageFilter} from "@/components/index.js";
import Table from './ui/Table.vue'
import ViewAttemptModal from "./ui/ViewResultModal.vue";

const store = useTopicExamResultStore()
const examStore = useExamAttemptStore()

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
  <UIModal v-model:visible="examStore.visible" :width="1000" :title="$t('examPage.attemptErrors')">
    <ViewAttemptModal />
  </UIModal>
</UIPageContent>
</template>