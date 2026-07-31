<script setup>
  import { onMounted } from 'vue'
  import { useTopicExamStore, useTopicFileStore, useTopicStore } from '@/store/modules/index.js'
  import { UIDrawer } from '@/components/index.js'
  import Tabs from './ui/Tabs.vue'
  import FileForm from './ui/FileForm.vue'
  import ExamForm from './ui/ExamForm.vue'
  import AttachQuestionForm from './ui/ExamAttachQuestionForm.vue'
  import { useAccountStore } from '@/store/modules/index.js'

  const accStore = useAccountStore()

  const store = useTopicStore()
  const fileStore = useTopicFileStore()
  const examStore = useTopicExamStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.examTopicsRead)) return
    fileStore.topicId = store.elementId
    fileStore._index()
    examStore.topicId = store.elementId
    examStore._index()
  })
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="grow basis-auto overflow-hidden min-h-0">
      <Tabs />
    </div>
  </div>
  <UIDrawer
    :visible="fileStore.visible"
    @update:visible="(v) => (fileStore.visible = v)"
    :title="fileStore.visibleType ? $t('topicFiles.addFile') : $t('topicFiles.editFile')"
  >
    <template #content>
      <FileForm />
    </template>
  </UIDrawer>
  <UIDrawer
    :title="
      examStore.visibleType
        ? $t('topicDetailsPage.exams.createTitle')
        : $t('topicDetailsPage.exams.updateTitle')
    "
    :visible="examStore.visible"
    @update:visible="(v) => (examStore.visible = v)"
  >
    <template #content>
      <ExamForm />
    </template>
  </UIDrawer>
  <UIDrawer
    :width="700"
    :title="$t('topicDetailsPage.exams.attachQuestion')"
    :visible="examStore.attachCategoryVisible"
    @update:visible="(v) => (examStore.attachCategoryVisible = v)"
  >
    <template #content>
      <AttachQuestionForm />
    </template>
  </UIDrawer>
</template>
