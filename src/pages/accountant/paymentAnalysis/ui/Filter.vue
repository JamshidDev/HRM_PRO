<script setup>
  import { ArrowSync20Filled, ArrowCircleDown32Regular } from '@vicons/fluent'
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

  // Tahlil qilinadigan barcha to'lov kodlari (hisobot jadvalidagi 9 tur).
  const payingCodeOptions = [
    { label: '11', value: '011' },
    { label: '12', value: '012' },
    { label: '47', value: '047' },
    { label: '50', value: '050' },
    { label: '55', value: '055' },
    { label: '250', value: '250' },
    { label: '263', value: '263' },
    { label: '270', value: '270' },
    { label: '281', value: '281' }
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
