<script setup>
import {UIEditorViewer} from "@/components/index.js"

const props = defineProps({
  number:{
    type: Number,
    required: true
  },
  question:{
    type: String,
    required: true
  },
  answers:{
    type: Array,
    required: true
  },
  selectedAnswer:{
    type: [Number, null],
    required: true
  }
})
</script>

<template>
  <div class="border px-8 pt-4 pb-2 bg-surface-section rounded-lg overflow-hidden border-primary/20 shadow-primary/5 drop-shadow-xs flex flex-col gap-3"
  >

    <UIEditorViewer :html="`${number}. `+ question"></UIEditorViewer>
    <template
        v-for="(option, idx) in answers"
        :key="idx"
    >
      <div
          :class="[option.id===selectedAnswer && 'bg-danger/20']"
          class="flex gap-2 p-2 items-center border rounded-md border-primary/10"
      >
        <div class="relative w-4! h-4!">
          <div
              class="radio"
              :class="{'radio-error': option.id===selectedAnswer}"
          />
        </div>
        <UIEditorViewer
            :html="option.text"
        />
      </div>
    </template>
    <div>
      <n-button
          :type="selectedAnswer===null? 'warning' : 'error'"
          text
      >{{selectedAnswer===null ? $t('examPage.notChosen') : $t('examPage.wrongAnswer')}}</n-button>
    </div>
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