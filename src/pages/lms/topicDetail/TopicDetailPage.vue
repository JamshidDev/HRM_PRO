<script setup>
import {useTopicCategoryStore} from "@/store/modules/index.js"
import {UIPageContent} from "@/components/index.js"
import TopicCategoryPage from "@/pages/lms/topicCategory/TopicCategoryPage.vue"
const store = useTopicCategoryStore()
</script>

<template>
  <UIPageContent>
    <n-tabs animated v-model:value="store.activeTab"  type="segment">
      <n-tab-pane v-for="(item) in store.tabList"  :name="item.id" :tab="$t(item.name)">
        <template v-if="store.tabList[0].id === store.activeTab">
          <TopicCategoryPage/>
        </template>
      </n-tab-pane>
   </n-tabs>
  </UIPageContent>
</template>
