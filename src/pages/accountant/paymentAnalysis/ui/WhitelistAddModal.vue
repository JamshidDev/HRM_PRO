<script setup>
  import { UIModal } from '@/components/index.js'
  import { useComponentStore, usePaymentAnalysisStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = usePaymentAnalysisStore()
  const componentStore = useComponentStore()

  // Whitelist faqat quyidagi to'lov kodlari uchun (47/50/55/270).
  const payingCodeOptions = [
    { label: '47', value: '47' },
    { label: '50', value: '50' },
    { label: '55', value: '55' },
    { label: '270', value: '270' }
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
    store.whitelistAddPayload.worker_id = option?.worker?.id ?? null
  }

  watch(
    () => store.whitelistAddVisible,
    (v) => {
      if (v) {
        workerPositionId.value = null
        loadWorkers()
      }
    }
  )

  const onSubmit = () => {
    if (!workerPositionId.value || !store.whitelistAddPayload.worker_id) {
      $Toast.warning(t('paymentAnalysis.toast.requiredWorker'))
      return
    }
    store._addWhitelistRow()
  }
</script>

<template>
  <UIModal
    :width="600"
    v-model:visible="store.whitelistAddVisible"
    :title="$t('paymentAnalysis.whitelistAdd.title')"
  >
    <div class="grid grid-cols-12 gap-x-2">
      <div class="col-span-12 mb-2">
        <label class="text-xs text-textColor3 mb-1 block">{{
          $t('paymentAnalysis.addRow.worker')
        }}</label>
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
      <div class="col-span-12 mb-[40px]">
        <label class="text-xs text-textColor3 mb-1 block">{{
          $t('paymentAnalysis.addRow.payingCode')
        }}</label>
        <n-select
          v-model:value="store.whitelistAddPayload.paying_code"
          :options="payingCodeOptions"
          clearable
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.whitelistAddVisible = false" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.whitelistAddLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </UIModal>
</template>

<style scoped></style>
