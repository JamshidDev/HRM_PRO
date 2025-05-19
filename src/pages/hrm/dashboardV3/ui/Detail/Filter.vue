<script setup>
import {Person32Regular, DocumentTable16Regular} from "@vicons/fluent";
import {useComponentStore, useDashboardStore} from "@/store/modules/index.js"
import {UIPageFilter} from "@/components/index.js"
import isdeepequal from "fast-deep-equal"
import dayjs from "dayjs"
import i18n from "@/i18n/index.js"

const {t} = i18n.global
const store = useDashboardStore()
const componentStore = useComponentStore()

const filtersCount = computed(() => {
  if (!store.activeDetail) return 0
  if (!store.activeDetail?.filters) return 0
  let a = 0
  for (let i of store.activeDetail.filters) {
    a += !isdeepequal(store.defaultParams[i], store.params[i])
  }
  return a
})

const filterEvent = () => {
  store._index_detail()
}


const clearFilters = () => {
  for (let i of store.activeDetail.filters) {
    store.params[i] = store.defaultParams[i]
  }
  filterEvent()
}

const marks = {
  1: "1",
  25: "25",
  50: "50",
  75: "75",
  100: "100"
}

const months = [
  "month.january",
  "month.february",
  "month.march",
  "month.april",
  "month.may",
  "month.june",
  "month.july",
  "month.august",
  "month.september",
  "month.october",
  "month.november",
  "month.december",
]

const passportFilter = [{
    label: t("dashboardPage.password.expired"),
    value: "expired"
  },{
    label: t("dashboardPage.password.approaching"),
    value: "approaching"
  },{
    label: t("dashboardPage.password.not_included"),
    value: "not_included"
  }]

onMounted(()=>{
  if (!componentStore.educationList.length) {
    componentStore._enums()
  }
})

// watch(() => store.params.organizations.length, (v) => {
//   store.params.page = 1
//   filterEvent()
// })


</script>
<template>
  <UIPageFilter
      :filter-count="filtersCount"
      @on-clear="clearFilters"
      v-model:search="store.params.search"
      @on-search="filterEvent"
      :search-loading="store.detailLoading"
      :show-add-button="false"
      :show-filter-button="!!store.activeDetail?.filters?.length"
  >
    <template #filterAction>
      <n-button
          type="success"
          icon-placement="right"
      >
<!--          @click="onExport"-->
        <template #icon>
          <n-icon :component="DocumentTable16Regular"/>
        </template>
        {{ $t('content.export') }}
      </n-button>
    </template>
    <template v-if="store.activeDetail?.filters?.length" #filterContent>
      <div class="flex flex-col gap-4">
        <div v-for="(i,idx) in store.activeDetail?.filters" :key="idx">
          <template v-if="i==='sex'">
            <label class="text-xs">{{ $t('workerPage.filter.sex') }}</label>
            <n-select
                v-model:value="store.params.sex"
                filterable
                @update:value="filterEvent"
                clearable
                :placeholder="$t(`content.choose`)"
                :options="componentStore.genderList"
                label-field="name"
                value-field="id"
                :ignore-composition="false"
            />
          </template>
          <template v-if="i==='ages'">
            <label class="text-xs">{{ $t('content.age') }}</label>
            <n-slider
                v-model:value="store.params.ages"
                @dragend="()=>{
                  store.params.age_start = Math.min(...store.params.ages)
                  store.params.age_end = Math.max(...store.params.ages)
                  filterEvent()
                }"
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
          </template>
          <template v-if="i==='birth_month'">
            <label class="text-xs">{{ $t('content.month') }}</label>
            <n-select
                :value="store.params.birth_month"
                :options="months.map((i, idx)=>{
                  return {label: $t(i), value:idx+1}
                })"
                @updateValue="(v)=>{
                  store.params.birth_month=v
                  store.params.birth_day=1
                  filterEvent()
                }"
            />
          </template>
          <template v-if="i==='birth_day'">
            <label class="text-xs">{{ $t('date.day') }}</label>
            <n-input-number
              class="grow"
              @updateValue="(v)=>{
                store.params.birth_day = v
                filterEvent()
              }"
              :min="1"
              :max="dayjs(`${2024}-${store.params.birth_month}-01`).daysInMonth()"
              :value="store.params.birth_day"
            />
          </template>
          <template v-if="i==='type'">
            <label class="text-xs">{{ $t('dashboardPage.edu.type') }}</label>
            <n-select
              :loading="componentStore.enumLoading"
              v-model:value="store.params.type"
              @update:value="filterEvent"
              clearable
              :placeholder="$t(`content.choose`)"
              :options="componentStore.educationList"
              label-field="name"
              value-field="id"
            />
          </template>
          <template v-if="i==='filter'">
            <label class="text-xs">{{ $t('dashboardPage.password.filter') }}</label>
            <n-select
              v-model:value="store.params.filter"
              @update:value="filterEvent"
              clearable
              :placeholder="$t(`content.choose`)"
              :options="passportFilter"
            />
          </template>
        </div>
      </div>
    </template>
  </UIPageFilter>
</template>
