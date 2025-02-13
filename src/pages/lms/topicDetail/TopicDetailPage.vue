<script setup>
import {useCategoryStore} from "@/store/modules/index.js"
import {UIPageContent} from "@/components/index.js"
import TopicFilePage from "@/pages/lms/topicFile/TopicFilePage.vue";
import ExamPage from "@/pages/lms/exam/ExamPage.vue";
import TopicQuestionPage from "@/pages/lms/topicQuestion/TopicQuestionPage.vue";


const store = useCategoryStore()

const tabs = [{
  name: 'topicDetailsPage.categories.name',
  id: 1,
  component: ExamPage
},
  {
    name: 'topicDetailsPage.files.name',
    id: 2,
    component: TopicFilePage
  },
  {
    name: 'topicDetailsPage.questions.name',
    id: 3,
    component: TopicQuestionPage
  }]

const activeTab = ref(1)
</script>

<template>
  <UIPageContent>
    <n-tabs v-model:value="activeTab" animated type="segment">
      <n-tab-pane v-for="(item) in tabs" :name="item.id" :tab="$t(item.name)">
        <component :is="item.component"/>
      </n-tab-pane>
    </n-tabs>
  </UIPageContent>
</template>
