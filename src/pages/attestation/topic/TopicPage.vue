<script setup>
  import { onMounted, computed } from 'vue'
  import { UIDrawer, UIPageContent, UIPageFilter } from '@/components/index.js'
  import { ArrowLeft24Regular } from '@vicons/fluent'
  import Table from './ui/Table.vue'
  import createFrom from './ui/createForm.vue'
  import TopicDetail from './topicDetail/TopicDetailPage.vue'
  import { useTopicStore, useAccountStore } from '@/store/modules/index.js'

  const store = useTopicStore()
  const accStore = useAccountStore()

  const currentTopic = computed(() => store.list.find((t) => t.id === store.elementId))

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.examTopicsWrite)) return
    store.resetForm()
    store.visibleType = true
    store.visible = true
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
        <UIDrawer
          :title="store.visibleType ? $t('topicPage.createTitle') : $t('topicPage.updateTitle')"
          :visible="store.visible"
          :width="600"
          @update:visible="(v) => (store.visible = v)"
        >
          <template #content>
            <createFrom />
          </template>
        </UIDrawer>
      </UIPageContent>
    </n-tab-pane>
    <n-tab-pane name="detail" style="height: 100%">
      <div class="my-4 mx-1 md:mx-2 rounded-sm md:p-4 p-1 h-[calc(100%-32px)] flex flex-col bg-surface-section">
        <div class="shrink-0 pb-3 flex items-center gap-3 border-b border-surface-line mb-3">
          <n-button text @click="store.activeTab = 'list'">
            <template #icon>
              <n-icon :component="ArrowLeft24Regular" />
            </template>
            {{ $t('content.back') }}
          </n-button>
          <n-divider vertical />
          <div class="flex items-center gap-2 min-w-0">
            <p class="text-[15px] font-semibold text-textColor0 truncate">{{ currentTopic?.name }}</p>
            <n-tag v-if="currentTopic?.type" size="small" round type="info">
              {{ currentTopic.type.name }}
            </n-tag>
          </div>
        </div>
        <div class="grow min-h-0">
          <TopicDetail />
        </div>
      </div>
    </n-tab-pane>
  </n-tabs>
</template>
