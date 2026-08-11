<script setup>
  import TopicCardList from './ui/TopicCardList.vue'
  import TopicDetail from './ui/TopicDetail.vue'
  import {
    useAccountStore,
    useExamAttemptStore,
    useWorkerExamStore
  } from '@/store/modules/index.js'
  import { UIModal, UIPageFilter } from '@/components/index.js'
  import ViewAttemptModal from './solveExam/ViewAttemptModal.vue'
  import Tabs from './solveExam/ui/Tabs.vue'
  import VideoTab from './solveExam/ui/VideoTab.vue'
  import { Dismiss24Regular } from '@vicons/fluent'

  const store = useWorkerExamStore()
  const examStore = useExamAttemptStore()
  const accStore = useAccountStore()

  const onSearch = (v) => {
    if (!accStore.checkAction(accStore.pn.examExamsRead)) return
    store.params.page = 1
    store._index()
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.examExamsRead)) return
    examStore._config_localstorage()
    store.params.page = 1
    store.params.search = null
    store._index()
    store.selectedLesson = null
  })
</script>

<template>
  <div class="mx-2 mt-4 mb-4 rounded flex flex-col gap-3" style="height: calc(100vh - 100px)">
    <div
      class="xl:flex grid grid-cols-12 flex-1 min-h-0"
      :style="{ gap: store?.selectedLesson ? '12px' : 0 }"
    >
      <div
        :class="[store?.selectedLesson ? 'xl:w-[50%] col-span-12' : 'xl:w-[100%] col-span-12']"
        class="transition-all duration-400 flex flex-col min-h-0"
      >
        <UIPageFilter
          v-model:search="store.params.search"
          @on-search="onSearch"
          :search-loading="store.loading"
          :show-add-button="false"
        />
        <div class="flex-1 min-h-0 rounded-md mt-2">
          <TopicCardList />
        </div>
      </div>
      <div
        :class="[store?.selectedLesson ? 'xl:w-[50%] col-span-12' : 'w-0!']"
        class="transition-all duration-400 bg-surface-section rounded-md overflow-hidden xl:mb-0 mb-10"
      >
        <TopicDetail />
      </div>
    </div>
    <UIModal
      v-model:visible="examStore.visible"
      :width="1000"
      card-class="!rounded-3xl !max-w-[calc(100vw-2rem)]"
    >
      <template #header>
        <div
          class="flex items-center justify-between gap-3 -mx-2 -mt-2 px-4 sm:px-6 py-4 border-b border-surface-line"
        >
          <div class="min-w-0">
            <p class="text-lg sm:text-xl font-bold text-textColor0 truncate">
              {{ $t('examPage.attemptAnalysis') }}
            </p>
            <p class="text-xs sm:text-sm text-textColor1 truncate mt-0.5">
              {{ examStore.viewMeta.examName }} ·
              {{ $t('examPage.attemptOrdinal', { n: examStore.viewMeta.attemptNumber }) }} ·
              {{ examStore.viewMeta.attemptDate }}
            </p>
          </div>
          <div
            @click="examStore.visible = false"
            class="w-9 h-9 rounded-full bg-surface-ground hover:bg-surface-line flex items-center justify-center cursor-pointer shrink-0 transition-colors"
          >
            <n-icon size="18" class="text-textColor1">
              <Dismiss24Regular />
            </n-icon>
          </div>
        </div>
      </template>
      <Tabs>
        <template #questin-content>
          <ViewAttemptModal />
        </template>
        <template #video-content>
          <VideoTab />
        </template>
      </Tabs>
    </UIModal>
  </div>
</template>
