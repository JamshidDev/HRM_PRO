<script setup>
import {HatGraduation12Filled} from "@vicons/fluent";

import ExamCard from './ExamCard.vue'

defineProps({
  lesson: {
    type: Object,
    required: true
  }
})


</script>
<template>
  <div class="flex flex-col gap-2 rounded-lg p-4 bg-surface-section shrink-0">
    <div class="flex items-center gap-3">
      <n-button size="large" text type="info">
        <template #icon>
          <n-icon :component="HatGraduation12Filled"/>
        </template>
        <span>{{ $t('examPage.topic') }}: {{ lesson.name }}</span>
      </n-button>
      <n-button dashed size="tiny" type="success">
        {{ lesson.type.name }}
      </n-button>
    </div>
    <n-collapse v-if="lesson.files.length">
      <n-collapse-item :title="$t('examPage.resources')">

        <div v-for="(file, idx) in lesson.files" :key="idx">
          <n-button
              text
              @click="downloadFile(file)">
            <template #icon>
              <n-icon :component="getMediaProperty(file.type.id).icon"></n-icon>
            </template>
            {{ file.file_name }}
          </n-button>
        </div>

      </n-collapse-item>
    </n-collapse>
    <n-collapse v-if="lesson.exams.length">
      <n-collapse-item :title="$t('examPage.exams')">
        <div class="flex flex-col gap-2">
          <ExamCard
              v-for="(exam, idx) in lesson.exams"
              :key="idx"
              :exam="exam"
          />
        </div>
      </n-collapse-item>
    </n-collapse>
  </div>
</template>
