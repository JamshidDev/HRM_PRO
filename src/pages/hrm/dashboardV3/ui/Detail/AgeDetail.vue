<script setup>
import {UIUser, UIPagination, NoDataPicture, UIPageFilter} from "@/components/index.js"
import {useComponentStore, useDashboardStore} from "@/store/modules/index.js"
import {Person32Regular} from "@vicons/fluent"

import i18n from "@/i18n/index.js"

const {t} = i18n.global

const store = useDashboardStore()
const componentStore = useComponentStore()

const filterEvent = ()=>{
  store._ageDetail()
}

onMounted(() => {
  filterEvent()
})

const changePage = (v) => {
  store.detail.ageParams.page = v.page
  store.detail.ageParams.per_page = v.per_page
  filterEvent()
}

const onSearch = () => {
  store.detail.ageParams.page = 1
  filterEvent()
}

watch(() => store.params.organizations.length, () => {
  store.detail.ageParams.page = 1
  filterEvent()
})


const marks = {
  1: "1",
  25: "25",
  50: "50",
  75: "75",
  100: "100"
}



const onChangeAge = () => {
  store.detail.ageParams.age_start = Math.min(...store.detail.ageParams.ages)
  store.params.age_end = Math.max(...store.detail.ageParams.ages)
  filterEvent()
}
const filtersCount = computed(()=>{

  let a = store.detail.ageParams.sex!==undefined && store.detail.ageParams.sex!==null ;
  a+=(store.detail.ageParams.ages[0]!==1 || store.detail.ageParams.ages[1]!==100);
  store.detail.ageParams.age_start = 0
  store.detail.ageParams.age_end = 100
  return a
})

const clearFilters = ()=>{
  store.detail.ageParams.sex = null
  store.detail.ageParams.ages = [1,100]
  store.detail.ageParams.age_start = 0
  store.detail.ageParams.age_end = 100
  filterEvent()
}

</script>

<template>
  <n-spin :show="store.detail.agesLoading" class="pt-2">
    <UIPageFilter
        :filter-count="filtersCount"
        @on-clear="clearFilters"
        v-model:search="store.detail.ageParams.search"
        @on-search="onSearch"
        :search-loading="store.detail.agesLoading"
        :show-add-button="false"
    >
      <template #filterContent>
        <div class="flex flex-col gap-4">
          <div>
            <label class="text-xs">{{ $t('workerPage.filter.sex') }}</label>
            <n-select
                v-model:value="store.detail.ageParams.sex"
                filterable
                @update:value="filterEvent"
                clearable
                :placeholder="$t(`content.choose`)"
                :options="componentStore.genderList"
                label-field="name"
                value-field="id"
                :ignore-composition="false"
            />
          </div>
          <div>
            <label class="text-xs">{{ $t('content.age') }}</label>
            <n-slider
                v-model:value="store.detail.ageParams.ages"
                @dragend="onChangeAge"
                :marks="marks"
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
    <n-table
        class="mt-4"
        :single-line="false"
        size="small"
    >
      <thead>
      <tr>
        <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
        <th class="text-center!">{{ $t('content.worker') }}</th>
        <th class="min-w-[100px]">{{ $t('content.organization') }}</th>
        <th class="min-w-[100px]">{{ $t('content.department') }}</th>
        <th class="min-w-[100px] !text-center">{{ $t('content.birthday') }}</th>
        <th class="min-w-[100px] !text-center">{{ $t('content.age') }}</th>
      </tr>
      </thead>
      <tbody class="sort-target">
      <tr v-for="(item, idx) in store.detail.ages" :key="idx">
        <td><span class="text-center text-[12px] text-gray-600 block">{{
            (store.detail.ageParams.page - 1) * store.detail.ageParams.per_page + idx + 1
          }}</span></td>
        <td>
          <UIUser
              :data="{
                photo:item?.worker?.photo,
                lastName:item?.worker?.last_name,
                firstName:item?.worker?.first_name,
                middleName:item?.worker?.middle_name,
                position:item?.position?.name
              }"
          />
        </td>
        <td>{{ item.organization.name }}</td>
        <td>{{ item.department.name }}</td>
        <td class="!text-center">
          <n-button type="primary" dashed round size="small">{{ item.worker.birthday }}</n-button>
        </td>
        <td class="!text-center">
          <n-button circle size="small">{{ item.worker.age }}</n-button>
        </td>

      </tr>
      </tbody>
    </n-table>
    <UIPagination
        :page="store.detail.ageParams.page"
        :per_page="store.detail.ageParams.per_page"
        :total="store.detail.agesTotal"
        @change-page="changePage"
    />
    <NoDataPicture v-if="store.detail.ages.length===0 && !store.detail.agesLoading"/>
  </n-spin>
</template>