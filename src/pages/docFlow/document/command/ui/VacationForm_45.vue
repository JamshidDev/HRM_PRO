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
        from:Utils.timeToZone(store.form_45.from),
        to:Utils.timeToZone(store.form_45.to),
        work_day:Utils.timeToZone(store.form_45.work_day),
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
      :model="store.form_45"
      :rules="validationRules.form_45"

      class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground">
    <div class="col-span-3">
      <n-form-item :label="$t(`commandPage.form_45.from`)" path="from">
        <n-date-picker
            class="w-full"
            v-model:value="store.form_45.from"
            type="date"
            :placeholder="$t(`content.choose`)"
        />
      </n-form-item>
    </div>
    <div class="col-span-3">
      <n-form-item :label="$t(`commandPage.form_45.to`)" path="to">
        <n-date-picker
            class="w-full"
            v-model:value="store.form_45.to"
            type="date"
            :placeholder="$t(`content.choose`)"
        />
      </n-form-item>
    </div>
    <div class="col-span-3">
      <n-form-item :label="$t(`commandPage.form_45.work_day`)" path="work_day">
        <n-date-picker
            class="w-full"
            v-model:value="store.form_45.work_day"
            type="date"
            :placeholder="$t(`content.choose`)"
        />
      </n-form-item>
    </div>



  </n-form>
</template>

