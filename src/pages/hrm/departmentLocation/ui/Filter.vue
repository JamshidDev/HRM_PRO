<script setup>
  import { UIPageFilter, UISelect } from '@/components/index.js'
  import { useComponentStore, useDepartmentLocationStore } from '@/store/modules/index.js'
  import { ArrowLeft20Filled } from '@vicons/fluent'

  const store = useDepartmentLocationStore()
  const componentStore = useComponentStore()

  const isDepartmentsTab = computed(() => store.activeTab === 'departments')

  const currentParams = computed(() =>
    isDepartmentsTab.value ? store.params : store.locationParams
  )

  const currentLoading = computed(() =>
    isDepartmentsTab.value ? store.loading : store.locationLoading
  )

  const fetchData = () => {
    if (isDepartmentsTab.value) {
      store._index()
    } else {
      store._locationIndex()
    }
  }

  const onSearch = () => {
    currentParams.value.page = 1
    fetchData()
  }

  const filterEvent = () => {
    currentParams.value.page = 1
    fetchData()
  }

  const filterCount = computed(
    () => Number(Boolean(currentParams.value.organizations.length))
  )

  const beforeShow = () => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  }

  const onChangeStructure = (v) => {
    currentParams.value.organizations = v
    filterEvent()
  }

  const resetFilter = () => {
    currentParams.value.organizations = []
    filterEvent()
  }

  const goBack = () => {
    store.activeTab = 'departments'
    store.resetLocationParams()
    store._index()
  }
</script>

<template>
  <UIPageFilter
    v-model:search="currentParams.search"
    @onSearch="onSearch"
    @show="beforeShow"
    @onClear="resetFilter"
    :filter-count="filterCount"
    :search-loading="currentLoading"
    :show-add-button="false"
    :show-filter-button="isDepartmentsTab"
  >
    <template #filterAction>
      <!-- Back button (locations tabda) -->
      <n-button
        v-if="!isDepartmentsTab"
        secondary
        @click="goBack"
      >
        <template #icon>
          <n-icon>
            <ArrowLeft20Filled />
          </n-icon>
        </template>
        {{ $t('content.back') }}
      </n-button>
    </template>
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{
        $t('actionLog.table.structure')
      }}</label>
      <UISelect
        :options="componentStore.structureList"
        :modelV="currentParams.organizations"
        @defaultValue="(v) => (currentParams.organizations = v)"
        @updateModel="onChangeStructure"
        :loading="componentStore.structureLoading"
        v-model:search="componentStore.structureParams.search"
        @onSearch="componentStore._structures"
        @onSubmit="filterEvent"
      />
    </template>
  </UIPageFilter>
</template>
