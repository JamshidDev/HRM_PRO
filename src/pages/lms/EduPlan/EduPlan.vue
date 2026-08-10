<script setup>
  import { UIModal, UIPageContent } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import Filter from './ui/Filter.vue'
  import workerList from './ui/workerList.vue'
  import LessonExamForm from '@/pages/lms/Lesson/ui/LessonExamForm.vue'
  import { useAccountStore, useEduPlanStore } from '@/store/modules/index.js'
  import createFrom from './ui/createForm.vue'
  import groupForm from '../Group/ui/createForm.vue'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const createFormRef = ref(null)
  const store = useEduPlanStore()
  const accStore = useAccountStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.lmsEduPlanRead)) return

    if (!store.params.year) {
      store.params.year = new Date().getFullYear()
      store.params.month = new Date().getMonth() + 1
    }
    store._index()
  })

  const onCallback = () => {
    store.examVisible = false
    store._index()
  }
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <UIModal
      v-model:visible="store.visible"
      :title="store.visibleType ? t('eduPlanPage.createTitle') : t('eduPlanPage.updateTitle')"
      width="min(900px, calc(100vw - 32px))"
      height="min(85vh, 640px)"
    >
      <createFrom ref="createFormRef" />

      <template #footer>
        <div class="flex justify-end gap-2 px-4 pb-2">
          <n-button type="error" ghost class="w-[130px]" @click="store.openVisible(false)">
            {{ t('content.cancel') }}
          </n-button>
          <n-button
            type="primary"
            class="w-[130px]"
            :loading="store.saveLoading"
            @click="createFormRef?.submit()"
          >
            {{ t('content.save') }}
          </n-button>
        </div>
      </template>
    </UIModal>
    <UIModal
      :visible="store.groupVisible"
      @update:visible="(v) => (store.groupVisible = v)"
      :title="$t('eduPlanPage.attachmentGroup')"
    >
      <template #default>
        <groupForm />
      </template>
    </UIModal>
    <UIModal
      :width="1200"
      :visible="store.workerVisible"
      @update:visible="(v) => (store.workerVisible = v)"
      :title="$t('eduPlanPage.workers')"
    >
      <template #default>
        <workerList />
      </template>
    </UIModal>
    <UIModal
      :width="600"
      :visible="store.examVisible"
      @update:visible="(v) => (store.examVisible = v)"
      :title="$t('eduPlanPage.attachmentExam')"
    >
      <template #default>
        <LessonExamForm :edu-plan-id="store.elementId" @onCallback="onCallback" />
      </template>
    </UIModal>
  </UIPageContent>
</template>
