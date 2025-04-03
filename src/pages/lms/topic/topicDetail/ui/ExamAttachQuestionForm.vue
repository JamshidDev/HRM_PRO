<script setup>
import {UIStructure} from "@/components/index.js"
import validationRules from "@/utils/validationRules.js";
import { useComponentStore, useTopicExamStore } from "@/store/modules/index.js";
import {useRoute} from "vue-router";

const formRef = ref(null)
const store = useTopicExamStore()
const componentStore = useComponentStore()
const route = useRoute()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store.saveLoading = true
      if(store.attachQuestionVisibleType){
        store._attach_question()
      }else{
        store._update()
      }
    }
  })
}

onMounted(()=>{
  store.topicId = route.params.id
  componentStore._examCategory()
})

const toggleQuestionCategory = (v)=>{
  const newVal = v.map((i)=>{
    const old = store.questionPayload.questions.find(j=>j.exam.id === i.id)
    if(old){
      return old
    }else{
      return {
        exam: i,
        count: 0
      }
    }
  })
  store.questionPayload.questions = newVal
}

const count = computed(()=>store.questionPayload.questions.reduce((a,b)=>{
  return a+b.count
}, 0))
</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.questionPayload"
  >
    <div style="min-height:calc(100vh - 120px)">
      <n-form-item
          :label="$t(`topicDetailsPage.exams.categories`)"
          path="question_ids"
          rule-path="requiredMultiSelectField"
      >
        <n-select
            v-model:value="store.questionPayload.question_ids"
            filterable
            :placeholder="$t(`content.choose`)"
            :options="componentStore.examCategoryList"
            label-field="name"
            value-field="id"
            @update:value="(_, v)=>toggleQuestionCategory(v)"
            multiple
            max-tag-count="responsive"
            :loading="componentStore.examCategoryLoading"
        />
      </n-form-item>
      <n-form-item
          :label="$t(`topicDetailsPage.exams.questionCount`, {n: count})"
          path="questions"
          rule-path="requiredMultiSelectField"
          v-if="store.questionPayload.questions.length"
      >

        <div class="w-full p-2 border rounded-lg border-surface-line">
          <template
              v-for="(item, idx) in store.questionPayload.questions"
              :key="idx"
          >
            <n-form-item
                :path="`questions.${idx}.count`"
                class="w-full"
                :show-label="false"
                :rule="{
                  trigger: ['input', 'blur', 'change'],
                  validator() {
                    return item.count===0 ? new Error( $t('rules.enterOverNumber', {n: 0})) : true
                  },
                }"
            >
              <div class="flex items-center justify-between w-full border border-surface-line rounded-md p-1">
                <span>{{item.exam.name}}</span>
                <n-input-number
                    v-model:value="item.count"
                    :max="item.exam.questions_count"
                    :placeholder="$t('content.enterField')"
                    :min="0"
                    class="flex-shrink-0 max-w-[120px]" />
              </div>
            </n-form-item>
          </template>
        </div>
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

<style scoped>

</style>