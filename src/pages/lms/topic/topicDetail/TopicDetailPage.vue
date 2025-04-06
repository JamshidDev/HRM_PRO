<script setup>
import {useTopicExamStore, useTopicFileStore, useTopicStore} from "@/store/modules/index.js"
import {PanelLeftExpand16Filled} from "@vicons/fluent"
import {AppPaths} from "@/utils/index.js";
import { NButton, NIcon} from "naive-ui";
import i18n from "@/i18n/index.js";
import {NoDataPicture} from "@/components/index.js";
import {useRoute, useRouter} from "vue-router";
import Tabs from './ui/Tabs.vue'
import {UIDrawer} from "@/components/index.js"
import FileForm from './ui/FileForm.vue'
import ExamForm from './ui/ExamForm.vue'
import AttachQuestionForm from './ui/ExamAttachQuestionForm.vue'

const route = useRoute()
const router = useRouter()
const store = useTopicStore()
const fileStore = useTopicFileStore()
const examStore = useTopicExamStore()
const t = i18n.global.t

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
    <div class="h-full flex flex-col">
      <div class="flex justify-between border-b border-surface-line py-3 px-4 items-center">
        <p class="text-2xl font-bold">{{lesson?.name}}</p>
        <n-button @click="router.push({name: AppPaths.Topic.substring(1)})" type="error" tertiary>
          {{ $t('content.close') }}
          <template #icon>
            <n-icon :component="PanelLeftExpand16Filled"/>
          </template>
        </n-button>
      </div>
      <div class="flex-grow basis-auto overflow-hidden">

        <Tabs />
      </div>
    </div>
<!--    <div v-else>-->
<!--      <div class="flex justify-end">-->
<!--        <n-button @click="router.push({name: AppPaths.Topic.substring(1)})" type="error" tertiary>-->
<!--          {{ $t('content.close') }}-->
<!--          <template #icon>-->
<!--            <n-icon :component="PanelLeftExpand16Filled"/>-->
<!--          </template>-->
<!--        </n-button>-->
<!--      </div>-->
<!--      <NoDataPicture  />-->
<!--    </div>-->
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
        :width="700"
        :title="$t('topicDetailsPage.exams.attachQuestion')"
        :visible="examStore.attachCategoryVisible"
        @update:visible="(v)=>examStore.attachCategoryVisible = v"
    >
      <template #content>
        <AttachQuestionForm/>
      </template>
    </UIDrawer>
  </n-spin>

</template>
