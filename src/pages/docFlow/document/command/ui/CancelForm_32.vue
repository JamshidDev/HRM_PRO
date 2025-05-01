<script setup>
import {useCommandStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import validationRules from "@/utils/validationRules.js"
import i18n from "@/i18n/index.js"

const store = useCommandStore()
const formRef = ref(null)
const {t} = i18n.global
const onSubmit =async (mainData)=>{
   let data = null
   await formRef.value?.validate(async (error)=>{
    if(!error){
      data =
          {
      ...mainData,
      contract_to_date:Utils.timeToZone(store.form_32.contract_to_date),
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


defineExpose({
  onSubmit
})
</script>

<template>
  <n-form
      ref="formRef"
      :model="store.form_32"
      :rules="validationRules.form_32"

      class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground">
    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item :label="$t(`documentPage.command.form.contract_to_date`)" path="contract_to_date">
        <n-date-picker
            class="w-full"
            v-model:value="store.form_32.contract_to_date"
            type="date"
            :placeholder="$t(`content.choose`)"
        />
      </n-form-item>
    </div>
  </n-form>
</template>
