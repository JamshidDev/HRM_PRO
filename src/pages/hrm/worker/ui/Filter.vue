<script setup>
import {useComponentStore, useWorkerStore} from "@/store/modules/index.js"
import {UIPageFilter, UIStructure} from "@/components/index.js"
import {HomePerson20Regular, Person32Regular} from "@vicons/fluent"
import {useAppSetting} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"

const store = useWorkerStore()
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

const filterCount = computed(()=>{
  return Number(Boolean(store.params.organizations.length>0)) + Number(Boolean(store.params.departments.length>0))
  + Number(Boolean(store.params.birthday)) + Number(Boolean(store.params.contract_type)) + Number(Boolean(store.params.position_type))
})

const clearFilter = ()=>{
  store.params.organizations = []
  store.params.departments = []
  store.params.positions = []
  store.params.birthday = null
  store.params.contract_type = null
  store.params.position_type = null
  filterEvent()
}

const onChangeDepartment = ()=>{
  componentStore.filterPositionParams.departments =store.params.departments.toString()
  componentStore.filterPositions = []
  componentStore._filterPosition()
  filterEvent()
}

const onChangeAge = ()=>{
  store.params.age_start  = store.params.ages[0]
  store.params.age_end  = store.params.ages[1]
  filterEvent()
}

onMounted(() => {
  componentStore._enums()
  componentStore._enumsAdmin()
})
</script>

<template>
  <UIPageFilter

      :search-loading="store.loading"
      :filter-count="filterCount"
      v-model:search="store.params.search"
      @onSearch="onSearch"
      @onClear="clearFilter"
      :show-add-button="false"
      :popoverStyle="{
        width:'600px',
      }"
  >
    <template #filterAction>
      <n-button
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
            <UIStructure
                :modelV="store.params.organizations"
                @updateModel="onChangeStructure"
                :checkedVal="store.structureCheck"
                @updateCheck="(v)=>store.structureCheck=v"
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






        </div>
        <div class="w-[100px] pl-[20px]">
          <n-slider
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

<style scoped>

</style>