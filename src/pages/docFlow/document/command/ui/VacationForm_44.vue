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
        contract_to_date:Utils.timeToZone(store.form_44.new_date),
        rest_day:store.form_44.rest_day,
        reason:store.form_44.reason,
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
      :model="store.form_44"
      :rules="validationRules.form_44"

      class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground">
    <div class="col-span-3">
      <n-form-item :label="$t(`commandPage.form_44.new_date`)" path="new_date">
        <n-date-picker
            class="w-full"
            v-model:value="store.form_44.new_date"
            type="date"
            :placeholder="$t(`content.choose`)"
        />
      </n-form-item>
    </div>
    <div class="col-span-3">
      <n-form-item :label="$t(`commandPage.form_44.rest_day`)" path="rest_day">
        <n-input
            class="w-full"
            type="text"
            :placeholder="$t(`content.enterField`)"
            v-model:value="store.form_44.rest_day"
            :allow-input="Utils.onlyAllowNumber"
        />
      </n-form-item>
    </div>
    <div class="col-span-6">
      <n-form-item :label="$t(`commandPage.form_44.reason`)" path="reason">
        <n-select
            v-model:value="store.form_44.reason"
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
