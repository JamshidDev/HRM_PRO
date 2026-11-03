<script setup>
  import { computed } from 'vue'
  import { UIPageFilter, UISegmentTabs, UISelect } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useComponentStore, useDepartmentLocationStore } from '@/store/modules/index.js'
  import { ArrowLeft20Filled, Building20Regular } from '@vicons/fluent'

  const store = useDepartmentLocationStore()
  const componentStore = useComponentStore()

  const { t } = i18n.global
  const emit = defineEmits(['change-tab'])

  // Bo'lim joylari ro'yxati — «Bo'limlar» tabining ichki ko'rinishi.
  const viewTabs = computed(() => [
    { id: 'departments', name: t('departmentLocationPage.tabs.departments') },
    { id: 'workers', name: t('departmentLocationPage.tabs.workers') }
  ])
  const viewTab = computed(() => (store.activeTab === 'locations' ? 'departments' : store.activeTab))

  const isDepartmentsTab = computed(() => store.activeTab === 'departments')
  const isLocationsTab = computed(() => store.activeTab === 'locations')

  const byTab = {
    departments: { params: () => store.params, loading: () => store.loading, load: () => store._index() },
    locations: { params: () => store.locationParams, loading: () => store.locationLoading, load: () => store._locationIndex() },
    workers: { params: () => store.workerParams, loading: () => store.workerLoading, load: () => store._workerIndex() }
  }
  const tab = computed(() => byTab[store.activeTab] ?? byTab.departments)

  const currentParams = computed(() => tab.value.params())

  const currentLoading = computed(() => tab.value.loading())

  const fetchData = () => tab.value.load()

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
    :show-filter-button="!isLocationsTab"
  >
    <template #filterSearch>
      <UISegmentTabs
        class="ml-2"
        :tabs="viewTabs"
        :model-value="viewTab"
        @update:model-value="(v) => emit('change-tab', v)"
      />
    </template>
    <template #filterAction>
      <!-- Back button & Department breadcrumb badge (locations tabda) -->
      <div v-if="isLocationsTab" class="flex items-center gap-2">
        <div
          v-if="store.selectedDepartment"
          class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs"
        >
          <n-icon size="15" class="text-primary"><Building20Regular /></n-icon>
          <span class="text-textColor3 font-normal">{{ $t('departmentLocationPage.table.department') }}:</span>
          <span class="font-semibold text-primary truncate max-w-[200px]">
            {{ store.selectedDepartment.name }}
          </span>
        </div>
        <n-button
          secondary
          size="medium"
          @click="goBack"
          class="transition-all"
        >
          <template #icon>
            <n-icon>
              <ArrowLeft20Filled />
            </n-icon>
          </template>
          {{ $t('content.back') }}
        </n-button>
      </div>
    </template>
    <template #filterContent>
      <label class="mt-3 text-xs text-textColor3 mb-1 font-medium">{{
        $t('actionLog.table.structure')
      }}</label>
      <UISelect
        :options="componentStore.structureList"
        :modelV="currentParams.organizations"
        @defaultValue="(v) => (currentParams.organizations = v)"
        @updateModel="onChangeStructure"
        :checked-val="store.structureCheck"
        @updateCheck="(v) => (store.structureCheck = v)"
        :loading="componentStore.structureLoading"
        v-model:search="componentStore.structureParams.search"
        @onSearch="componentStore._structures"
        @onSubmit="filterEvent"
      />
    </template>
  </UIPageFilter>
</template>
