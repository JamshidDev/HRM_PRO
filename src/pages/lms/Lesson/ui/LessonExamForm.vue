<script setup>
import validationRules from "@/utils/validationRules.js";
import {useLmsLessonStore, useComponentStore} from "@/store/modules/index.js";
import UIHelper from "@/utils/UIHelper.js"

const formRef = ref(null)
const store = useLmsLessonStore()
const componentStore = useComponentStore()

const props = defineProps({
  lessonId: {
    type: Number,
    default: null
  },
  eduPlanId: {
    type: Number,
    default: null
  },
})

const emit = defineEmits(['onCallback'])

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store._attachmentExam(()=>{
        emit('onCallback')
      })
    }
  })
}




onMounted(()=>{
  store.examPayload.exam_id = null
  store.examPayload.type = null
  componentStore._lmsEnum()
  store._exams()
  if(props.lessonId){
    store.examPayload.lesson_id = props.lessonId
    store.examPayload.edu_plan_id = undefined
  }else if(props.eduPlanId){
    store.examPayload.lesson_id = undefined
    store.examPayload.edu_plan_id = props.lesson_id
  }
})

</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.examPayload"
  >

    <div class="grid grid-cols-12 gap-x-4">
      <n-form-item :label="$t('content.type')" class="col-span-6" path="type" rule-path="requiredNumberField">
        <n-select
            v-model:value="store.examPayload.type"
            :options="componentStore.lmsEnumExamTypes"
            :loading="componentStore.lmsEnumLoading"
            label-field="name"
            value-field="id"
            filterable
        />
      </n-form-item>
      <n-form-item :label="$t('content.exam')" class="col-span-6" path="exam_id" rule-path="requiredNumberField">
        <n-select
            v-model:value="store.examPayload.exam_id"
            :options="store.examList"
            :loading="store.examLoading"
            label-field="name"
            value-field="id"
            :render-label="UIHelper.selectRender.label"
            :render-tag="UIHelper.selectRender.value"
            filterable
        />
      </n-form-item>
      <div class="col-span-12 mt-4">
        <n-button :loading="store.examLoading" class="w-full!" @click="onSubmit" type="primary">
          {{$t('content.attachment')}}
        </n-button>
      </div>

    </div>


  </n-form>
</template>
