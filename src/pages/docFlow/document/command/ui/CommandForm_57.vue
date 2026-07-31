<script setup>
  import { useCommandStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import validationRules from '@/utils/validationRules.js'
  import { useAppSetting } from '@/utils/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useCommandStore()
  const formRef = ref(null)

  const payOptions = computed(() => [
    { value: 1, label: t('commandPage.form_57.pay_option') },
    { value: 2, label: t('commandPage.form_57.rest_option') }
  ])

  // Dam olish (pay_type=2) tanlansa rest_* maydonlar majburiy bo'ladi.
  const restRule = {
    type: 'number',
    required: true,
    message: t('rules.requiredField'),
    trigger: ['input', 'blur-sm', 'change']
  }
  const formRules = computed(() =>
    store.form_57.pay_type === 2
      ? {
          ...validationRules.form_57,
          rest_date: restRule,
          rest_start_time: restRule,
          rest_end_time: restRule
        }
      : validationRules.form_57
  )

  const onChangeTime = () => {
    const s = store.form_57.start_time
    const e = store.form_57.end_time
    if (s && e && e > s) {
      const hours = (e - s) / 3600000
      store.form_57.duration = `${hours % 1 === 0 ? hours : hours.toFixed(1)} soatlik`
    } else {
      store.form_57.duration = null
    }
  }

  const onSubmit = async (mainData) => {
    let data = null
    await formRef.value?.validate(async (error) => {
      if (!error) {
        const isRest = store.form_57.pay_type === 2
        data = {
          ...mainData,
          work_date: Utils.timeToZone(store.form_57.work_date),
          start_time: Utils.timeOnlyHour(store.form_57.start_time) || undefined,
          end_time: Utils.timeOnlyHour(store.form_57.end_time) || undefined,
          duration: store.form_57.duration || undefined,
          reason: store.form_57.reason,
          responsible: store.form_57.responsible,
          pay_type: store.form_57.pay_type,
          rest_date: isRest ? Utils.timeToZone(store.form_57.rest_date) : undefined,
          rest_start_time: isRest
            ? Utils.timeOnlyHour(store.form_57.rest_start_time) || undefined
            : undefined,
          rest_end_time: isRest
            ? Utils.timeOnlyHour(store.form_57.rest_end_time) || undefined
            : undefined
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
    :model="store.form_57"
    :rules="formRules"
    class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground"
  >
    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item :label="$t(`commandPage.form_57.work_date`)" path="work_date">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_57.work_date"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item :label="$t(`commandPage.form_57.start_time`)" path="start_time">
        <n-time-picker
          format="HH:mm"
          class="w-full"
          v-model:value="store.form_57.start_time"
          @update:value="onChangeTime"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item :label="$t(`commandPage.form_57.end_time`)" path="end_time">
        <n-time-picker
          format="HH:mm"
          class="w-full"
          v-model:value="store.form_57.end_time"
          @update:value="onChangeTime"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item :label="$t(`commandPage.form_57.duration`)" path="duration">
        <n-input class="w-full" :disabled="true" v-model:value="store.form_57.duration" />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6">
      <n-form-item :label="$t(`commandPage.form_57.reason`)" path="reason">
        <n-input class="w-full" type="text" v-model:value="store.form_57.reason" />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6">
      <n-form-item :label="$t(`commandPage.form_57.responsible`)" path="responsible">
        <n-input class="w-full" type="text" v-model:value="store.form_57.responsible" />
      </n-form-item>
    </div>

    <div class="col-span-12 md:col-span-6">
      <n-form-item :label="$t(`commandPage.form_57.pay_type`)" path="pay_type">
        <n-select
          v-model:value="store.form_57.pay_type"
          :options="payOptions"
          label-field="label"
          value-field="value"
        />
      </n-form-item>
    </div>

    <template v-if="store.form_57.pay_type === 2">
      <div class="col-span-12 md:col-span-6 lg:col-span-4">
        <n-form-item :label="$t(`commandPage.form_57.rest_date`)" path="rest_date">
          <n-date-picker
            class="w-full"
            v-model:value="store.form_57.rest_date"
            type="date"
            :format="useAppSetting.datePicketFormat"
          />
        </n-form-item>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-4">
        <n-form-item :label="$t(`commandPage.form_57.rest_start_time`)" path="rest_start_time">
          <n-time-picker format="HH:mm" class="w-full" v-model:value="store.form_57.rest_start_time" />
        </n-form-item>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-4">
        <n-form-item :label="$t(`commandPage.form_57.rest_end_time`)" path="rest_end_time">
          <n-time-picker format="HH:mm" class="w-full" v-model:value="store.form_57.rest_end_time" />
        </n-form-item>
      </div>
    </template>
  </n-form>
</template>
