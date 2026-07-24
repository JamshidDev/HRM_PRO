<script setup>
  import {
    useComponentStore,
    useWorkerStore,
    useExportStore,
    useAccountStore
  } from '@/store/modules/index.js'
  import { UINSelect, UIPageFilter, UISelect } from '@/components/index.js'
  import { ChevronDown20Regular, ChevronUp20Regular } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'
  import { appPermissions, useDebounce } from '@/utils/index.js'
  import QuickActions from './QuickActions.vue'

  const store = useWorkerStore()
  const accStore = useAccountStore()
  const exportStore = useExportStore()
  const componentStore = useComponentStore()

  const debounceIndexEv = useDebounce(store._index, 1000)

  const fetchPosition = useDebounce(store._getFilterPositions)
  const onSearchPositionEv = (v) => {
    store.filterPosParams.search = v
    store._getFilterPositions()
  }

  const fetchDepartment = useDebounce(store._getFilterDepartments)
  const onSearchDepartmentEv = (v) => {
    store.filterDepParams.search = v
    store._getFilterDepartments()
  }

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.hrWorkersWrite)) return
    componentStore.checkUserVisible = true
  }

  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.hrWorkersRead)) return

    store.params.page = 1
    store._index()
  }

  const filterEvent = () => {
    componentStore.depParams.page = 1
    store.params.page = 1
    debounceIndexEv()
  }

  const onChangeStructure = (v) => {
    store.params.organizations = v
    store.params.departments = []
    store.params.positions = []

    store.filterPositionList = []
    store.filterDepartmentList = []

    filterEvent()

    if (v.length === 0) return

    store.filterDepParams.page = 1
    fetchDepartment()

    store.filterPosParams.page = 1
    fetchPosition()
  }

  const ageMode = ref('range')
  const ageFrom = ref(null)
  const ageTo = ref(null)
  const exactAge = ref(null)

  const blockDecimalKey = (e) => {
    if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault()
    }
  }

  const onChangeAgeRange = Utils.useDebounce(() => {
    store.params.age_start = ageFrom.value ?? undefined
    store.params.age_end = ageTo.value ?? undefined
    filterEvent()
  }, 500)

  const onChangeExactAge = Utils.useDebounce(() => {
    store.params.age_start = exactAge.value ?? undefined
    store.params.age_end = exactAge.value ?? undefined
    filterEvent()
  }, 500)

  const onChangeAgeMode = (v) => {
    if (v === 'exact') {
      store.params.age_start = exactAge.value ?? undefined
      store.params.age_end = exactAge.value ?? undefined
    } else {
      store.params.age_start = ageFrom.value ?? undefined
      store.params.age_end = ageTo.value ?? undefined
    }
    filterEvent()
  }

  const filterCount = computed(() => {
    return [
      store.params.organizations.length,
      store.params.departments.length,
      store.params.birthday,
      store.params.contract_type,
      store.params.position_type,
      store.params.positions.length,
      store.params.sex !== null,
      store.params.nationalities.length,
      store.params.country_id,
      store.params.region_id,
      store.params.city_id,
      store.params.current_region_id,
      store.params.current_city_id,
      store.params.marital_status,
      store.params.multiple_position,
      store.params.pension_age
    ].filter(Boolean).length
  })

  const clearFilter = () => {
    store.params.organizations = []
    store.params.departments = []
    store.params.positions = []
    store.params.birthday = null
    store.params.contract_type = null
    store.params.position_type = null
    store.params.sex = null
    store.params.nationalities = []
    store.params.country_id = null
    store.params.region_id = null
    store.params.city_id = null
    store.params.current_region_id = null
    store.params.current_city_id = null
    store.params.marital_status = null
    store.params.age_start = undefined
    store.params.age_end = undefined
    ageMode.value = 'range'
    ageFrom.value = null
    ageTo.value = null
    exactAge.value = null
    store.params.last_name = null
    store.params.first_name = null
    store.params.middle_name = null
    store.params.multiple_position = false
    store.params.pension_age = false

    filterEvent()
  }

  const onChangeDepartment = () => {
    componentStore.filterPositionParams.departments = store.params.departments.toString()
    store.params.positions = []
    store.filterPositionList = []
    fetchPosition()
    filterEvent()
  }

  const showAllFilters = ref(false)

  const onShow = (isOpen) => {
    if (!isOpen) {
      showAllFilters.value = false
      return
    }
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }

    if (componentStore.contractTypeList.length === 0) {
      componentStore._enums()
    }
    if (componentStore.positionCategory.length === 0) {
      componentStore._enumsAdmin()
    }
    if (componentStore.nationalityList.length === 0) {
      componentStore._nationality()
    }
    if (componentStore.countryList.length === 0) {
      componentStore._countries()
    }

    if (componentStore.regionList.length === 0) {
      componentStore._regions()
    }
  }

  const changeCountry = () => {
    filterEvent()
  }

  const onChangeRegion = () => {
    store.params.city_id = null
    store.districtList = []
    store.changeRegion(store.params.region_id)
    filterEvent()
  }

  const onChangeCurrentRegion = () => {
    store.params.current_city_id = null
    store.currentDistrictList = []
    store.changeCurrentRegion(store.params.current_region_id)
    filterEvent()
  }

  const onExport = () => {
    exportStore.visible = true
  }

  const onExportResume = () => {
    exportStore.resetResumePayload()
    exportStore.isExportingResume = !exportStore.isExportingResume
  }

  const onSubmitResumeExport = () => {
    exportStore.resumeModalVisible = true
  }

  const canWrite = computed(() => accStore.checkAction(appPermissions.hrExport))
  const canZip = computed(() => accStore.checkAction(appPermissions.exportWorkersZip))

  const defaultEv = (v) => {
    store.params.organizations = v
    fetchDepartment()
    fetchPosition()
  }

</script>

<template>
  <UIPageFilter
    :search-loading="store.loading"
    :filter-count="filterCount"
    v-model:search="store.params.search"
    @onSearch="onSearch"
    @onClear="clearFilter"
    @show="onShow"
    :show-add-button="false"
    filter-placement="bottom-end"
    :popover-style="{
      width: '830px',
      maxWidth: 'calc(100vw - 32px)',
      padding: '0',
      borderRadius: '20px'
    }"
  >
    <template #filterAction>
      <div class="order-2 w-full md:w-auto">
        <QuickActions
          :can-write="canWrite"
          :can-zip="canZip"
          :loading="store.loading"
          :reference-active="exportStore.isExportingResume"
          :selected-count="
            exportStore.resumePayload.all
              ? store.totalItems
              : exportStore.resumePayload.worker_ids.length
          "
          @contract="onAdd"
          @export="onExport"
          @reference="onExportResume"
          @download-reference="onSubmitResumeExport"
          @relatives="store._downloadRelative"
        />
      </div>
    </template>

    <template #filterContent>
      <div class="worker-filter-panel">
        <div class="grid grid-cols-12 gap-x-5 gap-y-4">
          <div class="col-span-12 md:col-span-4">
            <label>{{ $t('workerPage.filter.organization') }}</label>
            <UISelect
              multiple
              clearable
              :options="componentStore.structureList"
              :model-v="store.params.organizations"
              @defaultValue="defaultEv"
              @updateModel="onChangeStructure"
              :checked-val="store.structureCheck"
              @updateCheck="(v) => (store.structureCheck = v)"
              :loading="componentStore.structureLoading"
              v-model:search="componentStore.structureParams.search"
              @onSearch="componentStore._structures"
              @onSubmit="filterEvent"
            />
          </div>

          <div class="col-span-12 md:col-span-4">
            <label>{{ $t('workerPage.filter.department') }}</label>
            <UINSelect
              multiple
              clearable
              :disabled="store.params.organizations.length === 0"
              :loading="store.filterDepartmentLoading"
              :options="store.filterDepartmentList"
              :total-count="store.filterDepartmentTotal"
              v-model:value="store.params.departments"
              @update:value="onChangeDepartment"
              :query="store.filterDepParams.search"
              @onSearch="onSearchDepartmentEv"
            />
          </div>

          <div class="col-span-12 md:col-span-4">
            <label>{{ $t('createWorkerPage.form.education') }}</label>
            <n-select
              v-model:value="store.params.educations"
              multiple
              filterable
              clearable
              :options="componentStore.educationList"
              label-field="name"
              value-field="id"
              @update:value="filterEvent"
              :loading="componentStore.enumLoading"
            />
          </div>

          <div class="col-span-12 md:col-span-4">
            <label>{{ $t('workerPage.filter.position') }}</label>
            <UINSelect
              multiple
              clearable
              :disabled="store.params.organizations.length === 0"
              :loading="store.filterPositionLoading"
              :options="store.filterPositionList"
              :total-count="store.filterPositionTotal"
              :query="store.filterPosParams.search"
              v-model:value="store.params.positions"
              @update:value="filterEvent"
              @onSearch="onSearchPositionEv"
            />
          </div>

          <div class="col-span-12 md:col-span-4">
            <label>{{ $t('workerPage.filter.position_type') }}</label>
            <n-select
              v-model:value="store.params.position_type"
              filterable
              clearable
              :options="componentStore.positionCategory"
              label-field="name"
              value-field="id"
              :loading="componentStore.enumAdminLoading"
              @update:value="filterEvent"
            />
          </div>

          <div class="col-span-12 md:col-span-4">
            <label>{{ $t('workerPage.filter.contract_type') }}</label>
            <n-select
              v-model:value="store.params.contract_type"
              filterable
              clearable
              :options="componentStore.contractTypeList"
              label-field="name"
              value-field="id"
              :loading="componentStore.enumLoading"
              @update:value="filterEvent"
            />
          </div>

          <div class="col-span-12 md:col-span-6 worker-filter-check">
            <n-checkbox @change="filterEvent" v-model:checked="store.params.multiple_position">
              {{ $t('workerPage.filter.multiple_position') }}
            </n-checkbox>
          </div>

          <div class="col-span-12 md:col-span-6 worker-filter-check">
            <n-checkbox @change="filterEvent" v-model:checked="store.params.pension_age">
              {{ $t('workerPage.filter.pension_age') }}
            </n-checkbox>
          </div>
        </div>

        <n-divider class="worker-filter-divider" />

        <div class="grid grid-cols-12 gap-x-5 gap-y-4">
          <div class="col-span-12 md:col-span-4">
            <label>{{ $t('workerPage.filter.age') }}</label>
            <n-radio-group
              v-model:value="ageMode"
              @update:value="onChangeAgeMode"
              class="age-mode-group"
            >
              <n-radio-button value="range">{{ $t('content.ageRange') }}</n-radio-button>
              <n-radio-button value="exact">{{ $t('content.ageExact') }}</n-radio-button>
            </n-radio-group>
          </div>

          <div class="col-span-12 md:col-span-4">
            <label>{{ ageMode === 'range' ? $t('content.from') : $t('content.ageExact') }}</label>
            <n-input-number
              v-if="ageMode === 'range'"
              v-model:value="ageFrom"
              :min="1"
              :max="100"
              :precision="0"
              :input-props="{ onKeydown: blockDecimalKey }"
              clearable
              :placeholder="$t('content.ageFrom')"
              @update:value="onChangeAgeRange"
            />
            <n-input-number
              v-else
              v-model:value="exactAge"
              :min="1"
              :max="100"
              :precision="0"
              :input-props="{ onKeydown: blockDecimalKey }"
              clearable
              :placeholder="$t('content.ageExactPlaceholder')"
              @update:value="onChangeExactAge"
            />
          </div>

          <div v-if="ageMode === 'range'" class="col-span-12 md:col-span-4">
            <label>{{ $t('content.to') }}</label>
            <n-input-number
              v-model:value="ageTo"
              :min="1"
              :max="100"
              :precision="0"
              :input-props="{ onKeydown: blockDecimalKey }"
              clearable
              :placeholder="$t('content.ageTo')"
              @update:value="onChangeAgeRange"
            />
          </div>
        </div>

        <n-button text class="worker-additional-toggle" @click="showAllFilters = !showAllFilters">
          <template #icon>
            <n-icon :component="showAllFilters ? ChevronUp20Regular : ChevronDown20Regular" />
          </template>
          {{
            showAllFilters
              ? $t('content.hideAdditionalFilters')
              : $t('content.showAdditionalFilters')
          }}
        </n-button>

        <n-collapse-transition :show="showAllFilters">
          <div class="grid grid-cols-12 gap-x-5 gap-y-4 mt-4">
            <div class="col-span-12 md:col-span-4">
              <label>{{ $t('workerPage.filter.birthday') }}</label>
              <n-select
                v-model:value="store.params.birthday"
                filterable
                clearable
                :options="Utils.monthList"
                label-field="name"
                value-field="id"
                @update:value="filterEvent"
              />
            </div>

            <div class="col-span-12 md:col-span-4">
              <label>{{ $t('workerPage.filter.sex') }}</label>
              <n-select
                v-model:value="store.params.sex"
                filterable
                clearable
                :options="componentStore.genderList"
                label-field="name"
                value-field="id"
                @update:value="filterEvent"
              />
            </div>

            <div class="col-span-12 md:col-span-4">
              <label>{{ $t('createWorkerPage.form.marital_status') }}</label>
              <n-select
                v-model:value="store.params.marital_status"
                filterable
                clearable
                :options="componentStore.maritalList"
                label-field="name"
                value-field="id"
                :loading="componentStore.enumLoading"
                @update:value="filterEvent"
              />
            </div>

            <div class="col-span-12 md:col-span-4">
              <label>{{ $t('createWorkerPage.form.nationality_id') }}</label>
              <n-select
                v-model:value="store.params.nationalities"
                multiple
                filterable
                clearable
                :options="componentStore.nationalityList"
                label-field="name"
                value-field="id"
                @update:value="filterEvent"
                :loading="componentStore.nationalityLoading"
              />
            </div>

            <div class="col-span-12 md:col-span-4">
              <label>{{ $t('createWorkerPage.form.country') }}</label>
              <n-select
                v-model:value="store.params.country_id"
                filterable
                clearable
                :options="componentStore.countryList"
                label-field="name"
                value-field="id"
                :loading="componentStore.countryLoading"
                @update:value="changeCountry"
              />
            </div>

            <div class="col-span-12 md:col-span-4">
              <label>{{ $t('createWorkerPage.form.region') }}</label>
              <n-select
                v-model:value="store.params.region_id"
                filterable
                clearable
                :options="componentStore.regionList"
                label-field="name"
                value-field="id"
                :loading="componentStore.regionLoading"
                @update:value="onChangeRegion"
              />
            </div>

            <div class="col-span-12 md:col-span-4">
              <label>{{ $t('createWorkerPage.form.city') }}</label>
              <n-select
                v-model:value="store.params.city_id"
                :disabled="!store.params.region_id"
                filterable
                clearable
                :options="store.districtList"
                label-field="name"
                value-field="id"
                :loading="store.districtLoading"
                @update:value="filterEvent"
              />
            </div>

            <div class="col-span-12 md:col-span-4">
              <label>{{ $t('createWorkerPage.form.currentRegion') }}</label>
              <n-select
                v-model:value="store.params.current_region_id"
                filterable
                clearable
                :options="componentStore.regionList"
                label-field="name"
                value-field="id"
                :loading="componentStore.regionLoading"
                @update:value="onChangeCurrentRegion"
              />
            </div>

            <div class="col-span-12 md:col-span-4">
              <label>{{ $t('createWorkerPage.form.currentCity') }}</label>
              <n-select
                v-model:value="store.params.current_city_id"
                :disabled="!store.params.current_region_id"
                filterable
                clearable
                :options="store.currentDistrictList"
                label-field="name"
                value-field="id"
                :loading="store.currentDistrictLoading"
                @update:value="filterEvent"
              />
            </div>
          </div>
        </n-collapse-transition>
      </div>
    </template>
  </UIPageFilter>
</template>

<style scoped>
  .worker-filter-panel label {
    display: block;
    margin-bottom: 6px;
    color: var(--textColor1);
    font-size: 13px;
    font-weight: 500;
  }

  .worker-filter-panel :deep(:where(.n-select, .n-input-number)) {
    width: 100%;
    --n-height: 40px !important;
    --n-border-radius: 16px !important;
  }

  .worker-filter-panel :deep(.n-select) {
    --n-padding-single: 0 12px !important;
    --n-padding-multiple: 0 12px !important;
  }

  .worker-filter-panel :deep(.n-base-selection-label),
  .worker-filter-panel :deep(.ui__structure-input .n-input-wrapper),
  .worker-filter-panel :deep(.n-input-number .n-input-wrapper) {
    padding-left: 12px;
    padding-right: 12px;
  }

  .worker-filter-check {
    display: flex;
    align-items: center;
    min-height: 44px;
    padding: 0 14px;
    border: 1px solid var(--surface-line);
    border-radius: 16px;
  }

  .worker-filter-check :deep(.n-checkbox__label) {
    color: var(--textColor2);
    font-size: 13px;
  }

  .worker-filter-divider {
    margin: 24px 0 !important;
  }

  .age-mode-group {
    display: flex;
    width: 100%;
    height: 40px;
    overflow: hidden;
    border: 3px solid var(--surface-line);
    border-radius: 12px;
    background: #eaecf0;
  }

  .age-mode-group :deep(.n-radio-button) {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    height: 100%;
    padding: 0 12px;
    border: 0;
    background: transparent;
    color: var(--textColor2);
  }

  .age-mode-group :deep(.n-radio-button--checked) {
    border-color: transparent;
    background: #fff;
    color: #101828;
  }

  .age-mode-group :deep(.n-radio-button__state-border) {
    display: none;
  }

  .age-mode-group :deep(.n-radio-button__label) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 0;
    text-align: center;
    font-size: 14px;
    font-weight: 400;
  }

  .age-mode-group :deep(.n-radio-button:not(:first-child)::before) {
    display: none;
  }

  .worker-additional-toggle {
    margin-top: 18px;
    font-size: 13px;
    font-weight: 600;
  }

  :global([data-theme='dark'] .age-mode-group) {
    border-color: #344054;
    background: #344054;
  }

  :global([data-theme='dark'] .age-mode-group .n-radio-button) {
    color: #f2f4f7;
  }

  :global([data-theme='dark'] .age-mode-group .n-radio-button--checked) {
    background: #101828;
    color: #f2f4f7;
  }
</style>
