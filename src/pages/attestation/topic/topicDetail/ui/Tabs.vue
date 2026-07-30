<script setup>
  import FilePanel from './FilePanel.vue'
  import TopicExamsTable from './ExamsTable.vue'
  import { useTopicFileStore, useTopicStore } from '@/store/modules/index.js'
  import { UITabs } from '@/components/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const fileStore = useTopicFileStore()
  const topicStore = useTopicStore()

  const examTabNumber = 0

  const tabs = computed(() => [
    { name: examTabNumber, label: t('examPage.name') },
    ...fileStore.list.map((item) => ({ name: item.id, label: item.name }))
  ])
</script>

<template>
  <div class="h-full py-3 flex flex-col">
    <div class="shrink-0 mb-4">
      <UITabs v-model="topicStore.mediaTab" :tabs="tabs" />
    </div>

    <n-tabs
      :value="topicStore.mediaTab"
      class="grow basis-auto overflow-hidden"
      animated
      :tab-style="{ display: 'none', margin: 0 }"
      :pane-wrapper-style="{ height: '100%' }"
    >
      <n-tab-pane class="h-full pt-0!" :name="examTabNumber">
        <div class="grow basis-auto overflow-hidden h-full">
          <TopicExamsTable />
        </div>
      </n-tab-pane>
      <n-tab-pane
        v-for="item in fileStore.list"
        :key="item.id"
        :name="item.id"
        class="h-full pt-0!"
      >
        <FilePanel :object="item" />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>
