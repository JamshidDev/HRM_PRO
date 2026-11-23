<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useTopicExamStore, useTopicStore } from '@/store/modules/index.js'
  import { UIModal } from '@/components/index.js'
  import { AddCircle24Regular, ArrowLeft24Regular } from '@vicons/fluent'
  import ExamsTable from './ui/ExamsTable.vue'
  import ExamForm from './ui/ExamForm.vue'
  import AudienceCard from './ui/AudienceCard.vue'
  import { useAccountStore } from '@/store/modules/index.js'

  const accStore = useAccountStore()

  const store = useTopicStore()
  const examStore = useTopicExamStore()

  // Saqlash/Bekor qilish tugmalari modal footer'ida turadi, formalar esa faqat
  // validatsiyani biladi va `submit()` ni tashqariga ochadi.
  const examFormRef = ref(null)

  const currentTopic = computed(() => store.list.find((t) => t.id === store.elementId))

  const onAddExam = () => {
    if (!accStore.checkAction(accStore.pn.examTopicsWrite)) return
    examStore.topicId = store.elementId
    examStore.resetForm()
    examStore.visibleType = true
    examStore.visible = true
  }

  const onAdd = onAddExam

  // Ro'yxatga qaytishda tillar soni va holat yangilanadi.
  const onBack = () => {
    store.activeTab = 'list'
    store._index()
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.examTopicsRead)) return
    examStore.topicId = store.elementId
    examStore._index()
  })
</script>

<template>
  <div class="grow min-h-0 flex flex-col gap-3">
    <div class="shrink-0 flex flex-col gap-3">
      <div>
        <n-button size="small" class="rounded-lg!" @click="onBack">
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
      <AudienceCard :topic="currentTopic" />
    </div>

    <div class="grow basis-auto overflow-hidden min-h-0">
      <ExamsTable />
    </div>
  </div>
  <UIModal
    v-model:visible="examStore.visible"
    :title="
      examStore.visibleType
        ? $t('topicDetailsPage.exams.createTitle')
        : $t('topicDetailsPage.exams.updateTitle')
    "
    width="min(760px, calc(100vw - 32px))"
    height="min(85vh, 720px)"
  >
    <ExamForm ref="examFormRef" />
    <template #footer>
      <div class="flex justify-end gap-2 px-4 pb-2">
        <n-button type="error" ghost class="w-[130px]" @click="examStore.openVisible(false)">
          {{ $t('content.cancel') }}
        </n-button>
        <n-button
          type="primary"
          class="w-[130px]"
          :loading="examStore.saveLoading"
          @click="examFormRef?.submit()"
        >
          {{ $t('content.save') }}
        </n-button>
      </div>
    </template>
  </UIModal>
</template>
