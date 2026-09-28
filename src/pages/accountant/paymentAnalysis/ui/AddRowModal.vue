<script setup>
  import { UIModal } from '@/components/index.js'
  import { useComponentStore, usePaymentAnalysisStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = usePaymentAnalysisStore()
  const componentStore = useComponentStore()

  // Barcha 9 ta to'lov kodi (string qiymatlar).
  const payingCodeOptions = [
    { label: '47', value: '47' },
    { label: '11', value: '11' },
    { label: '12', value: '12' },
    { label: '50', value: '50' },
    { label: '55', value: '55' },
    { label: '250', value: '250' },
    { label: '263', value: '263' },
    { label: '270', value: '270' },
    { label: '281', value: '281' }
  ]

  // Tanlangan worker_position id (select value-field="id") — undan `worker.id` olamiz.
  const workerPositionId = ref(null)

  // Xodim ro'yxatini filtr tanlangan korxona bo'yicha yuklaymiz.
  const loadWorkers = () => {
    componentStore.workerList = []
    componentStore.workerParams.page = 1
    componentStore.workerParams.search = null
    componentStore.workerParams.organization_id = store.params.organization_id ?? null
    if (store.params.organization_id) componentStore._workers()
  }

  // Select ochilganda ro'yxat bo'sh bo'lsa — yuklaymiz (org kesimida).
  const onOpenWorker = (v) => {
    if (!v) return
    if (componentStore.workerList.length === 0) loadWorkers()
  }

  // Tanlangan option'dan haqiqiy xodim id (worker.id) — `id` esa worker_position id.
  const onSelectWorker = (value, option) => {
    workerPositionId.value = value
    store.addRowPayload.worker_id = option?.worker?.id ?? null
  }

  watch(
    () => store.addRowVisible,
    (v) => {
      if (v) {
        workerPositionId.value = null
        loadWorkers()
      }
    }
  )

  const onSubmit = () => {
    if (!workerPositionId.value || !store.addRowPayload.worker_id) {
      $Toast.warning(t('paymentAnalysis.toast.requiredWorker'))
      return
    }
    store._addRow()
  }
</script>

<template>
  <UIModal
    :width="600"
    v-model:visible="store.addRowVisible"
    :title="$t('paymentAnalysis.addRow.title')"
  >
    <div class="grid grid-cols-12 gap-x-2">
      <div class="col-span-12 mb-2">
        <label class="text-xs text-textColor3 mb-1 block">{{ $t('paymentAnalysis.addRow.worker') }}</label>
        <n-select
          v-model:value="workerPositionId"
          filterable
          remote
          :options="componentStore.workerList"
          :placeholder="$t('content.searchWorker')"
          label-field="name"
          value-field="id"
          :render-label="UIHelper.selectRender.label"
          :render-tag="UIHelper.selectRender.value"
          :loading="componentStore.workerLoading"
          @scroll="componentStore.onScrollWorker"
          @search="componentStore.onSearchWorker"
          @open="onOpenWorker"
          @update:value="onSelectWorker"
        />
      </div>
      <div class="col-span-12 mb-2">
        <label class="text-xs text-textColor3 mb-1 block">{{ $t('paymentAnalysis.addRow.payingCode') }}</label>
        <n-select
          v-model:value="store.addRowPayload.paying_code"
          :options="payingCodeOptions"
          clearable
        />
      </div>
      <div class="col-span-12 mb-[40px]">
        <label class="text-xs text-textColor3 mb-1 block">{{ $t('paymentAnalysis.addRow.summa') }}</label>
        <n-input-number
          class="w-full"
          v-model:value="store.addRowPayload.summa"
          :min="0"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.addRowVisible = false" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.addRowLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </UIModal>
</template>

<style scoped></style>
