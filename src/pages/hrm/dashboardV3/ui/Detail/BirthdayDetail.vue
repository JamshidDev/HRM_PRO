<script setup>

import {UIMenuButton, UIUser, UIPagination, NoDataPicture, UIPageFilter} from "@/components/index.js"
import {useDashboardStore} from "@/store/modules/index.js"

const store = useDashboardStore()

onMounted(()=>{
  store.detail.birthdayParams.birth_day = new Date().getDate()
  store.detail.birthdayParams.birth_month = new Date().getMonth() + 1
  store._birthdayDetail()
})

const changePage = (v)=>{
  store.detail.birthdayParams.page = v.page
  store.detail.birthdayParams.per_page = v.per_page
  store._birthdayDetail()
}

const onSearch = (v)=>{
  store.detail.birthdayParams.page = 1
  store._birthdayDetail()
}
</script>

<template>
  <n-spin :show="store.detail.birthdaysLoading">
    <UIPageFilter
        v-model:search="store.detail.birthdayParams.search"
        @on-search="onSearch"
        :search-loading="store.loading"
        :show-add-button="false"
    />
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
<!--        <td>-->
<!--          <n-button secondary type="primary" size="small" class="handle">-->
<!--            <template #icon>-->
<!--              <n-icon>-->
<!--                <Drag24Regular/>-->
<!--              </n-icon>-->
<!--            </template>-->
<!--          </n-button>-->
<!--        </td>-->
<!--        <td><span class="text-sm">{{item.relative.name}}</span></td>-->
<!--        <td>{{item.last_name+' '+item.first_name+' '+item.middle_name}}</td>-->
<!--        <td>{{item.post_name}}</td>-->
<!--        <td>{{Utils.timeOnlyDate(item.birthday)}}</td>-->
<!--        <td>{{item.birth_place}}</td>-->
<!--        <td>{{item.address}}</td>-->
<!--        <td>-->
<!--          <UIMenuButton-->
<!--              :data="item"-->
<!--              :show-edit="true"-->
<!--              @selectEv="onSelectEv"-->
<!--          />-->
<!--        </td>-->
      </tr>
      </tbody>
    </n-table>
    <UIPagination
        :page="store.params.page"
        :per_page="store.params.size"
        :total="store.detail.birthdaysTotal"
        @change-page="changePage"
    />
    <NoDataPicture v-if="store.detail.birthdays.length===0 && !store.detail.birthdaysLoading" />
  </n-spin>
</template>