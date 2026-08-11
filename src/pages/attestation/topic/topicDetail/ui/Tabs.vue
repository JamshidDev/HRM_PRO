<script setup>
  import FilePanel from './FilePanel.vue'
  import TopicExamsTable from './ExamsTable.vue'
  import { useTopicFileStore } from '@/store/modules/index.js'
  import { TopicUtils } from '@/pages/attestation/Utils/index.js'

  const fileStore = useTopicFileStore()

  // Fayl tab'lari backenddan keladi (`GET /v1/exam/topics/{id}/files` guruhlari),
  // shuning uchun ro'yxat qat'iy yozilmaydi.
  const activeTab = defineModel('activeTab', { type: Number, default: TopicUtils.EXAM })
</script>

<template>
  <n-tabs v-model:value="activeTab" type="line" animated class="topic-tabs ui-pill-tabs h-full">
    <n-tab-pane :name="TopicUtils.EXAM" :tab="$t('examPage.name')" class="h-full pt-0!">
      <TopicExamsTable />
    </n-tab-pane>
    <n-tab-pane
      v-for="group in fileStore.list"
      :key="group.id"
      :name="group.id"
      :tab="group.name"
      class="h-full pt-0!"
    >
      <FilePanel :object="group" />
    </n-tab-pane>
  </n-tabs>
</template>

<style scoped>
  /* Pane wrapper qolgan bo'sh joyni egallasin — shunda jadval to'liq cho'ziladi va
     uning pagination footeri karta tubida mahkam turadi. `pane-wrapper-style` prop'i
     bu yerda yaramaydi: `animated` rejimda naive-ui o'sha inline `height`/`max-height`ni
     animatsiya davomida o'zi boshqaradi. */
  .topic-tabs :deep(.n-tabs-pane-wrapper) {
    flex: 1 1 0;
    min-height: 0;
  }
</style>
