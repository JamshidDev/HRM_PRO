<script setup>
  import {
    useAccountStore,
    useExamAttemptStore,
    useTopicExamResultStore
  } from '@/store/modules/index.js'

  import { UIModal, UIPageContent, UIPageFilter } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import Filter from './ui/Filter.vue'
  import ViewAttemptModal from './ui/ViewResultModal.vue'
  import Tabs from '@/pages/attestation/workerTopic/solveExam/ui/Tabs.vue'
  import VideoTab from '@/pages/attestation/workerTopic/solveExam/ui/VideoTab.vue'

  const store = useTopicExamResultStore()
  const examStore = useExamAttemptStore()
  const accStore = useAccountStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.examResultsRead)) return
    store._index()
  })
</script>
<template>
  <UIPageContent>
    <Filter />
    <Table />
    <UIModal
      v-model:visible="examStore.visible"
      :width="1000"
      :height="'90vh'"
      :title="$t('examPage.attemptErrors')"
    >
      <Tabs>
        <template #questin-content>
          <ViewAttemptModal />
        </template>
        <template #video-content>
          <VideoTab />
        </template>
      </Tabs>
    </UIModal>
  </UIPageContent>
</template>
