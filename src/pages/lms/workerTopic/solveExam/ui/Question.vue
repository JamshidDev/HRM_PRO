<script setup>
import {UIEditorViewer} from "@/components/index.js";
import {useExamAttemptStore} from "@/store/modules";

const store = useExamAttemptStore()
defineProps({
  question: {
    type: Object,
    required: true
  }
})

const sendResult = (question_id, option_id) => {
  if(!store.result){
    store.questionId = question_id
    store.payload.result = option_id
    store._send_result()
  }
}

</script>
<template>
  <div class="border bg-surface-section rounded-lg overflow-hidden border-surface-line p-2 shadow-blue-50 drop-shadow-xs"
  >
    <UIEditorViewer :html="question.question"></UIEditorViewer>
    <n-divider/>
    <template
        v-for="(option, idx) in question.answers"
        :key="idx"
    >
      <div class="flex gap-2 p-2">
        <div class="relative w-4!">
          <n-spin
              v-if="store.sendResultLoading && store.questionId === question.id && store.payload.result===option.id"
              :size="12"
          />
          <n-radio
              v-else
              :checked="option.id===question.result"
              @click="sendResult(question.id, option.id)"
              :disabled="store.sendResultLoading && store.questionId === question.id"
          />
        </div>
        <UIEditorViewer
            :html="option.text"
        />
      </div>
    </template>
    <div
        v-if="!store.result"
        class="transition-all h-0 overflow-hidden"
        :class="{'h-6': !!question.result}"
    >
      <n-button
          :loading="store.sendResultLoading && store.questionId === question.id && store.payload.result===null"
          @click="sendResult(question.id, null)"
          type="primary"
          text
      >{{$t('solveExamPage.removeAnswer')}}</n-button>
    </div>
  </div>

</template>