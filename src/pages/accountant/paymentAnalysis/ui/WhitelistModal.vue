<script setup>
  import { UIModal, UISelect, UIUpload, UIYearMonth } from '@/components/index.js'
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

  // Tashkilot tree (single-select) + payload organization_id bilan sinxron.
  const orgModel = ref([])
  const orgCheck = ref([])
  const findNode = (list, id) => {
    for (const n of list || []) {
      if (n.id === id) return n
      const f = findNode(n.children, id)
      if (f) return f
    }
    return null
  }
  const syncOrg = () => {
    const id = store.whitelistPayload.organization_id
    const node = id ? findNode(componentStore.structureList, id) : null
    orgModel.value = node ? [node] : []
  }
  const onChangeOrg = (list) => {
    orgModel.value = list
    store.whitelistPayload.organization_id = list[0]?.id ?? null
  }

  onMounted(async () => {
    if (componentStore.structureList.length === 0) await componentStore._structures()
    syncOrg()
  })
  watch(
    () => store.whitelistVisible,
    (v) => {
      if (v) syncOrg()
    }
  )

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
        <UISelect
          :options="componentStore.structureList"
          :multiple="false"
          :model-v="orgModel"
          @updateModel="onChangeOrg"
          :checked-val="orgCheck"
          @updateCheck="(v) => (orgCheck = v)"
          :loading="componentStore.structureLoading"
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
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
