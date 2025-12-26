<script setup>
import { useCommandStore, useComponentStore } from '@stores'
import { useAppSetting, Utils } from '@utils'
import validationRules from '@/utils/validationRules.js'
import i18n from '@/i18n/index.js'
const { t } = i18n.global
const store = useCommandStore()
const formRef = ref(null)
const onSubmit = async (mainData) => {
  let data = null
  await formRef.value?.validate(async (error) => {
    if (!error) {
      data = {
        ...mainData,
        to: Utils.timeToZone(store.form_50.to),
        work_day: Utils.timeToZone(store.form_50.work_day),
        vacation_id:store.form_50.vacation_id,
        vacation_status:store.form_50.vacation_status,
      }
    } else {
      data = null
    }
  })
  return {
    data: data,
    isValid: Boolean(data)
  }
}

const validateForm = async () => {
  await formRef.value?.validate()
}




defineExpose({
  onSubmit,
  validateForm
})

watch(()=>store.payload.worker,(v)=>{
  if(!v) return
  store.form_50.vacation_id = null
  store._getWorkerVacation()
}, {immediate:true})

const workTypeOptions = [
  {
    id:1,
    name:t('content.fullTime'),
  },
  {
    id:2,
    name:t('content.partTime'),
  },
]

</script>

<template>
  <n-form
      ref="formRef"
      :model="store.form_50"
      :rules="validationRules.common"
      class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground"
  >

    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item
          :label="$t(`commandPage.form_50.to`)"
          path="to"
          :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-date-picker
            class="w-full"
            v-model:value="store.form_50.to"
            type="date"
            :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item
          :label="$t(`commandPage.form_45.work_day`)"
          path="work_day"
          :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-date-picker
            class="w-full"
            v-model:value="store.form_50.work_day"
            type="date"
            :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-6">
      <n-form-item
          :label="$t(`commandPage.form_50.vacation_id`)"
          path="vacation_id"
          :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-select
            filterable
            :loading="store.workerVacationLoading"
            :options="store.workerVacations"
            v-model:value="store.form_50.vacation_id"
            label-field="name"
            value-field="id"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-6">
      <n-form-item :label="$t(`content.workTime`)" path="vacation_status" :rule-path="validationRules.rulesNames.requiredNumberField">
        <n-select
            filterable
            :options="workTypeOptions"
            v-model:value="store.form_50.vacation_status"
            label-field="name"
            value-field="id"
        />
      </n-form-item>
    </div>
  </n-form>
</template>
