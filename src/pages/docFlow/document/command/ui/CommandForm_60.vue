<script setup>
  import { useCommandFormStore } from '@/pages/docFlow/document/command/commandFormStore.js'
  import Utils from '@/utils/Utils.js'
  import validationRules from '@/utils/validationRules.js'
  import { useAppSetting } from '@/utils/index.js'

  // 60 — Harbiy yig'inga yuborish (hujjatgina; muddat from–to).
  const store = useCommandFormStore()
  const formRef = ref(null)

  const onSubmit = async (mainData) => {
    let data = null
    await formRef.value?.validate(async (error) => {
      if (!error) {
        data = {
          ...mainData,
          from: Utils.timeToZone(store.form_60.from),
          to: Utils.timeToZone(store.form_60.to),
          military_office: store.form_60.military_office,
          reference_date: Utils.timeToZone(store.form_60.reference_date),
          reference_number: store.form_60.reference_number
        }
      } else {
        data = null
      }
    })
    return { data, isValid: Boolean(data) }
  }

  const validateForm = async () => {
    await formRef.value?.validate()
  }

  defineExpose({ onSubmit, validateForm })
</script>

<template>
  <n-form
    ref="formRef"
    :model="store.form_60"
    :rules="validationRules.form_60"
    class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground"
  >
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-4">
      <n-form-item :label="$t(`commandPage.form_60.from`)" path="from">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_60.from"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-4">
      <n-form-item :label="$t(`commandPage.form_60.to`)" path="to">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_60.to"
          type="date"
          :format="useAppSetting.datePicketFormat"
          :is-date-disabled="(ts) => Boolean(store.form_60.from) && ts < store.form_60.from"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-4">
      <n-form-item :label="$t(`commandPage.form_60.military_office`)" path="military_office">
        <n-input
          class="w-full"
          type="text"
          v-model:value="store.form_60.military_office"
          :placeholder="$t(`commandPage.form_60.military_office_placeholder`)"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-4">
      <n-form-item :label="$t(`commandPage.form_60.reference_date`)" path="reference_date">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_60.reference_date"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-4">
      <n-form-item :label="$t(`commandPage.form_60.reference_number`)" path="reference_number">
        <n-input class="w-full" type="text" v-model:value="store.form_60.reference_number" />
      </n-form-item>
    </div>
  </n-form>
</template>
