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
      <div class="flex gap-2 p-2 items-center">
        <div class="relative w-4! h-4!">
          <div
              class="radio"
              :class="{'radio-error': option.id===question.result}"
          />
        </div>
        <UIEditorViewer
            :html="option.text"
        />
      </div>
    </template>
    <n-button
          type="error"
          text
      >{{question.result==null ? $t('examPage.notChosen') : $t('examPage.wrongAnswer')}}</n-button>
  </div>

</template>

<style scoped lang="scss">
.radio{
  position: absolute;
  top: 50%;
  right: 0;
  bottom: 0;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
  background-clip: content-box;
  border: 1px solid lightslategray;
  border-radius: 50%;
  padding: 4px;
}
.radio-error{
  background: red;
  background-clip: content-box;
  border: 1px solid red;
//  background: red;
//  border: 1px solid red;
}
</style>