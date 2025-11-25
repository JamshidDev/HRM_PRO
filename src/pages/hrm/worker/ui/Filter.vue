<script setup>
import {useComponentStore, useWorkerStore, useExportStore, useAccountStore} from "@/store/modules/index.js"
import {UINSelect, UIPageFilter, UISelect} from "@/components/index.js"
import {
  HomePerson20Regular,
  CheckmarkCircle16Regular,
  Person32Regular,
  DocumentTable16Regular,
  DismissCircle28Regular,
  ShareScreenPersonOverlayInside16Regular,
  PremiumPerson20Regular,
  CloudArchive20Filled, Search48Filled,
} from "@vicons/fluent"
import Utils, {generateUUIDKey} from "@/utils/Utils.js"
import {AppPaths, appPermissions, useDebounce} from "@/utils/index.js"


const store = useWorkerStore()
const accStore = useAccountStore()
const exportStore = useExportStore()
const componentStore = useComponentStore()

const debounceIndexEv = useDebounce(store._index, 1000)

const posParams = computed(()=>({
  ...store.filterPosParams,
  organizations:store.params.organizations.map(v=>v.id).toString(),
  departments:store.params.departments.toString(),
  key:undefined,
}))
const positionKey = store.filterPosParams.key ||= generateUUIDKey()
const positionState = computed(()=>componentStore.getPositionState(positionKey))
const fetchPosition = useDebounce(componentStore.createPositionFetcher(positionKey))
const onScrollPosition = ()=>{
  store.filterPosParams.page ++
  fetchPosition(posParams.value, true)
}

const depParams = computed(()=>({
  ...store.filterDepParams,
  organizations:store.params.organizations.map(v=>v.id).toString(),
  key:undefined,
}))
const detectKey = store.filterDepParams.key ||= generateUUIDKey()
const departmentState = computed(()=>componentStore.getDepartmentState(detectKey))
const fetchDepartment = useDebounce(componentStore.createDepartmentFetcher(detectKey))
const onScrollDepartment = ()=>{
  store.filterDepParams.page ++
  fetchDepartment(depParams.value, true)
}

const router = useRouter()
const onAdd = () => {
  if(!accStore.checkAction(accStore.pn.hrWorkersWrite)) return
  componentStore.checkUserVisible = true
}

const onSearch = () => {
  if(!accStore.checkAction(accStore.pn.hrWorkersRead)) return

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

  departmentState.value.list = []
  componentStore.filterPositions = []

  filterEvent()

  if(v.length===0 ) return

  store.filterDepParams.page = 1
  fetchDepartment(depParams.value)

  store.filterPosParams.page = 1
  fetchPosition(posParams.value)
}

const marks = {
  1: "1",
  25: "25",
  50: "50",
  75: "75",
  100: "100"
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
  store.params.ages=[1,100]
  store.params.age_start = undefined
  store.params.age_end = undefined
  store.params.last_name = null
  store.params.first_name = null
  store.params.middle_name = null

  filterEvent()
}

const onChangeDepartment = () => {
  componentStore.filterPositionParams.departments = store.params.departments.toString()
  store.params.positions = []
  positionState.list = []
  fetchPosition(posParams.value)
  filterEvent()
}

const onChangeAge = () => {
  store.params.age_start = store.params.ages[0]
  store.params.age_end = store.params.ages[1]
  filterEvent()
}

const onShow = (isOpen) => {
  if(!isOpen) return
  if(componentStore.structureList.length === 0) {
    componentStore._structures()
  }

  if (componentStore.contractTypeList.length === 0) {
    componentStore._enums()
  }
  if (componentStore.positionCategory.length === 0) {
    componentStore._enumsAdmin()
  }
  if(componentStore.nationalityList.length === 0){
    componentStore._nationality()
  }
  if(componentStore.countryList.length === 0){
    componentStore._countries()
  }

  if(componentStore.regionList.length === 0){
    componentStore._regions()
  }

}

const changeCountry = ()=>{
  filterEvent()
}



const onChangeRegion = ()=>{
  store.params.city_id = null
  store.districtList = []
  store.changeRegion(store.params.region_id)
  filterEvent()
}

const onChangeCurrentRegion = ()=>{
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

const openUserListEv = ()=>{
  if(!accStore.checkAction(appPermissions.hrUsersRead)) return
  store.userRoleVisible=true
}

const canWrite = computed(()=>accStore.checkAction(appPermissions.hrWorkersWrite))

const defaultEv = (v)=>{
  store.params.organizations=v
  fetchDepartment(depParams.value)
  fetchPosition(posParams.value)

}

const onKeyUp = Utils.useDebounce(filterEvent,1000)



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
          type="error">{{$t('workerPage.filter.downloadRelative')}}
        <template #icon>
          <CloudArchive20Filled/>
        </template>
      </n-button>
      <n-button
          @click="router.push(Utils.routeHrmPathMaker(AppPaths.Export))"
          class="w-full! md:w-auto!"
          type="warning">{{$t('exportPage.name')}}
        <template #icon>
          <CloudArchive20Filled/>
        </template>
      </n-button>
      <n-button
          @click="openUserListEv"
          class="w-full! md:w-auto!"
          type="primary">{{$t('workerRole.name')}}
        <template #icon>
          <PremiumPerson20Regular/>
        </template>
      </n-button>
      <n-button-group
          class="w-full! md:w-auto!">
        <n-button
            :class="[exportStore.isExportingResume? 'w-1/2! md:w-auto!':'w-full! md:w-auto!']"
            :disabled="!(exportStore.resumePayload.all ? store.totalItems : exportStore.resumePayload.worker_ids.length)"
            type="primary"
            v-if="exportStore.isExportingResume && canWrite"
            @click="onSubmitResumeExport">
            <span
                class="font-semibold">{{$t('content.download')}} ({{ exportStore.resumePayload.all ? store.totalItems : exportStore.resumePayload.worker_ids.length }})</span>
          <template #icon>
            <CheckmarkCircle16Regular/>
          </template>
        </n-button>
        <n-button
            v-if="canWrite"
            :class="[exportStore.isExportingResume? 'w-1/2! md:w-auto!':'w-full! md:w-auto!']"
            :color="exportStore.isExportingResume ? undefined : '#A020F0'"
            :type="exportStore.isExportingResume ? 'error' : 'warning'"
            icon-placement="right"
            @click="onExportResume"
        >
          <template #icon>
            <n-icon
                :component="exportStore.isExportingResume ? DismissCircle28Regular : ShareScreenPersonOverlayInside16Regular"/>
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
          <n-icon :component="DocumentTable16Regular"/>
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
            <HomePerson20Regular/>
          </n-icon>
        </template>
        {{ $t('workerPage.filter.contract') }}
      </n-button>
    </template>

    <template #filterContent>
      <div class="flex pt-4 !w-[900px]">
        <div class="grid grid-cols-12 gap-3 w-[calc(100%-100px)]">
          <div class="col-span-6">
            <label class="mt-3 text-xs text-gray-500">{{ $t('workerPage.filter.organization') }}</label>
            <UISelect
                multiple
                clearable
                :options="componentStore.structureList"
                :modelV="store.params.organizations"
                @defaultValue="defaultEv"
                @updateModel="onChangeStructure"
                :checkedVal="store.structureCheck"
                @updateCheck="(v)=>store.structureCheck=v"
                :loading="componentStore.structureLoading"
                v-model:search="componentStore.structureParams.search"
                @onSearch="componentStore._structures"
                @onSubmit="filterEvent"
            />
          </div>
          <div class="col-span-6">
            <label class="mt-3 text-xs text-gray-500">{{ $t('workerPage.filter.department') }}</label>
            <UINSelect
                multiple
                clearable
                :disabled="store.params.organizations.length === 0"
                :loading="departmentState.loading"
                :options="departmentState.list"
                :total-count="departmentState.total"
                v-model:value="store.params.departments"
                @update:value="onChangeDepartment"
                @onScrollEv="onScrollDepartment"
            />
          </div>
          <div class="col-span-6">
            <label class="mt-3 text-xs text-gray-500">{{ $t('workerPage.filter.position') }}</label>
            <UINSelect
                multiple
                clearable
                :disabled="store.params.organizations.length === 0"
                :loading="positionState.loading"
                :options="positionState.list"
                :total-count="positionState.total"
                v-model:value="store.params.positions"
                @update:value="filterEvent"
                @onScrollEv="onScrollPosition"
            />
          </div>
          <div class="col-span-6">
            <label class="mt-3 text-xs text-gray-500">{{ $t('workerPage.filter.contract_type') }}</label>
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
          <div class="col-span-3">
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
          <div class="col-span-3">
            <label class="mt-3 text-xs text-gray-500">{{ $t('workerPage.filter.position_type') }}</label>
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
          <div class="col-span-3">
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
          <div class="col-span-3">
            <label class="text-xs text-gray-500">{{ $t(`createWorkerPage.form.marital_status`) }}</label>
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
          <div class="col-span-4">
            <label class="text-xs text-gray-500">{{ $t(`createWorkerPage.form.nationality_id`) }}</label>
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
          <div class="col-span-4">
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
          <div class="col-span-4">
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
          <div class="col-span-3">
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
          <div class="col-span-3">
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
          <div class="col-span-3">
            <label class="text-xs text-gray-500">{{ $t(`createWorkerPage.form.currentRegion`) }}</label>
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
          <div class="col-span-3">
            <label class="text-xs text-gray-500">{{ $t(`createWorkerPage.form.currentCity`) }}</label>
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
          <div class="col-span-4">
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
          <div class="col-span-4">
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
          <div class="col-span-4">
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
          <div class="col-span-4">
            <div class="border border-surface-line rounded-lg p-1">
              <n-checkbox @change="filterEvent" v-model:checked="store.params.multiple_position">
                <span class="text-secondary text-xs">{{$t('workerPage.filter.multiple_position')}}</span>
              </n-checkbox>
            </div>

          </div>

        </div>
        <div class="w-[100px] pl-[20px]">
          <n-slider
              class="min-h-[200px]"
              v-model:value="store.params.ages"
              @dragend="onChangeAge"
              :marks="marks"
              vertical
              range
              :format-tooltip="(v)=>`${v} - yosh`"
          >
            <template #thumb>
              <n-icon-wrapper :size="24" :border-radius="12">
                <n-icon :size="18">
                  <Person32Regular/>
                </n-icon>
              </n-icon-wrapper>
            </template>
          </n-slider>
        </div>
      </div>
    </template>

  </UIPageFilter>
</template>

