<script setup>
import {useCategoryStore} from "@/store/modules/index.js"
import {UIPageContent} from "@/components/index.js"
import TopicFilePage from "@/pages/lms/topicFile/TopicFilePage.vue";
import TopicExamPage from "@/pages/lms/topicExam/TopicExamPage.vue";


const store = useCategoryStore()

const tabs = [{
    name: 'topicDetailsPage.files.name',
    id: 1,
    component: TopicFilePage
  },
  {
    name: 'topicDetailsPage.exams.name',
    id: 2,
    component: TopicExamPage
  }]

const activeTab = ref(1)
</script>

<template>
  <UIPageContent>
    <n-tabs v-model:value="activeTab" animated type="line">
      <n-tab-pane v-for="(item) in tabs" :name="item.id" :tab="$t(item.name)">
        <component :is="item.component"/>
      </n-tab-pane>
    </n-tabs>
  </UIPageContent>
</template>
