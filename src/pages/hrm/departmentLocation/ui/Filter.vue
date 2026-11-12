<script setup>
  import { UIPageFilter, UISegmentTabs, UISelect, UIDepartmentSelect } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useComponentStore, useDepartmentLocationStore } from '@/store/modules/index.js'

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

  const isLocationsTab = computed(() => store.activeTab === 'locations')
  const isWorkersTab = computed(() => store.activeTab === 'workers')

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

  // «Joy holati» — `has_location` / `is_free` param'lari (`store.applyLocationState`).
  const locationStateOptions = computed(() => [
    { value: 'areas', label: t('departmentLocationPage.filter.hasLocation') },
    { value: 'unassigned', label: t('departmentLocationPage.filter.noLocation') },
    { value: 'free', label: t('departmentLocationPage.form.freeMode') }
  ])
  const locationState = computed({
    get: () => store.locationState,
    set: (v) => {
      store.applyLocationState(currentParams.value, v ?? null)
      filterEvent()
    }
  })

  // Bo'lim joylashuvlari: turi bo'yicha (backend hali qo'llamaydi — store'dagi izohga qarang).
  const locationTypeOptions = computed(() => [
    { value: 'point', label: t('departmentLocationPage.form.coordinate') },
    { value: 'area', label: t('departmentLocationPage.form.area') },
    { value: 'free', label: t('departmentLocationPage.form.freeMode') }
  ])
  const locationType = computed({
    get: () => {
      const p = store.locationParams
      if (p.is_free === true) return 'free'
      if (p.geo_type === true) return 'area'
      if (p.geo_type === false) return 'point'
      return null
    },
    set: (v) => {
      const p = store.locationParams
      p.is_free = v === 'free' ? true : null
      p.geo_type = v === 'area' ? true : v === 'point' ? false : null
      filterEvent()
    }
  })

  const filterCount = computed(() => {
    const p = currentParams.value
    if (isLocationsTab.value) return Number(locationType.value !== null)
    return (
      Number(Boolean(p.organizations.length)) +
      Number(store.locationState !== null) +
      Number(isWorkersTab.value && Boolean(p.department_id))
    )
  })

  const beforeShow = () => {
    if (isLocationsTab.value) return
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  }

  const onChangeStructure = (v) => {
    currentParams.value.organizations = v
    if (isWorkersTab.value) store.workerParams.department_id = null
    filterEvent()
  }

  const resetFilter = () => {
    const p = currentParams.value
    if (isLocationsTab.value) {
      p.geo_type = null
      p.is_free = null
    } else {
      p.organizations = []
      store.structureCheck = []
      store.applyLocationState(p, null)
      if (isWorkersTab.value) p.department_id = null
    }
    filterEvent()
  }

  // Bo'lim joylaridan qaytish endi ro'yxat tepasidagi breadcrumb'da (`LocationTable.vue`).
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
    :popover-style="{ width: '520px', maxWidth: 'calc(100vw - 32px)', padding: '0', borderRadius: '20px' }"
  >
    <!-- Bo'limlar | Xodimlar — «Filterlar» tugmasi yonida (senior dev fikri) -->
    <template #filterAction>
      <UISegmentTabs
        :tabs="viewTabs"
        :model-value="viewTab"
        @update:model-value="(v) => emit('change-tab', v)"
      />
    </template>
    <template #filterContent>
      <!-- Bo'lim joylashuvlari: faqat turi (ro'yxat bitta bo'limniki) -->
      <div v-if="isLocationsTab" class="ui-filter-grid grid grid-cols-12 gap-x-5 gap-y-4">
        <div class="col-span-12">
          <label>{{ $t('departmentLocationPage.table.geoType') }}</label>
          <n-select
            v-model:value="locationType"
            :options="locationTypeOptions"
            :placeholder="$t('departmentLocationPage.filter.all')"
            clearable
          />
        </div>
      </div>

      <div v-else class="ui-filter-grid grid grid-cols-12 gap-x-5 gap-y-4">
        <div class="col-span-12" :class="isWorkersTab && 'md:col-span-6'">
          <label>{{ $t('actionLog.table.structure') }}</label>
          <UISelect
            :options="componentStore.structureList"
            :model-v="currentParams.organizations"
            @defaultValue="(v) => (currentParams.organizations = v)"
            @updateModel="onChangeStructure"
            :checked-val="store.structureCheck"
            @updateCheck="(v) => (store.structureCheck = v)"
            :loading="componentStore.structureLoading"
            v-model:search="componentStore.structureParams.search"
            @onSearch="componentStore._structures"
            @onSubmit="filterEvent"
          />
        </div>
        <div v-if="isWorkersTab" class="col-span-12 md:col-span-6">
          <label>{{ $t('departmentLocationPage.table.department') }}</label>
          <UIDepartmentSelect
            v-model="store.workerParams.department_id"
            :organization="store.workerParams.organizations"
            :placeholder="$t('departmentLocationPage.filter.all')"
            @update:model-value="filterEvent"
          />
        </div>
        <div class="col-span-12">
          <label>{{ $t('departmentLocationPage.filter.locationState') }}</label>
          <n-select
            v-model:value="locationState"
            :options="locationStateOptions"
            :placeholder="$t('departmentLocationPage.filter.all')"
            clearable
          />
        </div>
      </div>
    </template>
  </UIPageFilter>
</template>
