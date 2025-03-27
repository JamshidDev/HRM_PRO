<script setup>
import {useCategoryStore} from "@/store/modules/index.js"
import TopicFilePage from "./topicFile/TopicFilePage.vue";
import TopicExamPage from "./topicExam/TopicExamPage.vue";
import {PanelLeftContract20Filled, DismissCircle48Regular} from "@vicons/fluent"
import {AppPaths} from "@/utils/index.js";

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
    <div class="border-l border-surface-line pl-2 h-full">
      <div>
        <n-tabs  v-model:value="activeTab" animated type="card" size="small" >
          <template #suffix>
            <n-button @click="$router.push({name: AppPaths.Topic.substring(1)})" type="error" secondary >
              {{$t('content.close')}}

              <template #icon>
                <n-icon :component="DismissCircle48Regular" />
              </template>
            </n-button>
          </template>
          <n-tab-pane  v-for="(item) in tabs" :name="item.id" :tab="$t(item.name)">
            <component :is="item.component"/>
          </n-tab-pane>
        </n-tabs>
      </div>
    </div>

</template>
