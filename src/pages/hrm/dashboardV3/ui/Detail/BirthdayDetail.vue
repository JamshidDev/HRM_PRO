<script setup>

import {UIMenuButton, UIUser, UIPagination, NoDataPicture, UIPageFilter} from "@/components/index.js"
import {useDashboardStore} from "@/store/modules/index.js"

const store = useDashboardStore()

function filterEvent(){
  store._birthdayDetail()
}

onMounted(()=>{
  store.detail.birthdayParams.timestamp = new Date().getTime()
  filterEvent()
})

const changePage = (v)=>{
  store.detail.birthdayParams.page = v.page
  store.detail.birthdayParams.per_page = v.per_page
  filterEvent()
}

const onSearch = ()=>{
  store.detail.birthdayParams.page = 1
  filterEvent()
}

watch(()=>store.params.organizations.length, (v)=>{
  console.log(v)
  store.detail.birthdayParams.page = 1
  filterEvent()
})

const onUpdateDate = (v)=>{
  store.detail.birthdayParams.page = 1
  store.detail.birthdayParams.timestamp = v
  filterEvent()
}

</script>

<template>
  <n-spin :show="store.detail.birthdaysLoading">
    <UIPageFilter
        v-model:search="store.detail.birthdayParams.search"
        @on-search="onSearch"
        :search-loading="store.loading"
        :show-add-button="false"
        :show-filter-button="false"
    >
      <template #filterAction>
        <n-date-picker :value="store.detail.birthdayParams.timestamp" @updateValue="onUpdateDate" type="date"  />
      </template>
    </UIPageFilter>
    <n-table
        class="mt-4"
        :single-line="false"
        size="small"
    >
      <thead>
      <tr>
        <th class="text-center! min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
        <th class="text-center!">{{$t('content.worker')}}</th>
        <th class="min-w-[100px]">{{$t('content.organization')}}</th>
        <th class="min-w-[100px]">{{$t('content.department')}}</th>
      </tr>
      </thead>
      <tbody class="sort-target">
      <tr v-for="(item, idx) in store.detail.birthdays" :key="idx">
        <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.detail.birthdayParams.page - 1) * store.detail.birthdayParams.per_page + idx + 1 }}</span></td>
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
        <td>{{item.organization.name}}</td>
        <td>{{item.department.name}}</td>
      </tr>
      </tbody>
    </n-table>
    <UIPagination
        :page="store.detail.birthdayParams.page"
        :per_page="store.detail.birthdayParams.per_page"
        :total="store.detail.birthdaysTotal"
        @change-page="changePage"
    />
    <NoDataPicture v-if="store.detail.birthdays.length===0 && !store.detail.birthdaysLoading" />
  </n-spin>
</template>