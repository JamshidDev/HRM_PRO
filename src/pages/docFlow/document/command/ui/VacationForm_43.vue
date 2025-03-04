<script setup>
import {useCommandStore, useComponentStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import validationRules from "@/utils/validationRules.js"

const store = useCommandStore()
const componentStore = useComponentStore()
const formRef = ref(null)
const onSubmit =async (mainData)=>{
  let data = null
  await formRef.value?.validate(async (error)=>{
    if(!error){
      data ={
        ...mainData,
        new_date:Utils.timeToZone(store.form_43.new_date),
        work_day:Utils.timeToZone(store.form_43.work_day),
        reason:store.form_43.reason,
      }

    }else{
      data = null
    }
  })
  return {
    data:data,
    isValid:Boolean(data),
  }
}

const validateForm = async ()=>{
  await formRef.value?.validate()
}


defineExpose({
  onSubmit,
  validateForm,
})
</script>

<template>
  <n-form
      ref="formRef"
      :model="store.form_43"
      :rules="validationRules.form_43"

      class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-gray-200">
    <div class="col-span-3">
      <n-form-item :label="$t(`commandPage.form_43.new_date`)" path="new_date">
        <n-date-picker
            class="w-full"
            v-model:value="store.form_43.new_date"
            type="date"
            :placeholder="$t(`content.choose`)"
        />
      </n-form-item>
    </div>
    <div class="col-span-3">
      <n-form-item :label="$t(`commandPage.form_43.work_day`)" path="work_day">
        <n-date-picker
            class="w-full"
            v-model:value="store.form_43.work_day"
            type="date"
            :placeholder="$t(`content.choose`)"
        />
      </n-form-item>
    </div>
    <div class="col-span-6">
      <n-form-item :label="$t(`commandPage.form_43.reason`)" path="reason">
        <n-select
            v-model:value="store.form_43.reason"
            filterable
            :placeholder="$t(`content.choose`)"
            :options="componentStore.reasonTypes"
            label-field="name"
            value-field="id"
            :loading="componentStore.reasonTypeLoading"
        />

      </n-form-item>
    </div>

  </n-form>
</template>
