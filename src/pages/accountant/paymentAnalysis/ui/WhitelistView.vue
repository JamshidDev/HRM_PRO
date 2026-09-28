<script setup>
  import { UITable, UISelect, UIYearMonth } from '@/components/index.js'
  import {
    useAccountStore,
    useComponentStore,
    usePaymentAnalysisStore
  } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = usePaymentAnalysisStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  // Tashkilot tree (single-select) uchun holat — analiz tabidagi Filter bilan
  // bir xil `store.params.organization_id` ni boshqaradi (umumiy davr/korxona).
  const orgModel = ref([])
  const orgCheck = ref([])

  // Whitelist faqat quyidagi to'lov kodlari uchun yuklanadi.
  const payingCodeOptions = [
    { label: '47', value: '47' },
    { label: '50', value: '50' },
    { label: '55', value: '55' },
    { label: '270', value: '270' }
  ]

  const columns = computed(() => [
    {
      key: 'fio',
      title: t('paymentAnalysis.table.fio'),
      minWidth: 240
    },
    {
      key: 'pinfl',
      title: t('paymentAnalysis.table.pinfl'),
      width: 160
    },
    {
      key: 'paying_code',
      title: t('paymentAnalysis.table.payingCode'),
      width: 110,
      align: 'center'
    }
  ])

  const reloadEvent = () => {
    if (!accStore.checkAction(accStore.pn.economistPaymentAnalysisRead)) return
    store._whitelistFilter()
  }

  // Tashkilot tanlanganda (single-select) — umumiy organization_id ni yangilaymiz.
  const onChangeOrg = (list) => {
    orgModel.value = list
    store.params.organization_id = list[0]?.id ?? null
    reloadEvent()
  }

  const onChange = (v) => {
    store.whitelistListParams.page = v.page
    store.whitelistListParams.per_page = v.per_page
    store._whitelistIndex()
  }

  onMounted(() => {
    if (componentStore.structureList.length === 0) componentStore._structures()
  })
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Umumiy korxona + davr (analiz tabi bilan bir xil store.params) -->
    <div class="grid grid-cols-12 gap-x-3 gap-y-2 items-end">
      <div class="col-span-12 md:col-span-6">
        <label class="text-xs text-textColor3 mb-1 font-medium block">{{
          $t('content.organization')
        }}</label>
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
          @onSubmit="reloadEvent"
        />
      </div>
      <div class="col-span-12 md:col-span-3">
        <label class="text-xs text-textColor3 mb-1 font-medium block">{{
          $t('content.month')
        }}</label>
        <UIYearMonth
          v-model:year="store.params.year"
          v-model:month="store.params.month"
          :clearable="false"
          @change="reloadEvent"
        />
      </div>
    </div>

    <div class="grid grid-cols-12 gap-x-2">
      <div class="col-span-12 md:col-span-4 mb-2">
        <label class="text-xs text-textColor3 mb-1 block">{{
          $t('paymentAnalysis.filter.payingCode')
        }}</label>
        <n-select
          v-model:value="store.whitelistListParams.paying_code"
          :options="payingCodeOptions"
          @update:value="store._whitelistFilter"
          clearable
        />
      </div>
      <div class="col-span-12 md:col-span-8 mb-2">
        <label class="text-xs text-textColor3 mb-1 block">{{ $t('content.search') }}</label>
        <n-input
          v-model:value="store.whitelistListParams.search"
          clearable
          @keyup.enter="store._whitelistFilter"
          @clear="store._whitelistFilter"
        />
      </div>
    </div>

    <UITable
      :columns="columns"
      :data="store.whitelistList"
      :loading="store.whitelistListLoading"
      :page="store.whitelistListParams.page"
      :per-page="store.whitelistListParams.per_page"
      :total="store.whitelistListTotal"
      storage-key="accountant-payment-whitelist-list"
      @change-page="onChange"
    />
  </div>
</template>

<style scoped></style>
