<script setup>
  import {
    DocumentArrowUp20Regular,
    PeopleCheckmark20Filled,
    ArrowSync20Filled,
    ArrowCircleDown32Regular,
    PersonAdd20Filled
  } from '@vicons/fluent'
  import { UIPageFilter, UISelect, UIYearMonth } from '@/components/index.js'
  import {
    useAccountStore,
    useComponentStore,
    usePaymentAnalysisStore
  } from '@/store/modules/index.js'

  const store = usePaymentAnalysisStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  // Tashkilot tree (single-select) uchun holat.
  const orgModel = ref([])
  const orgCheck = ref([])

  // To'lov kodlari — tasdiqlangan xodimlar (whitelist) kesimida ishlatiladigan kodlar.
  const payingCodeOptions = [
    { label: '47', value: '47' },
    { label: '50', value: '50' },
    { label: '55', value: '55' },
    { label: '270', value: '270' }
  ]

  const filterEvent = () => {
    if (!accStore.checkAction(accStore.pn.economistPaymentAnalysisRead)) return
    store._filter()
  }

  const beforeShow = (v) => {
    if (!v) return
    if (componentStore.structureList.length === 0) componentStore._structures()
  }

  // Tashkilot tanlanganda (single-select) — organization_id ni yangilaymiz.
  const onChangeOrg = (list) => {
    orgModel.value = list
    store.params.organization_id = list[0]?.id ?? null
    filterEvent()
  }

  const resetFilter = () => {
    orgModel.value = []
    orgCheck.value = []
    store.params.organization_id = null
    store.params.paying_code = null
    store.onlyFlagged = false
    filterEvent()
  }

  const filterCount = computed(() => {
    return (
      Number(Boolean(store.params.organization_id)) + Number(Boolean(store.params.paying_code))
    )
  })

  const onBlanka = () => {
    if (!accStore.checkAction(accStore.pn.economistPaymentAnalysisWrite)) return
    store.openBlanka()
  }

  const onAddRow = () => {
    if (!accStore.checkAction(accStore.pn.economistPaymentAnalysisWrite)) return
    store.openAddRow()
  }

  const onWhitelist = () => {
    if (!accStore.checkAction(accStore.pn.economistPaymentAnalysisWrite)) return
    store.openWhitelist()
  }

  const onAnalyze = () => {
    if (!accStore.checkAction(accStore.pn.economistPaymentAnalysisWrite)) return
    store._analyze()
  }

  const onExport = () => {
    if (!accStore.checkAction(accStore.pn.economistPaymentAnalysisWrite)) return
    store._export()
  }
</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    :search-loading="store.loading"
    :show-add-button="false"
    @onSearch="filterEvent"
    @show="beforeShow"
    @onClear="resetFilter"
    :filter-count="filterCount"
  >
    <template #filterAction>
      <div class="max-w-[160px]">
        <UIYearMonth
          v-model:year="store.params.year"
          v-model:month="store.params.month"
          :clearable="false"
          @change="filterEvent"
        />
      </div>

      <n-button
        v-if="accStore.checkPermission(accStore.pn.economistPaymentAnalysisWrite)"
        @click="onAddRow"
        type="default"
        class="w-full! md:w-auto!"
      >
        {{ $t('paymentAnalysis.buttons.addRow') }}
        <template #icon>
          <PersonAdd20Filled />
        </template>
      </n-button>

      <n-button
        v-if="accStore.checkPermission(accStore.pn.economistPaymentAnalysisWrite)"
        @click="onWhitelist"
        type="default"
        class="w-full! md:w-auto!"
      >
        {{ $t('paymentAnalysis.buttons.whitelist') }}
        <template #icon>
          <PeopleCheckmark20Filled />
        </template>
      </n-button>

      <n-button
        v-if="accStore.checkPermission(accStore.pn.economistPaymentAnalysisWrite)"
        @click="onAnalyze"
        :loading="store.analyzeLoading"
        type="info"
        class="w-full! md:w-auto!"
      >
        {{ $t('paymentAnalysis.buttons.analyze') }}
        <template #icon>
          <ArrowSync20Filled />
        </template>
      </n-button>

      <n-button
        v-if="accStore.checkPermission(accStore.pn.economistPaymentAnalysisWrite)"
        @click="onExport"
        :loading="store.exportLoading"
        type="success"
        class="w-full! md:w-auto!"
      >
        {{ $t('paymentAnalysis.buttons.export') }}
        <template #icon>
          <ArrowCircleDown32Regular />
        </template>
      </n-button>

      <n-button
        v-if="accStore.checkPermission(accStore.pn.economistPaymentAnalysisWrite)"
        @click="onBlanka"
        type="primary"
        class="w-full! md:w-auto!"
      >
        {{ $t('paymentAnalysis.buttons.blanka') }}
        <template #icon>
          <DocumentArrowUp20Regular />
        </template>
      </n-button>
    </template>

    <template #filterContent>
      <label class="mt-3 text-xs text-textColor3 mb-1 font-medium">{{
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
        @onSubmit="filterEvent"
      />

      <label class="mt-3 text-xs text-textColor3 mb-1 font-medium block">{{
        $t('paymentAnalysis.filter.payingCode')
      }}</label>
      <n-select
        v-model:value="store.params.paying_code"
        :options="payingCodeOptions"
        @update:value="filterEvent"
        clearable
      />

      <label class="mt-3 text-xs text-textColor3 mb-1 font-medium block">{{
        $t('paymentAnalysis.filter.onlyFlagged')
      }}</label>
      <n-switch v-model:value="store.onlyFlagged" @update:value="filterEvent" />
    </template>
  </UIPageFilter>
</template>

<style scoped></style>
