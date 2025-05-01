<script setup>
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
      if(store.visibleType){
        store._create()
      }else{
        store._update()
      }
    }
  })
}

onMounted(()=>{
  store.topicId = route.params.id
  componentStore._enumExam()
  componentStore._departmentPosition()
  componentStore._workers()
})


</script>

<template>
  <n-spin :show="store.showLoading">
    <n-form
        ref="formRef"
        :rules="validationRules.common"
        :model="store.payload"
    >
      <div style="min-height:calc(100vh - 120px)">
        <n-grid :cols="2" :x-gap="10">
<!--          <n-form-item-gi :span="2" >-->
<!--            <div class="border-surface-line border flex w-full items-center px-3 justify-between rounded-md h-[34px] ">-->
<!--              <p>{{$t('topicDetailsPage.exams.isActive')}}</p>-->
<!--              <n-switch v-model:value="store.payload.active"/>-->
<!--            </div>-->
<!--          </n-form-item-gi>-->

          <n-form-item-gi :span="2" :label="$t(`content.name`)" path="name" rule-path="requiredStringField">
            <n-input
                type="text"
                :placeholder="$t(`content.enterField`)"
                v-model:value="store.payload.name"
            />
          </n-form-item-gi>

          <n-form-item-gi :span="2" :label="$t(`topicDetailsPage.exams.deadline`)" path="deadline" rule-path="requiredDateTimeField">
            <n-date-picker
                class="w-full"
                :placeholder="$t(`content.choose`)"
                v-model:value="store.payload.deadline"
                type="datetime"
                update-value-on-close
                :actions="null"
                clearable />
          </n-form-item-gi>
          <n-form-item-gi :span="1" path="tests_count" rule-path="requiredNumberField" :label="$t(`topicDetailsPage.exams.tests_count`)">
            <n-input-number
                class="w-full"
                :min="1"
                :placeholder="$t(`content.enterField`)"
                v-model:value="store.payload.tests_count"
            />
          </n-form-item-gi>
          <n-form-item-gi
              :span="1"
              path="variant"
              rule-path="requiredNumberField"
              :label="$t(`topicDetailsPage.exams.variants`)"
          >
            <n-input-number
                class="w-full"
                :min="1"
                :placeholder="$t(`content.enterField`)"
                v-model:value="store.payload.variant"
            />
          </n-form-item-gi>
          <n-form-item-gi :span="1" path="chances" rule-path="requiredNumberField" :label="$t(`topicDetailsPage.exams.chances`)">
            <n-input-number
                :min="1"
                class="w-full"
                :placeholder="$t(`content.enterField`)"
                v-model:value="store.payload.chances"
            />
          </n-form-item-gi>
          <n-form-item-gi :span="1" path="minute" rule-path="requiredNumberField" :label="$t(`topicDetailsPage.exams.minute`)">
            <n-input-number
                :min="1"
                class="w-full"
                :placeholder="$t(`content.enterField`)"
                v-model:value="store.payload.minute"
            />
          </n-form-item-gi>


          <n-form-item-gi :span="2"
                          :label="$t(`topicDetailsPage.exams.toWhom`)"
                          path="whom"
                          rule-path="requiredNumberField"
          >
            <n-select
                v-model:value="store.payload.whom"
                filterable
                @update:value="store.payload.whom_ids = []"
                :placeholder="$t(`content.choose`)"
                :options="componentStore.topicWhomList"
                label-field="name"
                value-field="id"
                :loading="componentStore.enumExamLoading"
            />
          </n-form-item-gi>
          <n-form-item-gi :span="2"
                          v-if="store.payload.whom===2"
                          :label="$t(`topicDetailsPage.exams.positions`)"
                          path="whom_ids"
                          rule-path="requiredMultiSelectField"
          >
            <n-select
                v-model:value="store.payload.whom_ids"
                filterable
                :placeholder="$t(`content.choose`)"
                :options="componentStore.departmentPositionList"
                label-field="name"
                value-field="id"
                multiple
                max-tag-count="responsive"
                :loading="componentStore.departmentPositionLoading"
            />
          </n-form-item-gi>
          <n-form-item-gi :span="2"
                          v-else-if="store.payload.whom===3"
                          :label="$t(`topicDetailsPage.exams.workers`)"
                          path="whom_ids"
                          rule-path="requiredMultiSelectField"
          >
            <n-select
                v-model:value="store.payload.whom_ids"
                filterable
                :placeholder="$t(`content.choose`)"
                :options="componentStore.workerList"
                label-field="name"
                value-field="id"
                :loading="componentStore.workerLoading"
                multiple
            />
          </n-form-item-gi>
          <n-form-item-gi :span="2" :label="$t(`content.description`)" path="description">
            <n-input
                type="textarea"
                :placeholder="$t(`content.enterField`)"
                v-model:value="store.payload.description"
            />
          </n-form-item-gi>
        </n-grid>
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
  </n-spin>
</template>

<style scoped>

</style>