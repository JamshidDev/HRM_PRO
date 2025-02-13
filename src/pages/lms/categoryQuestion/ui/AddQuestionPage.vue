<script setup>

import {useCategoryQuestionStore} from "@/store/modules/lms/topicQuestionStore.js";
import {UIEditor, UIPageContent} from "@/components/index.js";
import {Save20Filled, DismissCircle20Filled, ClipboardTaskListRtl20Filled} from "@vicons/fluent";
import OptionEditor  from './OptionEditor.vue'
import validationRules from "@/utils/validationRules.js";

const store = useCategoryQuestionStore()
const formRef = ref(null)

const submission = ()=>{
  formRef.value?.validate((error) => {
    if (!error) {
      console.log(store.payload)
    }
  })
}

</script>
<template>
  <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.payload"
      class="mx-2 mt-4 mb-4 rounded p-4 border border-surface-line"
  >
    <n-space justify="end">
      <n-button
          icon-placement="right"
          type="error"
      >
        {{$t('content.cancel')}}
        <template #icon>
          <DismissCircle20Filled />
        </template>
      </n-button>
      <n-button
          icon-placement="right"
          type="primary"
          @click="submission"
      >
        {{$t('content.save')}}
        <template #icon>
          <Save20Filled />
        </template>
      </n-button>
      <n-button
          icon-placement="right"
          type="success"
      >
        {{$t('next')}}
        <template #icon>
          <ClipboardTaskListRtl20Filled />
        </template>
      </n-button>
    </n-space>
    <n-form-item label="Question" path="ques.isValid" :rule="{

    }">
      <UIEditor class="my-3" v-model:text="store.payload.ques.text" v-model:is-valid="store.payload.ques.isValid" show-toolbar/>
    </n-form-item>
  </n-form>
</template>