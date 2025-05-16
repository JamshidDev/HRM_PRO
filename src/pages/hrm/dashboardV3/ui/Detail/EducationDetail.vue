<script setup>
import {UIUser, UIPagination, NoDataPicture, UIPageFilter} from "@/components/index.js"
import {useComponentStore, useDashboardStore} from "@/store/modules/index.js"

import i18n from "@/i18n/index.js"

const {t} = i18n.global

const store = useDashboardStore()
const componentStore = useComponentStore()

const filterEvent = ()=>{
  store._educationDetail()
}

onMounted(() => {
  if(!componentStore.educationList.length){
    componentStore._enums()
  }
  filterEvent()
})

const changePage = (v) => {
  store.detail.educationListParams.page = v.page
  store.detail.educationListParams.per_page = v.per_page
  filterEvent()
}

const onSearch = () => {
  store.detail.educationListParams.page = 1
  filterEvent()
}

watch(() => store.params.organizations.length, () => {
  store.detail.educationListParams.page = 1
  filterEvent()
})




</script>

<template>
  <n-spin :show="store.detail.educationListLoading" class="pt-2">
    <UIPageFilter
        v-model:search="store.detail.educationListParams.search"
        @on-search="onSearch"
        :search-loading="store.detail.educationListLoading"
        :show-add-button="false"
        :show-filter-button="false"
    >
      <template #filterAction>
        <div class="w-[400px]">
          <n-select
              :loading="componentStore.enumLoading"
              v-model:value="store.detail.educationListParams.type"
              @update:value="filterEvent"
              clearable
              :placeholder="$t(`dashboardPage.edu.chooseEdu`)"
              :options="componentStore.educationList"
              label-field="name"
              value-field="id"
          />
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
        <th class="min-w-[100px] !text-center">{{ $t('content.university') }}</th>
      </tr>
      </thead>
      <tbody class="sort-target">
      <tr v-for="(item, idx) in store.detail.educationList" :key="idx">
        <td><span class="text-center text-[12px] text-gray-600 block">{{
            (store.detail.educationListParams.page - 1) * store.detail.educationListParams.per_page + idx + 1
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
          {{item.universities?.[0]?.university}}
        </td>

      </tr>
      </tbody>
    </n-table>
    <UIPagination
        :page="store.detail.educationListParams.page"
        :per_page="store.detail.educationListParams.per_page"
        :total="store.detail.educationListTotal"
        @change-page="changePage"
    />
    <NoDataPicture v-if="store.detail.educationList.length===0 && !store.detail.educationListLoading"/>
  </n-spin>
</template>