<script setup>
  import {
    useComponentStore,
    useWorkerStore,
    useExportStore,
    useAccountStore
  } from '@/store/modules/index.js'
  import { UINSelect, UIPageFilter, UISelect } from '@/components/index.js'
  import {
    HomePerson20Regular,
    CheckmarkCircle16Regular,
    DocumentTable16Regular,
    DismissCircle28Regular,
    ShareScreenPersonOverlayInside16Regular,
    PremiumPerson20Regular,
    CloudArchive20Filled,
    Search48Filled,
    ChevronDown20Regular,
    ChevronUp20Regular
  } from '@vicons/fluent'
  import Utils, { generateUUIDKey } from '@/utils/Utils.js'
  import { AppPaths, appPermissions, useDebounce } from '@/utils/index.js'

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

  const router = useRouter()
  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.hrWorkersWrite)) return
    componentStore.checkUserVisible = true
  }

  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.hrWorkersRead)) return

    store.params.page = 1
    store._index()
  }

  const filterEvent = (v) => {
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

  const openUserListEv = () => {
    if (!accStore.checkAction(appPermissions.hrUsersRead)) return
    store.userRoleVisible = true
  }

  const canWrite = computed(() => accStore.checkAction(appPermissions.hrExport))
  const canZip = computed(() => accStore.checkAction(appPermissions.exportWorkersZip))

  const defaultEv = (v) => {
    store.params.organizations = v
    fetchDepartment()
    fetchPosition()
  }

  const onKeyUp = Utils.useDebounce(filterEvent, 1000)
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
  >
    <template #filterAction>
      <n-button
        @click="store._downloadRelative"
        :loading="store.loading"
        class="w-full! md:w-auto!"
        type="error"
      >
        {{ $t('workerPage.filter.downloadRelative') }}
        <template #icon>
          <CloudArchive20Filled />
        </template>
      </n-button>
      <!--      <n-button-->
      <!--          @click="router.push(Utils.routeHrmPathMaker(AppPaths.Export))"-->
      <!--          class="w-full! md:w-auto!"-->
      <!--          type="warning">{{$t('exportPage.name')}}-->
      <!--        <template #icon>-->
      <!--          <CloudArchive20Filled/>-->
      <!--        </template>-->
      <!--      </n-button>-->
      <!--      <n-button @click="openUserListEv" class="w-full! md:w-auto!" type="primary">-->
      <!--        {{ $t('workerRole.name') }}-->
      <!--        <template #icon>-->
      <!--          <PremiumPerson20Regular />-->
      <!--        </template>-->
      <!--      </n-button>-->

      <n-button-group class="w-full! md:w-auto!">
        <n-button
          :class="[exportStore.isExportingResume ? 'w-1/2! md:w-auto!' : 'w-full! md:w-auto!']"
          :disabled="
            !(exportStore.resumePayload.all
              ? store.totalItems
              : exportStore.resumePayload.worker_ids.length)
          "
          type="primary"
          v-if="exportStore.isExportingResume && canZip"
          @click="onSubmitResumeExport"
        >
          <span class="font-semibold">{{ $t('content.download') }} ({{
            exportStore.resumePayload.all
              ? store.totalItems
              : exportStore.resumePayload.worker_ids.length
          }})</span>
          <template #icon>
            <CheckmarkCircle16Regular />
          </template>
        </n-button>
        <n-button
          v-if="canWrite"
          :class="[exportStore.isExportingResume ? 'w-1/2! md:w-auto!' : 'w-full! md:w-auto!']"
          :color="exportStore.isExportingResume ? undefined : '#A020F0'"
          :type="exportStore.isExportingResume ? 'error' : 'warning'"
          icon-placement="right"
          @click="onExportResume"
        >
          <template #icon>
            <n-icon
              :component="
                exportStore.isExportingResume
                  ? DismissCircle28Regular
                  : ShareScreenPersonOverlayInside16Regular
              "
            />
          </template>
          {{ $t('content.reference') }}
        </n-button>
      </n-button-group>

      <n-button
        v-if="canWrite"
        class="w-full! md:w-auto!"
        type="success"
        icon-placement="right"
        @click="onExport"
      >
        <template #icon>
          <n-icon :component="DocumentTable16Regular" />
        </template>
        {{ $t('content.export') }}
      </n-button>

      <n-button
        v-if="canWrite"
        class="w-full! md:w-auto!"
        type="primary"
        icon-placement="right"
        @click="onAdd"
      >
        <template #icon>
          <n-icon>
            <HomePerson20Regular />
          </n-icon>
        </template>
        {{ $t('workerPage.filter.contract') }}
      </n-button>
    </template>

    <template #filterContent>
      <div
        class="pt-4 w-full md:w-[900px] transition-[min-height] duration-300 ease-in-out"
        :class="showAllFilters ? 'min-h-[75vh]' : 'min-h-0'"
      >
        <div class="w-full">
          <div class="grid grid-cols-12 gap-3">
            <div class="col-span-12 md:col-span-6">
              <label class="mt-3 text-xs text-gray-500">{{
                $t('workerPage.filter.organization')
              }}</label>
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
            <div class="col-span-12 md:col-span-6">
              <label class="mt-3 text-xs text-gray-500">{{
                $t('workerPage.filter.department')
              }}</label>
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
            <div class="col-span-12 md:col-span-6">
              <label class="mt-3 text-xs text-gray-500">{{ $t('workerPage.filter.position') }}</label>
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
            <div class="col-span-12 md:col-span-6">
              <label class="mt-3 text-xs text-gray-500">{{
                $t('workerPage.filter.contract_type')
              }}</label>
              <n-select
                v-model:value="store.params.contract_type"
                filterable
                clearable
                :options="componentStore.contractTypeList"
                label-field="name"
                value-field="id"
                :loading="componentStore.enumLoading"
                @update:value="filterEvent"
              >
              </n-select>
            </div>
            <div class="col-span-12 md:col-span-6">
              <label class="mt-3 text-xs text-gray-500">{{
                $t('workerPage.filter.position_type')
              }}</label>
              <n-select
                v-model:value="store.params.position_type"
                filterable
                clearable
                :options="componentStore.positionCategory"
                label-field="name"
                value-field="id"
                :loading="componentStore.enumAdminLoading"
                @update:value="filterEvent"
                :ignore-composition="false"
              />
            </div>
            <div class="col-span-12 md:col-span-6">
              <label class="text-xs text-gray-500">{{ $t(`createWorkerPage.form.education`) }}</label>
              <n-select
                v-model:value="store.params.educations"
                multiple
                filterable
                clearable
                :options="componentStore.educationList"
                label-field="name"
                value-field="id"
                @update:value="filterEvent"
                :ignore-composition="false"
                :loading="componentStore.enumLoading"
              />
            </div>
            <div class="col-span-12 md:col-span-6">
              <label class="text-xs text-gray-500">{{ $t('workerPage.filter.age') }}</label>
              <n-input-group>
                <n-radio-group
                  v-model:value="ageMode"
                  @update:value="onChangeAgeMode"
                  class="age-mode-group"
                >
                  <n-radio-button value="range">{{ $t('content.ageRange') }}</n-radio-button>
                  <n-radio-button value="exact">{{ $t('content.ageExact') }}</n-radio-button>
                </n-radio-group>
                <template v-if="ageMode === 'range'">
                  <n-input-number
                    v-model:value="ageFrom"
                    :min="1"
                    :max="100"
                    :precision="0"
                    :input-props="{ onKeydown: blockDecimalKey }"
                    clearable
                    class="flex-1 min-w-0"
                    :placeholder="$t('content.ageFrom')"
                    @update:value="onChangeAgeRange"
                  />
                  <n-input-number
                    v-model:value="ageTo"
                    :min="1"
                    :max="100"
                    :precision="0"
                    :input-props="{ onKeydown: blockDecimalKey }"
                    clearable
                    class="flex-1 min-w-0"
                    :placeholder="$t('content.ageTo')"
                    @update:value="onChangeAgeRange"
                  />
                </template>
                <n-input-number
                  v-else
                  v-model:value="exactAge"
                  :min="1"
                  :max="100"
                  :precision="0"
                  :input-props="{ onKeydown: blockDecimalKey }"
                  clearable
                  class="flex-1 min-w-0"
                  :placeholder="$t('content.ageExactPlaceholder')"
                  @update:value="onChangeExactAge"
                />
              </n-input-group>
            </div>
            <div class="col-span-12 md:col-span-4">
              <label class="text-xs text-gray-500">{{ $t(`registerPage.lastName`) }}</label>
              <n-input
                clearable
                class="w-full! skip-format"
                v-model:value="store.params.last_name"
                type="text"
                :placeholder="$t('content.search')"
                :on-keyup="onKeyUp"
                @clear="onKeyUp"
              >
                <template #suffix>
                  <n-icon :component="Search48Filled" />
                </template>
              </n-input>
            </div>
            <div class="col-span-12 md:col-span-4">
              <label class="text-xs text-gray-500">{{ $t(`registerPage.firstName`) }}</label>
              <n-input
                clearable
                class="w-full! skip-format"
                v-model:value="store.params.first_name"
                type="text"
                :placeholder="$t('content.search')"
                :on-keyup="onKeyUp"
                @clear="onKeyUp"
              >
                <template #suffix>
                  <n-icon :component="Search48Filled" />
                </template>
              </n-input>
            </div>
            <div class="col-span-12 md:col-span-4">
              <label class="text-xs text-gray-500">{{ $t(`registerPage.middleName`) }}</label>
              <n-input
                clearable
                class="w-full! skip-format"
                v-model:value="store.params.middle_name"
                type="text"
                :placeholder="$t('content.search')"
                :on-keyup="onKeyUp"
                @clear="onKeyUp"
              >
                <template #suffix>
                  <n-icon :component="Search48Filled" />
                </template>
              </n-input>
            </div>
            <div class="col-span-12 md:col-span-4">
              <label class="text-xs text-gray-500 select-none">&nbsp;</label>
              <div
                class="h-[34px] w-full flex items-center px-3 border border-surface-line rounded-lg"
              >
                <n-checkbox @change="filterEvent" v-model:checked="store.params.multiple_position">
                  <span class="text-secondary text-xs">{{
                    $t('workerPage.filter.multiple_position')
                  }}</span>
                </n-checkbox>
              </div>
            </div>
            <div class="col-span-12 md:col-span-4">
              <label class="text-xs text-gray-500 select-none">&nbsp;</label>
              <div
                class="h-[34px] w-full flex items-center px-3 border border-surface-line rounded-lg"
              >
                <n-checkbox @change="filterEvent" v-model:checked="store.params.pension_age">
                  <span class="text-secondary text-xs">{{
                    $t('workerPage.filter.pension_age')
                  }}</span>
                </n-checkbox>
              </div>
            </div>
          </div>

          <div class="mt-4 mb-2 flex items-center gap-2">
            <n-divider class="flex-1! m-0!" />
            <n-button
              text
              size="tiny"
              class="text-xs text-center shrink-0"
              @click="showAllFilters = !showAllFilters"
            >
              {{ showAllFilters ? $t('content.hideAdditionalFilters') : $t('content.showAdditionalFilters') }}
              <template #icon>
                <n-icon :component="showAllFilters ? ChevronUp20Regular : ChevronDown20Regular" />
              </template>
            </n-button>
            <n-divider class="flex-1! m-0!" />
          </div>

          <n-collapse-transition :show="showAllFilters">
            <div class="grid grid-cols-12 gap-3">
              <div class="col-span-12 md:col-span-4">
                <label class="mt-3 text-xs text-gray-500">{{ $t('workerPage.filter.birthday') }}</label>
                <n-select
                  v-model:value="store.params.birthday"
                  filterable
                  clearable
                  :options="Utils.monthList"
                  label-field="name"
                  value-field="id"
                  @update:value="filterEvent"
                  :ignore-composition="false"
                />
              </div>
              <div class="col-span-12 md:col-span-4">
                <label class="text-xs text-gray-500">{{ $t('workerPage.filter.sex') }}</label>
                <n-select
                  v-model:value="store.params.sex"
                  filterable
                  clearable
                  :options="componentStore.genderList"
                  label-field="name"
                  value-field="id"
                  @update:value="filterEvent"
                  :ignore-composition="false"
                />
              </div>
              <div class="col-span-12 md:col-span-4">
                <label class="text-xs text-gray-500">{{
                  $t(`createWorkerPage.form.marital_status`)
                }}</label>
                <n-select
                  v-model:value="store.params.marital_status"
                  filterable
                  clearable
                  :options="componentStore.maritalList"
                  label-field="name"
                  value-field="id"
                  :ignore-composition="false"
                  :loading="componentStore.enumLoading"
                  @update:value="filterEvent"
                />
              </div>
              <div class="col-span-12 md:col-span-4">
                <label class="text-xs text-gray-500">{{
                  $t(`createWorkerPage.form.nationality_id`)
                }}</label>
                <n-select
                  v-model:value="store.params.nationalities"
                  multiple
                  filterable
                  clearable
                  :options="componentStore.nationalityList"
                  label-field="name"
                  value-field="id"
                  @update:value="filterEvent"
                  :ignore-composition="false"
                  :loading="componentStore.nationalityLoading"
                />
              </div>
              <div class="col-span-12 md:col-span-4">
                <label class="text-xs text-gray-500">{{ $t(`createWorkerPage.form.country`) }}</label>
                <n-select
                  v-model:value="store.params.country_id"
                  filterable
                  clearable
                  :options="componentStore.countryList"
                  label-field="name"
                  value-field="id"
                  :ignore-composition="false"
                  :loading="componentStore.countryLoading"
                  @update:value="changeCountry"
                />
              </div>
              <div class="col-span-12 md:col-span-4">
                <label class="text-xs text-gray-500">{{ $t(`createWorkerPage.form.region`) }}</label>
                <n-select
                  v-model:value="store.params.region_id"
                  filterable
                  clearable
                  :options="componentStore.regionList"
                  label-field="name"
                  value-field="id"
                  :ignore-composition="false"
                  :loading="componentStore.regionLoading"
                  @update:value="onChangeRegion"
                />
              </div>
              <div class="col-span-12 md:col-span-4">
                <label class="text-xs text-gray-500">{{ $t(`createWorkerPage.form.city`) }}</label>
                <n-select
                  :disabled="!store.params.region_id"
                  v-model:value="store.params.city_id"
                  filterable
                  clearable
                  :options="store.districtList"
                  label-field="name"
                  value-field="id"
                  :ignore-composition="false"
                  :loading="store.districtLoading"
                  @update:value="filterEvent"
                />
              </div>
              <div class="col-span-12 md:col-span-4">
                <label class="text-xs text-gray-500">{{
                  $t(`createWorkerPage.form.currentRegion`)
                }}</label>
                <n-select
                  v-model:value="store.params.current_region_id"
                  filterable
                  clearable
                  :options="componentStore.regionList"
                  label-field="name"
                  value-field="id"
                  :ignore-composition="false"
                  :loading="componentStore.regionLoading"
                  @update:value="onChangeCurrentRegion"
                />
              </div>
              <div class="col-span-12 md:col-span-4">
                <label class="text-xs text-gray-500">{{
                  $t(`createWorkerPage.form.currentCity`)
                }}</label>
                <n-select
                  v-model:value="store.params.current_city_id"
                  :disabled="!store.params.current_region_id"
                  filterable
                  clearable
                  :options="store.currentDistrictList"
                  label-field="name"
                  value-field="id"
                  :ignore-composition="false"
                  :loading="store.currentDistrictLoading"
                  @update:value="filterEvent"
                />
              </div>
            </div>
          </n-collapse-transition>
        </div>
      </div>
    </template>
  </UIPageFilter>
</template>

<style scoped>
  .age-mode-group :deep(.n-radio-button:last-child),
  .age-mode-group :deep(.n-radio-button:last-child .n-radio-button__state-border) {
    border-top-right-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
  }
</style>
