<script setup >
import {UIEditorViewer, UIMenuButton} from "@/components/index.js";
import {useExamAttemptStore} from "@/store/modules";

const store = useExamAttemptStore()
defineProps({
  question: {
    type: Object,
    required: true
  }
})
</script>
<template>
  <div class="border bg-surface-section rounded-lg overflow-hidden border-secondary p-2 shadow-blue-50 drop-shadow-sm"
  >
    <UIEditorViewer :html="question.question"></UIEditorViewer>
    <n-divider/>
    <template
        v-for="(option, idx) in question.answers"
        :key="idx"
    >
      <div class="flex gap-2 p-2">
        <n-radio :checked="option.id===question.result"  />
        <UIEditorViewer
            :html="option.text"
        />
      </div>
    </template>
  </div>

</template>