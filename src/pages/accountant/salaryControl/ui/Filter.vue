<script setup>
  import { OnesCodeFilter, UISelect, UIYearMonth } from '@/components/index.js'
  import {
    useAccountStore,
    useComponentStore,
    useSalaryControlStore
  } from '@/store/modules/index.js'
  import { Dismiss16Regular } from '@vicons/fluent'

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

  const selectedOrgIds = computed(() =>
    (store.params.organizations || []).map((o) => o?.id ?? o)
  )

  const hasFilter = computed(
    () => Boolean(store.params.organizations.length) || Boolean(store.params.ones_code)
  )

  const resetFilter = () => {
    store.params.organizations = []
    store.params.ones_code = null
    store.structureCheck2 = []
    filterEvent()
  }

  // Strukturani OLDINDAN yuklaymiz — korxona tanlash dropdown'i darhol to'la ochilsin.
  onMounted(() => {
    if (componentStore.structureList.length === 0) componentStore._structures()
  })
</script>

<template>
  <!-- Inline filtr paneli — popover EMAS. Bu sahifa korxona tanlashni majburiy qiladi,
       shuning uchun filtr doim ko'rinib turadi (va popover joylashuvi muammosi yo'q). -->
  <div class="sc-filterbar">
    <div class="sc-f sc-f--period">
      <label>{{ $t('content.date') }}</label>
      <UIYearMonth
        v-model:year="store.params.year"
        v-model:month="store.params.month"
        :clearable="false"
        @change="filterEvent"
      />
    </div>

    <div class="sc-f sc-f--org">
      <label>{{ $t('content.organization') }}</label>
      <UISelect
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
    </div>

    <!-- OnesCodeFilter o'z labelini beradi (salary1c.onesCode.filterLabel). -->
    <div class="sc-f sc-f--code">
      <OnesCodeFilter
        :org-ids="selectedOrgIds"
        v-model="store.params.ones_code"
        @change="filterEvent"
      />
    </div>

    <button v-if="hasFilter" type="button" class="sc-f-clear" @click="resetFilter">
      <n-icon :size="15"><Dismiss16Regular /></n-icon>
      <span>{{ $t('content.clearFilters') }}</span>
    </button>
  </div>
</template>

<style scoped>
  .sc-filterbar {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 12px 16px;
    margin-bottom: 16px;
    padding: 12px 14px;
    background: var(--fig-block-bg);
    border: 0.8px solid var(--fig-blue-300);
    border-radius: 14px;
  }
  .sc-f {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }
  .sc-f label {
    font-size: 12px;
    font-weight: 500;
    color: var(--fig-text-tertiary);
  }
  .sc-f--period {
    width: 170px;
    flex: none;
  }
  .sc-f--org {
    flex: 1 1 280px;
    min-width: 240px;
  }
  .sc-f--code {
    flex: 1 1 220px;
    min-width: 200px;
  }
  /* UISelect/OnesCodeFilter triggerlari to'liq kenglikda. */
  .sc-f :deep(.n-base-selection),
  .sc-f :deep(.ui__structure-input),
  .sc-f :deep(.n-select) {
    width: 100%;
  }
  .sc-f-clear {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 34px;
    padding: 0 12px;
    border: 0.8px solid var(--fig-blue-300);
    border-radius: 10px;
    background: var(--fig-bg-secondary);
    color: var(--fig-text-red);
    font: inherit;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.15s ease;
  }
  .sc-f-clear:hover {
    border-color: var(--fig-icon-red);
  }
</style>
