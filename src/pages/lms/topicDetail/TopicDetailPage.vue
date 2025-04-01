<script setup>
import {useCategoryStore} from "@/store/modules/index.js"
import TopicFilePage from "./topicFile/TopicFilePage.vue";
import TopicExamPage from "./topicExam/TopicExamPage.vue";
import {PanelLeftContract20Filled, DismissCircle48Regular, HatGraduation12Filled, FolderOpen20Filled, PanelLeftExpand16Filled} from "@vicons/fluent"
import {AppPaths} from "@/utils/index.js";
import { NButton, NIcon} from "naive-ui";
import Utils from "@/utils/Utils.js";
import i18n from "@/i18n/index.js";

const store = useCategoryStore()
const t = i18n.global.t
const tabs = [{
  name: 'topicDetailsPage.files.name',
  id: 1,
  component: TopicFilePage,
  icon: FolderOpen20Filled
},
  {
    name: 'topicDetailsPage.exams.name',
    id: 2,
    component: TopicExamPage,
    icon: HatGraduation12Filled
  }]

const renderLabel = (option) => {
  return [
    h(NButton, {
      type: "primary",
      text: true
    }, {
      icon: () => h(NIcon, { component: option.icon }), // Filling the #icon slot
      default: () => t(option.name)
    })
  ]
}
const activeTab = ref(1)

</script>

<template>
    <div class="border-l border-surface-line pl-2 h-full">
      <div class="h-full">
        <div class="flex justify-between">
          <n-select class="!w-[150px]" :options="tabs" v-model:value="activeTab" :render-label="renderLabel" value-field="id" label-field="id" :placeholder="$t(`content.choose`)" />
          <n-button @click="$router.push({name: AppPaths.Topic.substring(1)})" type="error" tertiary >
            {{$t('content.close')}}
            <template #icon>
              <n-icon :component="PanelLeftExpand16Filled" />
            </template>
          </n-button>
        </div>
        <n-tabs class="h-full" :value="activeTab" animated size="small" :tab-style="{ display: 'none' }"  >

          <n-tab-pane  v-for="(item) in tabs" :name="item.id"  class="h-full !pt-0">
            <component :is="item.component"/>
          </n-tab-pane>
        </n-tabs>
      </div>
    </div>

</template>
