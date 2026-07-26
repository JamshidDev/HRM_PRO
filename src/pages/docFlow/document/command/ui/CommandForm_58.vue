<script setup>
  import { useCommandStore, useComponentStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import validationRules from '@/utils/validationRules.js'
  import { useAppSetting } from '@/utils/index.js'

  const store = useCommandStore()
  const componentStore = useComponentStore()
  const formRef = ref(null)

  const onSubmit = async (mainData) => {
    let data = null
    await formRef.value?.validate(async (error) => {
      if (!error) {
        data = {
          ...mainData,
          suspension_reason: store.form_58.suspension_reason,
          from: Utils.timeToZone(store.form_58.from),
          to: Utils.timeToZone(store.form_58.to),
          act_date: Utils.timeToZone(store.form_58.act_date),
          responsible: store.form_58.responsible
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
    :model="store.form_58"
    :rules="validationRules.form_58"
    class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground"
  >
    <div class="col-span-12">
      <n-form-item :label="$t(`commandPage.form_58.suspension_reason`)" path="suspension_reason">
        <n-select
          v-model:value="store.form_58.suspension_reason"
          filterable
          :options="componentStore.reasonTypes"
          :loading="componentStore.reasonTypeLoading"
          label-field="name"
          value-field="id"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-4">
      <n-form-item :label="$t(`commandPage.form_58.from`)" path="from">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_58.from"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-4">
      <n-form-item :label="$t(`commandPage.form_58.to`)" path="to">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_58.to"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-4">
      <n-form-item :label="$t(`commandPage.form_58.act_date`)" path="act_date">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_58.act_date"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12">
      <n-form-item :label="$t(`commandPage.form_58.responsible`)" path="responsible">
        <n-input class="w-full" type="text" v-model:value="store.form_58.responsible" />
      </n-form-item>
    </div>
  </n-form>
</template>
