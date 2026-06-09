<script setup>
  import { ref } from 'vue'
  import FilePanel from './FilePanel.vue'
  import TopicExamsTable from './ExamsTable.vue'
  import { Add12Regular } from '@vicons/fluent'
  import { useTopicExamStore, useTopicFileStore, useTopicStore } from '@/store/modules/index.js'
  import { TopicUtils } from '@/pages/attestation/Utils/index.js'
  import { useAccountStore } from '@/store/modules/index.js'
  const accStore = useAccountStore()

  const fileStore = useTopicFileStore()
  const examStore = useTopicExamStore()
  const topicStore = useTopicStore()

  const examTabNumber = 0
  const activeTab = ref(examTabNumber)

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.examTopicsRead)) return
    fileStore.topicId = topicStore.elementId
    fileStore.accept = TopicUtils.getMediaProperty(activeTab.value).accept
    fileStore.resetForm()
    fileStore.visibleType = true
    fileStore.visible = true
  }

  const onAddExam = () => {
    if (!accStore.checkAction(accStore.pn.examTopicsWrite)) return
    examStore.topicId = topicStore.elementId
    examStore.resetForm()
    examStore.visibleType = true
    examStore.visible = true
  }
</script>
<template>
  <div class="h-full py-3 px-8 flex flex-col">
    <!-- Button group centered -->
    <div class="shrink-0 flex justify-center mb-4">
      <n-button-group>
        <n-button
          :type="activeTab === examTabNumber ? 'primary' : 'default'"
          :ghost="activeTab !== examTabNumber"
          @click="activeTab = examTabNumber"
          size="medium"
        >
          <template #icon>
            <n-icon
              :component="TopicUtils.getMediaProperty(examTabNumber).icon"
              :color="activeTab !== examTabNumber ? TopicUtils.getMediaProperty(examTabNumber).color : undefined"
            />
          </template>
          {{ $t('examPage.name') }}
          <n-badge
            :value="examStore.totalItems"
            :offset="[8, -4]"
            :color="activeTab === examTabNumber ? '#ffffff55' : TopicUtils.getMediaProperty(examTabNumber).color"
            :processing="false"
          />
        </n-button>
        <n-button
          v-for="item in fileStore.list"
          :key="item.id"
          :type="activeTab === item.id ? TopicUtils.getMediaProperty(item.id).type : 'default'"
          :ghost="activeTab !== item.id"
          @click="activeTab = item.id"
          size="medium"
        >
          <template #icon>
            <n-icon
              :component="TopicUtils.getMediaProperty(item.id).icon"
              :color="activeTab !== item.id ? TopicUtils.getMediaProperty(item.id).color : undefined"
            />
          </template>
          {{ item.name }}
          <n-badge
            :value="item.items?.length"
            :offset="[8, -4]"
            :color="activeTab === item.id ? '#ffffff55' : TopicUtils.getMediaProperty(item.id).color"
            :processing="false"
          />
        </n-button>
      </n-button-group>
    </div>

    <!-- Tab content -->
    <n-tabs
      :value="activeTab"
      class="grow basis-auto overflow-hidden"
      animated
      :tab-style="{ display: 'none', margin: 0 }"
      :pane-wrapper-style="{ height: '100%' }"
    >
      <n-tab-pane class="h-full pt-0!" :name="examTabNumber">
        <div class="flex flex-col h-full">
          <div class="flex shrink-0 justify-between items-center mb-2">
            <p class="text-[16px] font-bold">{{ $t('topicDetailsPage.exams.name') }}</p>
            <n-button size="small" type="primary" @click="onAddExam">
              <template #icon>
                <n-icon :component="Add12Regular" />
              </template>
              {{ $t('content.add') }}
            </n-button>
          </div>
          <div class="grow basis-auto overflow-hidden">
            <TopicExamsTable />
          </div>
        </div>
      </n-tab-pane>
      <n-tab-pane
        v-for="item in fileStore.list"
        :key="item.id"
        :name="item.id"
        class="h-full pt-0!"
      >
        <div class="flex justify-between items-center mb-2">
          <p class="text-[16px]">{{ item.name }}</p>
          <n-button
            size="small"
            :type="TopicUtils.getMediaProperty(item.id).type"
            @click="onAdd"
          >
            <template #icon>
              <n-icon :component="Add12Regular" />
            </template>
            {{ $t('content.add') }}
          </n-button>
        </div>
        <FilePanel :object="item" />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>
