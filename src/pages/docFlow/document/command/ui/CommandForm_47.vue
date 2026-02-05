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
          from: Utils.timeToZone(store.form_47.to),
          work_day: Utils.timeToZone(store.form_47.work_day),
          vacation_reason_day: Number(store.form_47.vacation_reason_day),
          vacation_reason_type: store.form_47.vacation_reason_type,
          base: store.form_47.base
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

  const options = [
    {
      id: 1,
      name: t('commandPage.form_47.optionOne')
    },
    {
      id: 2,
      name: t('commandPage.form_47.optionTwo')
    }
  ]

  const onChangeType = (v) => {
    store.form_47.vacation_reason_type = null
    if (!v) return
    store.form_47.vacation_reason_type = options[v - 1].name
  }
</script>

<template>
  <n-form
    ref="formRef"
    :model="store.form_47"
    :rules="validationRules.common"
    class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground"
  >
    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item
        :label="$t(`commandPage.form_50.from`)"
        path="to"
        :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-date-picker
          class="w-full"
          v-model:value="store.form_47.to"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-6">
      <n-form-item
        :label="$t(`content.type`)"
        path="type"
        :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-select
          filterable
          :options="options"
          v-model:value="store.form_47.type"
          @update:value="onChangeType"
          label-field="name"
          value-field="id"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item
        :label="$t(`commandPage.form_47.vacation_reason_day`)"
        path="vacation_reason_day"
        :rule-path="validationRules.rulesNames.requiredStringField"
      >
        <n-input
          :disabled="true"
          class="!w-full"
          type="text"
          v-model:value="store.form_47.vacation_reason_day"
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
          v-model:value="store.form_47.work_day"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12">
      <n-form-item :show-feedback="false" :label="$t(`documentPage.command.form.base`)" path="base">
        <n-input
          class="w-full"
          type="textarea"
          :autosize="true"
          :rows="1"
          v-model:value="store.form_47.base"
          clearable
        />
      </n-form-item>
    </div>
    <!--    <div class="col-span-12 md:col-span-6 lg:col-span-9">-->
    <!--      <n-form-item-->
    <!--          :label="$t(`commandPage.form_44.reason`)"-->
    <!--          path="vacation_reason_type"-->
    <!--          :rule-path="validationRules.rulesNames.requiredStringField"-->
    <!--      >-->
    <!--        <n-input  :disabled="true" rows="1" :autosize="true" class="!w-full" type="textarea" v-model:value="store.form_47.vacation_reason_type" />-->
    <!--      </n-form-item>-->
    <!--    </div>-->
  </n-form>
</template>
