<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useTopicExamStore, useTopicFileStore, useTopicStore } from '@/store/modules/index.js'
  import { UIDrawer } from '@/components/index.js'
  import { TopicUtils } from '@/pages/attestation/Utils/index.js'
  import { AddCircle24Regular, ArrowLeft24Regular } from '@vicons/fluent'
  import Tabs from './ui/Tabs.vue'
  import FileForm from './ui/FileForm.vue'
  import ExamForm from './ui/ExamForm.vue'
  import AttachQuestionForm from './ui/ExamAttachQuestionForm.vue'
  import { useAccountStore } from '@/store/modules/index.js'

  const accStore = useAccountStore()

  const store = useTopicStore()
  const fileStore = useTopicFileStore()
  const examStore = useTopicExamStore()

  const activeTab = ref(TopicUtils.EXAM)

  const currentTopic = computed(() => store.list.find((t) => t.id === store.elementId))

  const onAddExam = () => {
    if (!accStore.checkAction(accStore.pn.examTopicsWrite)) return
    examStore.topicId = store.elementId
    examStore.resetForm()
    examStore.visibleType = true
    examStore.visible = true
  }

  const onAddFile = () => {
    if (!accStore.checkAction(accStore.pn.examTopicsRead)) return
    fileStore.topicId = store.elementId
    fileStore.accept = TopicUtils.getMediaProperty(activeTab.value).accept
    fileStore.resetForm()
    fileStore.visibleType = true
    fileStore.visible = true
  }

  // Sarlavhadagi bitta "Qo'shish" tugmasi ochiq tab'ga qarab imtihon yoki fayl formasini ochadi.
  const onAdd = () => (activeTab.value === TopicUtils.EXAM ? onAddExam() : onAddFile())

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.examTopicsRead)) return
    fileStore.topicId = store.elementId
    fileStore._index()
    examStore.topicId = store.elementId
    examStore._index()
  })
</script>

<template>
  <div class="grow min-h-0 flex flex-col gap-3">
    <div class="shrink-0 flex flex-col gap-3">
      <div>
        <n-button size="small" class="rounded-lg!" @click="store.activeTab = 'list'">
          <template #icon>
            <n-icon :component="ArrowLeft24Regular" />
          </template>
          {{ $t('content.back') }}
        </n-button>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2 min-w-0">
          <p class="text-lg font-semibold text-textColor0 truncate">{{ currentTopic?.name }}</p>
          <n-tag v-if="currentTopic?.type" size="small" round type="info">
            {{ currentTopic.type.name }}
          </n-tag>
        </div>
        <n-button type="primary" class="rounded-lg!" icon-placement="left" @click="onAdd">
          <template #icon>
            <n-icon :component="AddCircle24Regular" />
          </template>
          {{ $t('content.add') }}
        </n-button>
      </div>
    </div>

    <div class="grow basis-auto overflow-hidden min-h-0">
      <Tabs v-model:active-tab="activeTab" />
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
