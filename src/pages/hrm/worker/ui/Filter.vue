<script setup>
import {useComponentStore, useWorkerStore, useExportStore} from "@/store/modules/index.js"
import {UIPageFilter, UISelect} from "@/components/index.js"
import {
  HomePerson20Regular,
  CheckmarkCircle16Regular,
  Person32Regular,
  DocumentTable16Regular,
  DismissCircle28Regular,
  ShareScreenPersonOverlayInside16Regular
} from "@vicons/fluent"
import Utils from "@/utils/Utils.js"


const store = useWorkerStore()
const exportStore = useExportStore()
const componentStore = useComponentStore()

const onAdd = () => {
  componentStore.checkUserVisible = true
}

const onSearch = () => {
  store.params.page = 1
  store._index()
}

const filterEvent = () => {
  componentStore.depParams.page = 1
  store.params.page = 1
  store._index()
}

const onChangeStructure = (v) => {
  store.params.organizations = v
  componentStore.depParams.organizations = v.map((x) => x.id)
  componentStore.departmentList = []
  componentStore._departments()
  filterEvent()
}

const marks = {
  1: "1",
  25: "25",
  50: "50",
  75: "75",
  100: "100"
}

const filterCount = computed(() => {
  return Number(Boolean(store.params.organizations.length > 0)) + Number(Boolean(store.params.departments.length > 0))
      + Number(Boolean(store.params.birthday)) + Number(Boolean(store.params.contract_type)) + Number(Boolean(store.params.position_type)) + Number(Boolean(store.params.sex))
})

const clearFilter = () => {
  store.params.organizations = []
  store.params.departments = []
  store.params.positions = []
  store.params.birthday = null
  store.params.contract_type = null
  store.params.position_type = null
  store.params.sex = null
  filterEvent()
}

const onChangeDepartment = () => {
  componentStore.filterPositionParams.departments = store.params.departments.toString()
  componentStore.filterPositions = []
  componentStore._filterPosition()
  filterEvent()
}

const onChangeAge = () => {
  store.params.age_start = store.params.ages[0]
  store.params.age_end = store.params.ages[1]
  filterEvent()
}

const onShow = (isOpen) => {
  if (isOpen && componentStore.contractTypeList.length === 0) {
    componentStore._enums()
  }

  if (isOpen && componentStore.positionCategory.length === 0) {
    componentStore._enumsAdmin()
  }
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }

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
      <n-button-group
          class="w-full! md:w-auto!">
        <n-button
            :class="[exportStore.isExportingResume? 'w-1/2! md:w-auto!':'w-full! md:w-auto!']"
            :disabled="!(exportStore.resumePayload.all ? store.totalItems : exportStore.resumePayload.worker_ids.length)"
            type="primary" v-if="exportStore.isExportingResume" @click="onSubmitResumeExport">
            <span
                class="font-semibold">{{$t('content.download')}} ({{ exportStore.resumePayload.all ? store.totalItems : exportStore.resumePayload.worker_ids.length }})</span>
          <template #icon>
            <CheckmarkCircle16Regular/>
          </template>
        </n-button>
        <n-button
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
      <div class="flex w-full pt-4">
        <div class="grid grid-cols-2 gap-3" style="width: calc(100% - 100px)">
          <div class="col-span-2">
            <label class="mt-3 text-xs text-gray-500">{{ $t('workerPage.filter.organization') }}</label>
            <UISelect
                :options="componentStore.structureList"
                :modelV="store.params.organizations"
                @updateModel="onChangeStructure"
                :checkedVal="store.structureCheck"
                @updateCheck="(v)=>store.structureCheck=v"
                :loading="componentStore.structureLoading"
                @onSubmit="filterEvent"
            />
          </div>
          <div class="col-span-2">
            <label class="mt-3 text-xs text-gray-500">{{ $t('workerPage.filter.department') }}</label>
            <n-select
                :disabled="store.params.organizations.length === 0"
                v-model:value="store.params.departments"
                :options="componentStore.departmentList"
                multiple
                filterable
                label-field="name"
                value-field="id"
                :placeholder="$t('content.choose')"
                clearable
                @update:value="onChangeDepartment"
                :max-tag-count="1"
                :filter="()=>true"
                @search="componentStore._onSearchDepartment"
                @scroll="componentStore._onScrollDepartment"
            />
          </div>
          <div class="col-span-2">
            <label class="mt-3 text-xs text-gray-500">{{ $t('workerPage.filter.position') }}</label>
            <n-select
                :disabled="store.params.departments.length === 0"
                v-model:value="store.params.positions"
                filterable
                clearable
                multiple
                :placeholder="$t(`content.choose`)"
                :options="componentStore.filterPositions"
                label-field="name"
                value-field="id"
                :loading="componentStore.filterPositionLoading"
                @update:value="filterEvent"
                :max-tag-count="1"
            />
          </div>
          <div class="col-span-2">
            <label class="mt-3 text-xs text-gray-500">{{ $t('workerPage.filter.contract_type') }}</label>
            <n-select
                v-model:value="store.params.contract_type"
                filterable
                clearable
                :placeholder="$t(`content.choose`)"
                :options="componentStore.contractTypeList"
                label-field="name"
                value-field="id"
                :loading="componentStore.enumLoading"
                @update:value="filterEvent"
                :ignore-composition="false"
            />
          </div>
          <div class="col-span-1">
            <label class="mt-3 text-xs text-gray-500">{{ $t('workerPage.filter.birthday') }}</label>
            <n-select
                v-model:value="store.params.birthday"
                filterable
                clearable
                :placeholder="$t(`content.choose`)"
                :options="Utils.monthList"
                label-field="name"
                value-field="id"
                @update:value="filterEvent"
                :ignore-composition="false"
            />
          </div>
          <div class="col-span-1">
            <label class="mt-3 text-xs text-gray-500">{{ $t('workerPage.filter.position_type') }}</label>
            <n-select
                v-model:value="store.params.position_type"
                filterable
                clearable
                :placeholder="$t(`content.choose`)"
                :options="componentStore.positionCategory"
                label-field="name"
                value-field="id"
                :loading="componentStore.enumAdminLoading"
                @update:value="filterEvent"
                :ignore-composition="false"
            />
          </div>
          <div class="col-span-2">
            <label class="text-xs text-gray-500">{{ $t('workerPage.filter.sex') }}</label>
            <n-select
                v-model:value="store.params.sex"
                filterable
                clearable
                :placeholder="$t(`content.choose`)"
                :options="componentStore.genderList"
                label-field="name"
                value-field="id"
                @update:value="filterEvent"
                :ignore-composition="false"
            />
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

