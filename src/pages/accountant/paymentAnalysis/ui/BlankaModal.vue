<script setup>
  import { UIModal, UIUpload, UIYearMonth } from '@/components/index.js'
  import { useComponentStore, usePaymentAnalysisStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = usePaymentAnalysisStore()
  const componentStore = useComponentStore()

  onMounted(() => {
    if (componentStore.organizationList.length === 0) componentStore._organizations()
  })

  const onSubmit = () => {
    if (!store.blankaPayload.organization_id) {
      $Toast.warning(t('paymentAnalysis.toast.requiredOrganization'))
      return
    }
    if (store.blankaPayload.file.length === 0) {
      $Toast.warning(t('rules.requiredFileField'))
      return
    }
    store._uploadBlanka()
  }
</script>

<template>
  <UIModal
    :width="600"
    v-model:visible="store.blankaVisible"
    :title="$t('paymentAnalysis.blanka.title')"
  >
    <div class="grid grid-cols-12 gap-x-2">
      <div class="col-span-12 mb-2">
        <label class="text-xs text-textColor3 mb-1 block">{{ $t('content.organization') }}</label>
        <n-select
          v-model:value="store.blankaPayload.organization_id"
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
          v-model:year="store.blankaPayload.year"
          v-model:month="store.blankaPayload.month"
          :clearable="false"
        />
      </div>
      <UIUpload
        class="col-span-12 mb-[40px]"
        v-model:files="store.blankaPayload.file"
        :multiple="false"
      />
    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.blankaVisible = false" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.blankaLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </UIModal>
</template>

<style scoped></style>
