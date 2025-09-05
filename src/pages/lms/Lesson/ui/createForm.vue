<script setup>
import validationRules from "@/utils/validationRules.js";
import {useLmsLessonStore, useComponentStore} from "@/store/modules/index.js";
import {useAppSetting} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"

const formRef = ref(null)
const store = useLmsLessonStore()
const componentStore = useComponentStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store.saveLoading = true
      const data = {
        ...store.payload,
        lesson_date:Utils.timeToZone(store.payload.lesson_date)
      }
      store._create(data)
    }
  })
}


const onChangeLearningCenter = ()=>{
  if(store.payload.learning_center_id){
    store._eduPlans()
    store._teacher()
  }
}

const onChangeEduPlan = ()=>{
  store.payload.group_id = null
  if(store.payload.edu_plan_id){
    store._groups()
  }
}

const onChangeTeacher = ()=>{
  store.payload.subject_id = null
  if(store.payload.teacher_id){
    store.subjectList = store.teacherList.filter(v=>v.id === Number(store.payload.teacher_id))?.[0].subjects.map(x=>({...x, position:' '}))
  }
}

watchEffect(()=>{
  store.payload.teacher_id = store.payload.learning_center_id? store.payload.teacher_id : null
  store.payload.edu_plan_id =  store.payload.learning_center_id? store.payload.edu_plan_id : null
  store.payload.group_id =  store.payload.edu_plan_id? store.payload.group_id : null
  store.payload.subject_id =  store.payload.teacher_id? store.payload.subject_id : null

})



onMounted(()=>{
  if(componentStore.lmsLearningCenters.length === 0){
    componentStore._lmsLearningCenter()
  }
})

</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.payload"
  >
    <div class="grid grid-cols-12 gap-x-4">


      <n-form-item class="col-span-6" :label="$t(`content.name`)" path="name" rule-path="requiredStringField">
        <n-input
            type="text"
            v-model:value="store.payload.name"
        />
      </n-form-item>
      <n-form-item class="col-span-6" :label="$t(`content.nameRu`)" path="name_ru" rule-path="requiredStringField">
        <n-input
            class="skip-format"
            type="text"
            v-model:value="store.payload.name_ru"
        />
      </n-form-item>
      <n-form-item class="col-span-6" :label="$t(`content.nameEn`)" path="name_en" rule-path="requiredStringField">
        <n-input
            type="text"
            v-model:value="store.payload.name_en"
        />
      </n-form-item>
      <n-form-item class="col-span-6" :label="$t(`eduPlanPage.form.learning_center`)" path="learning_center_id" rule-path="requiredNumberField">
        <n-select
            v-model:value="store.payload.learning_center_id"
            :options="componentStore.lmsLearningCenters"
            :loading="componentStore.lmsLearningCenterLoading"
            label-field="name"
            value-field="id"
            filterable
            clearable
            @update:value="onChangeLearningCenter"
        />
      </n-form-item>
      <n-form-item class="col-span-6" :label="$t(`lessonPage.form.edu_plan_id`)" path="edu_plan_id" rule-path="requiredNumberField">
        <n-select
            :disabled="!store.payload.learning_center_id"
            v-model:value="store.payload.edu_plan_id"
            :options="store.eduPlans"
            :loading="store.eduPlanLoading"
            label-field="name"
            value-field="id"
            filterable
            clearable
            @update:value="onChangeEduPlan"
        />
      </n-form-item>
      <n-form-item class="col-span-6" :label="$t(`lessonPage.form.group_id`)" path="group_id" rule-path="requiredNumberField">
        <n-select
            :disabled="!store.payload.edu_plan_id"
            v-model:value="store.payload.group_id"
            :options="store.groupList"
            :loading="store.groupLoading"
            label-field="name"
            value-field="id"
            filterable
            clearable
        />
      </n-form-item>
      <n-form-item class="col-span-6" :label="$t(`lessonPage.form.teacher_id`)" path="teacher_id" rule-path="requiredNumberField">
        <n-select
            :disabled="!store.payload.learning_center_id"
            v-model:value="store.payload.teacher_id"
            :options="store.teacherList"
            :loading="store.teacherLoading"
            label-field="name"
            value-field="id"
            filterable
            clearable
            @update:value="onChangeTeacher"
        />
      </n-form-item>
      <n-form-item class="col-span-6" :label="$t(`lessonPage.form.subject_id`)" path="subject_id" rule-path="requiredNumberField">
        <n-select
            :disabled="!store.payload.teacher_id"
            v-model:value="store.payload.subject_id"
            :options="store.subjectList"
            label-field="name"
            value-field="id"
            filterable
            clearable
        />
      </n-form-item>
      <n-form-item class="col-span-6" :label="$t(`lessonPage.form.lesson_date`)" path="lesson_date" rule-path="requiredNumberField">
        <n-date-picker
            class="w-full"
            v-model:value="store.payload.lesson_date"
            type="date"
            :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
      <n-form-item class="col-span-3" :label="$t(`lessonPage.form.start_time`)" path="start_time" rule-path="requiredStringField">
        <n-input
            v-mask="'##:##'"
            type="text"
            v-model:value="store.payload.start_time"
        />
      </n-form-item>
      <n-form-item class="col-span-3" :label="$t(`lessonPage.form.end_time`)" path="end_time" rule-path="requiredStringField">
        <n-input
            v-mask="'##:##'"
            type="text"
            v-model:value="store.payload.end_time"
        />
      </n-form-item>



    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.openVisible(false)" type="error" ghost>
        {{$t('content.cancel')}}
      </n-button>
      <n-button
          @click="onSubmit"
          :loading="store.saveLoading"
          type="primary">
        {{$t('content.save')}}
      </n-button>
    </div>
  </n-form>
</template>
