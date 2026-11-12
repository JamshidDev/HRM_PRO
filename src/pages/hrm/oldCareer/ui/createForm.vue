<script setup>
  import validationRules from '@/utils/validationRules.js'
  const formRef = ref(null)
  import { useOldCareerStore } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useOldCareerStore()

  // Oldingi ish joyi — sanalar kelajakda bo'lmaydi, tugash sanasi boshlanishdan oldin emas (QA-22).
  // Kalendarda kelajak kunlari yopiq; qo'lda yozilgan sana qoidalar orqali tekshiriladi.
  // BACKEND: POST/PUT /v1/hr/worker-old-careers ham to_date >= from_date va kelajak sanani tekshirsin —
  // hozir mantiqsiz yozuvni 201 bilan saqlaydi (QA-22).
  const endOfToday = () => new Date().setHours(23, 59, 59, 999)
  const isFutureDay = (ts) => ts > endOfToday()
  const isToDateDisabled = (ts) =>
    isFutureDay(ts) ||
    (store.payload.from_date && ts < new Date(store.payload.from_date).setHours(0, 0, 0, 0))

  const DATE_TRIGGER = ['input', 'blur', 'change']
  const notFuture = {
    validator: (_, value) => (!value || !isFutureDay(value) ? true : new Error(t('rules.futureDate'))),
    trigger: DATE_TRIGGER
  }
  const rules = {
    ...validationRules.oldCareerPage,
    from_date: [validationRules.oldCareerPage.from_date, notFuture],
    to_date: [
      validationRules.oldCareerPage.to_date,
      notFuture,
      {
        validator: (_, value) =>
          !value || !store.payload.from_date || value >= store.payload.from_date
            ? true
            : new Error(t('rules.endBeforeStart')),
        key: 'endDate',
        trigger: DATE_TRIGGER
      }
    ]
  }

  // Boshlanish sanasi o'zgarsa tugash sanasi qayta tekshiriladi
  const onFromDateChange = () => {
    if (!store.payload.to_date) return
    nextTick(() => formRef.value?.validate(undefined, (r) => r.key === 'endDate').catch(() => {}))
  }

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        store.saveLoading = true
        if (store.visibleType) {
          store._create()
        } else {
          store._update()
        }
      }
    })
  }
</script>

<template>
  <div style="height: calc(100vh - 120px)" class="overflow-y-auto">
    <n-form ref="formRef" :rules="rules" :model="store.payload">
      <n-form-item :label="$t(`oldCareerPage.form.from_date`)" path="from_date">
        <n-date-picker
          class="w-full"
          v-model:value="store.payload.from_date"
          type="date"
          :is-date-disabled="isFutureDay"
          @update:value="onFromDateChange"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
      <n-form-item :label="$t(`oldCareerPage.form.to_date`)" path="to_date">
        <n-date-picker
          class="w-full"
          v-model:value="store.payload.to_date"
          type="date"
          :is-date-disabled="isToDateDisabled"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
      <n-form-item :label="$t(`oldCareerPage.form.post_name`)" path="post_name">
        <n-input type="textarea" autosize v-model:value="store.payload.post_name" />
      </n-form-item>
    </n-form>
  </div>
  <div class="grid grid-cols-2 gap-2">
    <n-button @click="store.openVisible(false)" type="error" ghost>
      {{ $t('content.cancel') }}
    </n-button>
    <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
      {{ $t('content.save') }}
    </n-button>
  </div>
</template>

<style scoped></style>
