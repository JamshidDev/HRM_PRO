<script setup>
  import { useCommandFormStore } from '@/pages/docFlow/document/command/commandFormStore.js'
  import { PersonNote20Regular, DismissCircle16Regular, Eye24Regular } from '@vicons/fluent'
  import Utils from '../../../../../utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import { isEmptyValue, useEmptyFieldMarks } from '../useEmptyFieldMarks.js'
  import { OTHER_AWARD_ID, awardIdFromGiftType, useIncentiveAwards } from '../useIncentiveAwards.js'

  const store = useCommandFormStore()
  const { t } = i18n.global
  const { showErrors, status } = useEmptyFieldMarks()

  const onRemoveWorker = (id) => {
    store.workerData = store.workerData.filter((v) => v.id !== id)
    store.payload.workers = store.payload.workers.filter((workerId) => workerId !== id)
  }
  const awardsApi = useIncentiveAwards()

  const onSubmit = (mainData) => {
    const checkForm = store.workerData.every(
      (v) =>
        !isEmptyValue(v.by_whom) &&
        !isEmptyValue(v.reason) &&
        !isEmptyValue(v.award_id) &&
        (v.award_id === OTHER_AWARD_ID ? !isEmptyValue(v.gift) : true)
    )
    showErrors.value = !checkForm
    if (checkForm) {
      const data = store.workerData.map((v) => ({
        id: v.id,
        by_whom: v.by_whom,
        reason: v.reason,
        ...awardsApi.fieldsOf(v.award_id, v.gift)
      }))

      return {
        data: {
          ...mainData,
          worker_positions: data,
          base: store.commandBase || null
        },
        isValid: true
      }
    } else {
      $Alert.validation(t('message.warning-data'))
      return {
        data: null,
        isValid: false
      }
    }
  }

  defineExpose({
    onSubmit
  })

  // Eski qoralama/tahrirda faqat gift_type bo'lsa — mukofot id'ga o'tkaziladi.
  watchEffect(() => {
    store.workerData.forEach((v) => {
      if (v.award_id == null && v.gift_type != null) v.award_id = awardIdFromGiftType(v.gift_type)
    })
  })

  onMounted(() => {
    awardsApi.load()
  })
</script>

<template>
  <div
    v-for="(item, idx) in store.workerData"
    :key="idx"
    class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line p-2 rounded-md bg-surface-ground"
  >
    <div class="col-span-12 flex justify-between">
      <n-button type="info" secondary size="tiny">
        <template #icon>
          <PersonNote20Regular />
        </template>
        {{ Utils.combineFullName(item.worker.worker) }}
      </n-button>
      <n-button type="error" secondary size="tiny" @click="onRemoveWorker(item.id)">
        <template #icon>
          <DismissCircle16Regular />
        </template>
        {{ $t('documentPage.command.form.removeWorker') }}
      </n-button>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-12">
      <n-form-item
        :show-feedback="false"
        :label="$t(`documentPage.command.form.reason`)"
        path="reason"
        :validation-status="status(item.reason)"
      >
        <n-input class="w-full" type="text" v-model:value="item.reason" />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-4">
      <n-form-item
        :show-feedback="false"
        :label="$t(`documentPage.command.form.by_whom`)"
        path="by_whom"
        :validation-status="status(item.by_whom)"
      >
        <n-input class="w-full" type="text" v-model:value="item.by_whom" />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-4">
      <n-form-item
        :show-feedback="false"
        :label="$t('commandPage.legacy.award')"
        path="award_id"
        :validation-status="status(item.award_id)"
      >
        <n-select
          v-model:value="item.award_id"
          filterable
          :options="awardsApi.options.value"
          :loading="awardsApi.loading.value"
          :consistent-menu-width="false"
        />
      </n-form-item>
    </div>
    <div v-if="item.award_id === OTHER_AWARD_ID" class="col-span-12 @xl:col-span-6 @4xl:col-span-4">
      <n-form-item
        :show-feedback="false"
        :label="$t(`documentPage.command.form.gift`)"
        path="gift"
        :validation-status="status(item.gift)"
      >
        <n-input class="w-full" type="text" v-model:value="item.gift" />
      </n-form-item>
    </div>
  </div>
  <div
    class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line p-2 rounded-md bg-surface-ground"
  >
    <div class="col-span-12">
      <n-form-item :show-feedback="false" :label="$t(`documentPage.command.form.base`)" path="base">
        <n-input
          class="w-full"
          type="textarea"
          :autosize="true"
          :rows="1"
          v-model:value="store.commandBase"
          clearable
        />
      </n-form-item>
    </div>
  </div>
</template>
