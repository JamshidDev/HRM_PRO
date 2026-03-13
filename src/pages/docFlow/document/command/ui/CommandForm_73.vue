<script setup>
  import { useCommandStore, useComponentStore } from '@/store/modules/index.js'
  import {
    PersonNote20Regular,
    DismissCircle16Regular,
    Eye24Regular,
    Info20Filled
  } from '@vicons/fluent'
  import Utils from '../../../../../utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const store = useCommandStore()
  const componentStore = useComponentStore()
  const { t } = i18n.global

  const base = ref(null)
  const loading = ref(false)

  const onRemoveWorker = (id) => {
    store.workerData = store.workerData.filter((v) => v.id !== id)
    store.payload.workers = store.payload.workers.filter((workerId) => workerId !== id)
  }
  const onSubmit = (mainData) => {
    const checkForm = store.workerData.every(
      (v) => v.reason !== null && v.type !== null && v.amount !== null
    )
    if (checkForm) {
      const data = store.workerData.map((v) => ({
        id: v.id,
        reason: v.reason,
        type: v.type,
        amount: v.amount
      }))

      return {
        data: {
          ...mainData,
          worker_positions: data,
          command_additional: {
            base: base.value || null
          }
        },
        isValid: true
      }
    } else {
      $Toast.warning(t('message.warning-data'))
      return {
        data: null,
        isValid: false
      }
    }
  }

  const options = [
    { id: 1, name: t('documentPage.command.form.reason_one') },
    { id: 2, name: t('documentPage.command.form.reason_two') },
    { id: 3, name: t('documentPage.command.form.reason_three') },
    { id: 4, name: t('documentPage.command.form.reason_four') },
    { id: 5, name: t('documentPage.command.form.reason_five') },
    { id: 6, name: t('documentPage.command.form.reason_six') },
    { id: 7, name: t('documentPage.command.form.reason_seven') },
    { id: 9, name: t('documentPage.command.form.reason_eight') }
  ]

  const onSelectReason = (index, v) => {
    store.workerData[index].reason = v
  }

  const onChange = (v, item, index) => {
    if (v === 2) {
      getAdditionalData(index, item.id)
    }
  }

  const getAdditionalData = (index, id) => {
    loading.value = true
    const params = {
      type: 'financial_assistance'
    }
    $ApiService.commandService
      ._additionalData({ id, params })
      .then((res) => {
        store.workerData[index].amount = res.data.data.data.experience_coefficient?.toString()
      })
      .finally(() => {
        loading.value = false
      })
  }

  defineExpose({
    onSubmit
  })

  onMounted(() => {
    componentStore._enums()
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

    <div class="col-span-12">
      <n-form-item
        :show-feedback="false"
        :label="$t(`documentPage.command.form.reason`)"
        path="reason"
      >
        <div class="!w-full flex gap-2">
          <n-input
            class="w-full"
            type="textarea"
            :autosize="true"
            :rows="1"
            v-model:value="item.reason"
            clearable
          />
          <n-popover placement="bottom" trigger="click">
            <template #trigger>
              <n-button type="primary" secondary round>
                <template #icon>
                  <Info20Filled />
                </template>
              </n-button>
            </template>
            <div class="max-w-[400px] h-[300px] overflow-y-auto">
              <div
                v-for="item in options"
                :key="item.id"
                class="leading-[1.2] mb-1 text-[14px] text-secondary cursor-pointer p-2 bg-transparent hover:bg-primary/10 rounded-xl"
                @click="onSelectReason(idx, item.name)"
              >
                {{ item.id }}. {{ item.name }}
              </div>
            </div>
          </n-popover>
        </div>
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-4">
      <n-form-item
        :show-feedback="false"
        :label="$t(`documentPage.command.form.financeType`)"
        path="financeType"
      >
        <n-select
          :disabled="loading"
          v-model:value="item.type"
          filterable
          :options="componentStore.financialAssistance"
          label-field="name"
          value-field="id"
          :loading="componentStore.enumLoading"
          @update:value="onChange($event, item, idx)"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-4">
      <n-form-item
        :show-feedback="false"
        :label="$t(`documentPage.command.form.amount`)"
        path="amount"
      >
        <n-input
          class="w-full"
          :allow-input="Utils.onlyAllowNumber"
          v-model:value="item.amount"
          :loading="loading"
        />
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
          v-model:value="base"
          clearable
        />
      </n-form-item>
    </div>
  </div>
</template>
