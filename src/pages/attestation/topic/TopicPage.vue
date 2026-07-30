<script setup>
  import { onMounted, computed } from 'vue'
  import { UIModal, UIPageContent, UIPageFilter } from '@/components/index.js'
  import { ArrowLeft24Regular, Add12Regular } from '@vicons/fluent'
  import Table from './ui/Table.vue'
  import createFrom from './ui/createForm.vue'
  import TopicDetail from './topicDetail/TopicDetailPage.vue'
  import {
    useTopicStore,
    useTopicFileStore,
    useTopicExamStore,
    useAccountStore
  } from '@/store/modules/index.js'
  import { TopicUtils } from '@/pages/attestation/Utils/index.js'

  const examTabNumber = 0

  const store = useTopicStore()
  const fileStore = useTopicFileStore()
  const examStore = useTopicExamStore()
  const accStore = useAccountStore()

  const currentTopic = computed(() => store.list.find((t) => t.id === store.elementId))

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.examTopicsWrite)) return
    store.resetForm()
    store.visibleType = true
    store.visible = true
  }

  const onAddFile = () => {
    if (!accStore.checkAction(accStore.pn.examTopicsRead)) return
    fileStore.topicId = store.elementId
    fileStore.accept = TopicUtils.getMediaProperty(store.mediaTab).accept
    fileStore.resetForm()
    fileStore.visibleType = true
    fileStore.visible = true
  }

  const onAddExam = () => {
    if (!accStore.checkAction(accStore.pn.examTopicsWrite)) return
    examStore.topicId = store.elementId
    examStore.resetForm()
    examStore.visibleType = true
    examStore.visible = true
  }

  const onDetailAddClick = () => {
    if (store.mediaTab === examTabNumber) {
      onAddExam()
    } else {
      onAddFile()
    }
  }

  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.examTopicsRead)) return
    store.params.page = 1
    store._index()
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.examTopicsRead)) return
    store._index()
  })
</script>

<template>
  <n-tabs
    :value="store.activeTab"
    :tab-style="{ display: 'none', margin: 0 }"
    :pane-style="{ padding: 0, height: '100%' }"
    class="h-full"
    animated
  >
    <n-tab-pane name="list" style="height: 100%">
      <UIPageContent>
        <UIPageFilter
          v-model:search="store.params.search"
          :show-filter-button="false"
          @on-add="onAdd"
          @on-search="onSearch"
          :search-loading="store.loading"
        />
        <Table />
        <UIModal
          v-model:visible="store.visible"
          :title="store.visibleType ? $t('topicPage.createTitle') : $t('topicPage.updateTitle')"
          :width="620"
        >
          <createFrom />
        </UIModal>
      </UIPageContent>
    </n-tab-pane>

    <n-tab-pane name="detail" style="height: 100%">
      <div class="my-4 px-8 flex flex-col">
        <div class="shrink-0 pb-4 flex flex-col items-start gap-3">
          <n-button
            size="medium"
            class="bg-surface-ground-soft! border-surface-line! text-textColor2! rounded-lg!"
            @click="store.activeTab = 'list'"
          >
            <template #icon>
              <n-icon :component="ArrowLeft24Regular" />
            </template>
            {{ $t('content.back') }}
          </n-button>
          <div class="w-full flex items-center justify-between gap-4 min-w-0">
            <div class="flex items-center gap-3 min-w-0">
              <p class="text-lg sm:text-xl md:text-2xl font-semibold text-textColor0 truncate">
                {{ currentTopic?.name }}
              </p>

              <n-tag
                v-if="currentTopic?.type"
                size="small"
                round
                type="info"
                :bordered="false"
                class="topic-type-tag"
              >
                {{ currentTopic.type.name }}
              </n-tag>
            </div>

            <n-button size="medium" type="primary" @click="onDetailAddClick">
              <template #icon>
                <n-icon :component="Add12Regular" />
              </template>
              {{ $t('content.add') }}
            </n-button>
          </div>
        </div>
        <div class="grow min-h-0">
          <TopicDetail />
        </div>
      </div>
    </n-tab-pane>
  </n-tabs>
</template>

<style scoped>
  .topic-type-tag {
    background: #d1e9ff;
    color: #3b82f6;
    font-size: small;
    font-weight: bold;
    padding: 8px;
    border-radius: 10px;
  }
</style>
