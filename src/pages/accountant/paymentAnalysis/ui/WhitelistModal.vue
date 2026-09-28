<script setup>
  import { UIModal, UIUpload, UIYearMonth } from '@/components/index.js'
  import { useComponentStore, usePaymentAnalysisStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = usePaymentAnalysisStore()
  const componentStore = useComponentStore()

  // Whitelist faqat quyidagi to'lov kodlari uchun yuklanadi.
  const payingCodeOptions = [
    { label: '47', value: '47' },
    { label: '50', value: '50' },
    { label: '55', value: '55' },
    { label: '270', value: '270' }
  ]

  onMounted(() => {
    if (componentStore.organizationList.length === 0) componentStore._organizations()
  })

  const onSubmit = () => {
    if (!store.whitelistPayload.organization_id) {
      $Toast.warning(t('paymentAnalysis.toast.requiredOrganization'))
      return
    }
    if (!store.whitelistPayload.paying_code) {
      $Toast.warning(t('paymentAnalysis.toast.requiredPayingCode'))
      return
    }
    if (store.whitelistPayload.file.length === 0) {
      $Toast.warning(t('rules.requiredFileField'))
      return
    }
    store._uploadWhitelist()
  }
</script>

<template>
  <UIModal
    :width="600"
    v-model:visible="store.whitelistVisible"
    :title="$t('paymentAnalysis.whitelist.title')"
  >
    <div class="grid grid-cols-12 gap-x-2">
      <div class="col-span-12 mb-2">
        <label class="text-xs text-textColor3 mb-1 block">{{ $t('content.organization') }}</label>
        <n-select
          v-model:value="store.whitelistPayload.organization_id"
          :options="componentStore.organizationList"
          :loading="componentStore.organizationLoading"
          label-field="name"
          value-field="id"
          filterable
          clearable
        />
      </div>
      <div class="col-span-12 mb-2">
        <label class="text-xs text-textColor3 mb-1 block">{{ $t('content.year') }} / {{ $t('content.month') }}</label>
        <UIYearMonth
          v-model:year="store.whitelistPayload.year"
          v-model:month="store.whitelistPayload.month"
          :clearable="false"
        />
      </div>
      <div class="col-span-12 mb-2">
        <label class="text-xs text-textColor3 mb-1 block">{{ $t('paymentAnalysis.filter.payingCode') }}</label>
        <n-select
          v-model:value="store.whitelistPayload.paying_code"
          :options="payingCodeOptions"
          clearable
        />
      </div>
      <UIUpload
        class="col-span-12 mb-[40px]"
        v-model:files="store.whitelistPayload.file"
        :multiple="false"
      />
    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.whitelistVisible = false" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.whitelistLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </UIModal>
</template>

<style scoped></style>
