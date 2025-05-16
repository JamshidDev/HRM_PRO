<script setup>

import {UIMenuButton, UIUser, UIPagination, NoDataPicture, UIPageFilter} from "@/components/index.js"
import {useDashboardStore} from "@/store/modules/index.js"
import i18n from "@/i18n/index.js"
import dayjs from "dayjs"

const {t} = i18n.global
const store = useDashboardStore()

function filterEvent() {
  store._birthdayDetail()
}

onMounted(() => {
  store.detail.birthdayParams.birth_month = new Date().getMonth() + 1
  store.detail.birthdayParams.birth_day = new Date().getDate()
  filterEvent()
})

const changePage = (v) => {
  store.detail.birthdayParams.page = v.page
  store.detail.birthdayParams.per_page = v.per_page
  filterEvent()
}

const onSearch = () => {
  store.detail.birthdayParams.page = 1
  filterEvent()
}

watch(() => store.params.organizations.length, (v) => {
  console.log(v)
  store.detail.birthdayParams.page = 1
  filterEvent()
})

const onUpdateDate = (v) => {
  store.detail.birthdayParams.page = 1
  console.log(store.detail.birthdayParams)
  filterEvent()
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


</script>

<template>
  <n-spin :show="store.detail.birthdaysLoading">
    <UIPageFilter
        v-model:search="store.detail.birthdayParams.search"
        @on-search="onSearch"
        :search-loading="store.detail.birthdaysLoading"
        :show-add-button="false"
        :show-filter-button="false"
    >
      <template #filterAction>
        <div class="flex gap-4 w-[400px]">
          <div class="grow basis-[40%]">
            <n-select
                label="Search"
                class="grow"

                :value="store.detail.birthdayParams.birth_month"
                :options="months.map((i, idx)=>{
                return {label: t(i), value:idx+1}
            })"
                @updateValue="(v)=>{
                  store.detail.birthdayParams.birth_month=v
                  store.detail.birthdayParams.birth_day=1
                  filterEvent()
            }"
            />
          </div>
          <div class="grow basis-[40%]">
            <n-input-number
                class="grow"
                @updateValue="(v)=>{
            store.detail.birthdayParams.birth_day = v
            filterEvent()
          }"
                :min="1"
                :max="dayjs(`${2024}-${store.detail.birthdayParams.birth_month}-01`).daysInMonth()"
                :value="store.detail.birthdayParams.birth_day"
            />
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
      <tr v-for="(item, idx) in store.detail.birthdays" :key="idx">
        <td><span class="text-center text-[12px] text-gray-600 block">{{
            (store.detail.birthdayParams.page - 1) * store.detail.birthdayParams.per_page + idx + 1
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
        <td class="!text-center"><n-button type="primary" dashed round size="small">{{ item.worker.birthday }}</n-button></td>
        <td class="!text-center"><n-button circle size="small">{{ item.worker.age }}</n-button></td>

      </tr>
      </tbody>
    </n-table>
    <UIPagination
        :page="store.detail.birthdayParams.page"
        :per_page="store.detail.birthdayParams.per_page"
        :total="store.detail.birthdaysTotal"
        @change-page="changePage"
    />
    <NoDataPicture v-if="store.detail.birthdays.length===0 && !store.detail.birthdaysLoading"/>
  </n-spin>
</template>