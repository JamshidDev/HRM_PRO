<script setup>
import validationRules from "@/utils/validationRules.js";
import {useEduPlanStore} from "@/store/modules/index.js";
import {useAppSetting} from "@/utils/index.js"

const formRef = ref(null)
const store = useEduPlanStore()

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
  store.specializationsParams.page = 1
  store.specializationsParams.search = null
  store.subjectsParams.page = 1
  store.subjectsParams.search = null


  store._specializations()
  store._subjects()
})

</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.payload"
  >
    <div style="min-height:calc(100vh - 120px)">
      <n-form-item :label="$t(`eduPlanPage.form.hours`)" path="hours" rule-path="requiredNumberField">
        <n-input-number
            class="w-full"
            min="1"
            v-model:value="store.payload.hours"
        />
      </n-form-item>
      <n-form-item :label="$t(`eduPlanPage.form.start_date`)" path="start_date" rule-path="requiredNumberField">
        <n-date-picker
            class="w-full"
            v-model:value="store.payload.start_date"
            type="date"
            :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
      <n-form-item :label="$t(`eduPlanPage.form.specialization`)" path="specialization_id" rule-path="requiredNumberField">
        <n-select
            v-model:value="store.payload.specialization_id"
            @scroll="store.onScrollSpecializations"
            :options="store.specializations"
            :loading="store.specializationsLoading"
            label-field="name"
            value-field="id"
            filterable
            :filter="()=>true"
            @search="store.onSearchSpecializations"
        />
      </n-form-item>
      <n-form-item :label="$t(`eduPlanPage.form.subjects`)" path="subjects" rule-path="requiredMultiSelectField">
        <n-select
            v-model:value="store.payload.subjects"
            multiple
            @scroll="store.onScrollSubjects"
            :options="store.subjects"
            :loading="store.subjectsLoading"
            label-field="name"
            value-field="id"
            filterable
            :filter="()=>true"
            @search="store.onSearchSubjects"
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

<style scoped>

</style>