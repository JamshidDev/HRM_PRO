<script setup>
import {useTopicCategoryStore} from "@/store/modules/index.js"
import {UIPageContent} from "@/components/index.js"
import TopicCategoryPage from "@/pages/lms/topicCategory/TopicCategoryPage.vue"
import TopicFilePage from "@/pages/lms/topicFile/TopicFilePage.vue";
import ExamPage from "@/pages/lms/exam/ExamPage.vue";
import TopicQuestionPage from "@/pages/lms/topicQuestion/TopicQuestionPage.vue";


const store = useTopicCategoryStore()

const tabs = [{
  name: 'topicDetailsPage.categories.name',
  id: 1,
  component: TopicCategoryPage
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
  },
  {
    name: 'topicDetailsPage.exams.name',
    id: 4,
    component: ExamPage
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
