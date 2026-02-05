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
        const status = store.form_50.vacation_finish_status
        data = {
          ...mainData,
          to: Utils.timeToZone(store.form_50.to),
          work_day: Utils.timeToZone(store.form_50.work_day),
          vacation_id: store.form_50.vacation_id,
          vacation_status: status === 1 ? store.form_50.vacation_status : null,
          vacation_finish_status: status,
          child_age: status === 2 ? store.form_50.child_age : null
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

  const onSelectVacation = (v) => {
    const index = store.workerVacations.findIndex((w) => w.id === v)
    if (index === -1) return

    const selectedItem = store.workerVacations[index]
    const currentDate = new Date(selectedItem.to)
    const nextOneDayDate = new Date(currentDate)
    nextOneDayDate.setDate(currentDate.getDate() + 1)
    store.form_50.to = currentDate.getTime()
    store.form_50.work_day = new Date(nextOneDayDate).getTime()
  }

  defineExpose({
    onSubmit,
    validateForm
  })

  watch(
    () => store.payload.worker,
    (v) => {
      store.form_50.vacation_id = null
      if (!v) return
      store._getWorkerVacation()
    },
    { immediate: true }
  )

  const workTypeOptions = [
    {
      id: 1,
      name: t('content.fullTime')
    },
    {
      id: 2,
      name: t('content.partTime')
    }
  ]

  const finishStatuses = [
    {
      name: t('documentPage.command.form.beforeFromDeadline'),
      id: 1
    },
    {
      name: t('documentPage.command.form.afterFromDeadline'),
      id: 2
    }
  ]

  const ageOptions = [
    {
      name: t('documentPage.command.form.twoAgeChild'),
      id: 2
    },
    {
      name: t('documentPage.command.form.threeAgeChild'),
      id: 3
    }
  ]
</script>

<template>
  <n-form
    ref="formRef"
    :model="store.form_50"
    :rules="validationRules.common"
    class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground"
  >
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
          @update:value="onSelectVacation"
          label-field="name"
          value-field="id"
        />
      </n-form-item>
    </div>
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
        :label="$t(`content.workTime`)"
        path="vacation_finish_status"
        :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-select
          filterable
          :options="finishStatuses"
          v-model:value="store.form_50.vacation_finish_status"
          label-field="name"
          value-field="id"
        />
      </n-form-item>
    </div>
    <div
      v-if="store.form_50.vacation_finish_status === 1"
      class="col-span-12 md:col-span-6 lg:col-span-6"
    >
      <n-form-item
        :label="$t(`content.workTime`)"
        path="vacation_status"
        :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-select
          filterable
          :options="workTypeOptions"
          v-model:value="store.form_50.vacation_status"
          label-field="name"
          value-field="id"
        />
      </n-form-item>
    </div>

    <div
      v-if="store.form_50.vacation_finish_status === 2"
      class="col-span-12 md:col-span-6 lg:col-span-6"
    >
      <n-form-item
        :label="$t(`documentPage.command.form.deadlineOfVacation`)"
        path="child_age"
        :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-select
          filterable
          :options="ageOptions"
          v-model:value="store.form_50.child_age"
          label-field="name"
          value-field="id"
        />
      </n-form-item>
    </div>
  </n-form>
</template>
