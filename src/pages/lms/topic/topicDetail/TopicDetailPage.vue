<script setup>
import {useCategoryStore, useTopicExamStore, useTopicFileStore, useTopicStore} from "@/store/modules/index.js"
import TopicFilePage from "./topicFile/TopicFilePage.vue";
import TopicExamPage from "./topicExam/TopicExamPage.vue";
import {PanelLeftContract20Filled, DismissCircle48Regular, HatGraduation12Filled, FolderOpen20Filled, PanelLeftExpand16Filled} from "@vicons/fluent"
import {AppPaths} from "@/utils/index.js";
import { NButton, NIcon} from "naive-ui";
import Utils from "@/utils/Utils.js";
import i18n from "@/i18n/index.js";
import {NoDataPicture} from "@/components/index.js";
import {useRoute, useRouter} from "vue-router";
import Cards from './ui/Cards.vue'
import {UIDrawer} from "@/components/index.js"
import FileForm from './ui/FileForm.vue'
import ExamForm from './ui/ExamForm.vue'
import ExamAttachQuestionForm from './ui/ExamAttachQuestionForm.vue'
import AttachQuestionForm from "@/pages/lms/topic/topicDetail/topicExam/ui/AttachQuestionForm.vue";

const route = useRoute()
const router = useRouter()
const store = useTopicStore()
const fileStore = useTopicFileStore()
const examStore = useTopicExamStore()
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
      icon: () => h(NIcon, {component: option.icon}), // Filling the #icon slot
      default: () => t(option.name)
    })
  ]
}
const activeTab = ref(1)
onMounted(()=>{
  store.elementId = route.params?.id
  fileStore.topicId = route.params?.id
  fileStore._index()
  examStore.topicId = route.params?.id
  examStore._index()
})
const lesson = computed(()=>{
  return store.elementId ? store.list.find(i=>i.id==store.elementId) : undefined
})
</script>

<template>
  <n-spin :show="examStore.loading || fileStore.loading" class="h-full bg-surface-section rounded-md">
    <div v-if="lesson || examStore.loading || fileStore.loading" class="h-full flex flex-col">
      <div class="flex justify-between border-b border-surface-line py-3 px-4 items-center">
        <p class="text-2xl font-bold">{{lesson?.name}}</p>
        <n-button @click="router.push({name: AppPaths.Topic.substring(1)})" type="error" tertiary>
          {{ $t('content.close') }}
          <template #icon>
            <n-icon :component="PanelLeftExpand16Filled"/>
          </template>
        </n-button>
      </div>
<!--      <n-select class="!w-[150px]" :options="tabs" v-model:value="activeTab" :render-label="renderLabel"-->
<!--                value-field="id" label-field="id" :placeholder="$t(`content.choose`)"/>-->

<!--      <n-tabs class="h-full" :value="activeTab" animated size="small" :tab-style="{ display: 'none', margin: 0 }">-->
<!--        <n-tab-pane v-for="(item) in tabs" :name="item.id" class="h-full !pt-0">-->
<!--          <component :is="item.component"/>-->
<!--        </n-tab-pane>-->
<!--      </n-tabs>-->
      <div class="flex-grow basis-auto">

        <Cards />
      </div>
    </div>
    <div v-else>
      <div class="flex justify-end">
        <n-button @click="router.push({name: AppPaths.Topic.substring(1)})" type="error" tertiary>
          {{ $t('content.close') }}
          <template #icon>
            <n-icon :component="PanelLeftExpand16Filled"/>
          </template>
        </n-button>
      </div>
      <NoDataPicture  />
    </div>
    <UIDrawer
        :visible="fileStore.visible"
        @update:visible="(v)=>fileStore.visible = v"
        :title="fileStore.visibleType ?  $t('topicFiles.addFile') : $t('topicFiles.editFile')"
    >
      <template #content>
        <FileForm />
      </template>
    </UIDrawer>
    <UIDrawer
        :title="examStore.visibleType ?  $t('topicDetailsPage.exams.createTitle') : $t('topicDetailsPage.exams.updateTitle')"
        :visible="examStore.visible"
        @update:visible="(v)=>examStore.visible = v"
    >
      <template #content>
        <ExamForm/>
      </template>
    </UIDrawer>
    <UIDrawer
        :title="$t('topicDetailsPage.exams.attachQuestion')"
        :visible="examStore.attachQuestionVisible"
        @update:visible="(v)=>examStore.attachQuestionVisible = v"
    >
      <template #content>
        <AttachQuestionForm/>
      </template>
    </UIDrawer>
  </n-spin>

</template>
