

<script setup>
import {useCommandStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import validationRules from "@/utils/validationRules.js"

const store = useCommandStore()
const formRef = ref(null)
const onSubmit =async (mainData)=>{
  let data = null
  await formRef.value?.validate(async (error)=>{
    if(!error){
      data ={
        ...mainData,
        from:Utils.timeToZone(store.form_49.from),
        to:Utils.timeToZone(store.form_49.to),
        work_day:Utils.timeToZone(store.form_49.work_day),
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
      :model="store.form_49"
      :rules="validationRules.form_49"

      class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-gray-200">
    <div class="col-span-3">
      <n-form-item :label="$t(`commandPage.form_49.from`)" path="from">
        <n-date-picker
            class="w-full"
            v-model:value="store.form_49.from"
            type="date"
            :placeholder="$t(`content.choose`)"
        />
      </n-form-item>
    </div>
    <div class="col-span-3">
      <n-form-item :label="$t(`commandPage.form_49.to`)" path="to">
        <n-date-picker
            class="w-full"
            v-model:value="store.form_49.to"
            type="date"
            :placeholder="$t(`content.choose`)"
        />
      </n-form-item>
    </div>
    <div class="col-span-3">
      <n-form-item :label="$t(`commandPage.form_49.work_day`)" path="work_day">
        <n-date-picker
            class="w-full"
            v-model:value="store.form_49.work_day"
            type="date"
            :placeholder="$t(`content.choose`)"
        />
      </n-form-item>
    </div>



  </n-form>
</template>
