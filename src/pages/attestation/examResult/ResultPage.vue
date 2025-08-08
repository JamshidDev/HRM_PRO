<script setup>
import {useAccountStore, useExamAttemptStore, useTopicExamResultStore} from "@/store/modules/index.js";

import {UIModal, UIPageContent, UIPageFilter} from "@/components/index.js";
import Table from './ui/Table.vue'
import Filter from "./ui/Filter.vue"
import ViewAttemptModal from "./ui/ViewResultModal.vue";

const store = useTopicExamResultStore()
const examStore = useExamAttemptStore()
const accStore = useAccountStore()

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.examResultsRead)) return
  store._index()
})


</script>
<template>
<UIPageContent>
  <Filter/>
  <Table />
  <UIModal v-model:visible="examStore.visible" :width="1000" :title="$t('examPage.attemptErrors')">
    <ViewAttemptModal />
  </UIModal>
</UIPageContent>
</template>