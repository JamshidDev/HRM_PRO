<script setup>
  import { UIPageFilter, UISelect, UIYearMonth } from '@/components/index.js'
  import {
    useAccountStore,
    useComponentStore,
    useSalaryControlStore
  } from '@/store/modules/index.js'

  const store = useSalaryControlStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  // Tashkilot tree (single-select) uchun holat.
  const orgModel = ref([])
  const orgCheck = ref([])

  const filterEvent = () => {
    if (!accStore.checkAction(accStore.pn.economistSalaryControlRead)) return
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
    filterEvent()
  }

  const filterCount = computed(() => {
    return Number(Boolean(store.params.organization_id))
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
    </template>
  </UIPageFilter>
</template>

<style scoped></style>
