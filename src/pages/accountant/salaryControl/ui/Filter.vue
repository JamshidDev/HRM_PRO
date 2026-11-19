<script setup>
  import {
    OnesCodeFilter,
    UIPageFilter,
    UISelect,
    UIYearMonth
  } from '@/components/index.js'
  import {
    useAccountStore,
    useComponentStore,
    useSalaryControlStore
  } from '@/store/modules/index.js'

  const store = useSalaryControlStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  const filterEvent = () => {
    if (!accStore.checkAction(accStore.pn.economistSalaryControlRead)) return
    store._filter()
  }

  // Ko'p korxona tanlash (select-all daraxt) — accountant/dashboard filtri bilan bir xil.
  const onChangeStructure = (v) => {
    store.params.organizations = v
    store.params.ones_code = null // korxona o'zgardi — 1C kod filtrini bekor qilamiz
    filterEvent()
  }

  // Yil boshidan joriy oygacha (kumulyativ) — butun dashboard shu yil 1-oydan
  // tanlangan oygacha jamlanadi.
  const onToggleCumulative = (v) => {
    store.params.cumulative = v
    filterEvent()
  }

  const selectedOrgIds = computed(() =>
    (store.params.organizations || []).map((o) => o?.id ?? o)
  )

  const filterCount = computed(
    () =>
      Number(Boolean(store.params.organizations.length)) +
      Number(Boolean(store.params.ones_code)) +
      Number(Boolean(store.params.cumulative))
  )

  const resetFilter = () => {
    store.params.organizations = []
    store.params.ones_code = null
    store.params.cumulative = false
    store.structureCheck2 = []
    filterEvent()
  }

  const beforeShow = (v) => {
    if (!v) return
    if (componentStore.structureList.length === 0) componentStore._structures()
  }

  // Strukturani OLDINDAN yuklaymiz — korxona dropdown'i darhol to'la ochilsin.
  onMounted(() => {
    if (componentStore.structureList.length === 0) componentStore._structures()
  })
</script>

<template>
  <UIPageFilter
    :show-search-input="false"
    :search-loading="store.summaryLoading"
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
    </template>

    <template #filterContent>
      <label class="mt-3 text-xs text-textColor3 mb-1 font-medium">{{
        $t('content.organization')
      }}</label>
      <UISelect
        placement="bottom-start"
        :flip="false"
        body-height="min(320px, 42vh)"
        :options="componentStore.structureList"
        :model-v="store.params.organizations"
        @defaultValue="(v) => (store.params.organizations = v)"
        @updateModel="onChangeStructure"
        :checked-val="store.structureCheck2"
        @updateCheck="(v) => (store.structureCheck2 = v)"
        :loading="componentStore.structureLoading"
        v-model:search="componentStore.structureParams.search"
        @onSearch="componentStore._structures"
        @onSubmit="filterEvent"
      />
      <OnesCodeFilter
        :org-ids="selectedOrgIds"
        v-model="store.params.ones_code"
        @change="filterEvent"
      />
      <div class="mt-4 flex items-center justify-between gap-3">
        <label class="text-xs text-textColor3 font-medium !mb-0">
          {{ $t('salaryControl.employees.ytd') }}
        </label>
        <n-switch
          size="small"
          :value="store.params.cumulative"
          @update:value="onToggleCumulative"
        />
      </div>
    </template>
  </UIPageFilter>
</template>

<style scoped></style>
