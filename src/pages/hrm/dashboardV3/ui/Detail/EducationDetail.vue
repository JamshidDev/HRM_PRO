<script setup>
import {UIUser, UIPagination, NoDataPicture, UIPageFilter, UIMenuButton, UIDrawer} from "@/components/index.js"
import {useComponentStore, useDashboardStore} from "@/store/modules/index.js"

import Utils from "@/utils/Utils.js"
import {HatGraduation12Filled} from "@vicons/fluent"

const store = useDashboardStore()
const componentStore = useComponentStore()

const filterEvent = () => {
  store._index_detail()
}

onMounted(() => {
  if (!componentStore.educationList.length) {
    componentStore._enums()
  }
  filterEvent()
})

const changePage = (v) => {
  store.params.page = v.page
  store.params.per_page = v.per_page
  filterEvent()
}

const detail = ref(null)

const onSelectEv = (v) => {
  if (v.key === Utils.ActionTypes.view) {
   detail.value = v.data
  }
}

</script>

<template>
  <n-spin :show="store.detailLoading" class="pt-2">
    <n-table
        class="mt-4"
        :single-line="false"
        size="small"
    >
      <thead>
      <tr>
        <th class="text-center min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
        <th class="text-center max-w-[210px] w-[210px]">{{ $t('content.worker') }}</th>
        <th class="max-w-[250px] w-[250px]">{{ $t('content.organization') }}</th>
        <th class="!text-center max-w-[210px] w-[210px]">{{ $t('content.department') }}</th>
        <th class="min-w-[100px] !text-center">{{ $t('content.university') }}</th>
        <th class="text-center! max-w-[80px] w-[80px]">{{ $t('content.action') }}</th>
      </tr>
      </thead>
      <tbody class="sort-target">
      <tr v-for="(item, idx) in store.detailData" :key="idx">
        <td><span class="text-center text-[12px] text-gray-600 block">{{
            (store.params.page - 1) * store.params.per_page + idx + 1
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
        <td class="text-center">{{ item.department.name }}</td>
        <td class="!text-center">
          <p v-if="item.universities?.[0]">{{ item.universities?.[0]?.university }} - <span class="text-primary">{{item.universities?.[0]?.education}}</span> - <span class="text-secondary">({{ Utils.timeOnlyYear(item.universities?.[0]?.from_date) + ' - ' + Utils.timeOnlyYear(item.universities?.[0]?.to_date) }})</span>
            <n-button v-if="item.universities.length>1" type="primary" tertiary circle size="tiny">
              +{{ item.universities.length - 1 }}
            </n-button>
          </p>
        </td>
        <td>
          <UIMenuButton
              :show-delete="false"
              show-view
              :data="item"
              @select-ev="onSelectEv"
          />
        </td>
      </tr>
      </tbody>
    </n-table>
    <UIPagination
        :page="store.params.page"
        :per_page="store.params.per_page"
        :total="store.detailDataTotal"
        @change-page="changePage"
    />
    <NoDataPicture v-if="!store.detailData?.length && !store.detailLoading"/>
  </n-spin>
  <UIDrawer
      :visible="!!detail"
      @update:visible="()=>detail = null"
      :title="detail ? Utils.combineFullName(detail.worker) : ''"
  >

    <template #content v-if="detail">
      <n-timeline item-placement="right" class="w-full mt-3">
        <template
            v-for="(item, idx) in detail.universities" :key="idx"
        >
          <n-timeline-item

              type="info"
              :time="Utils.timeOnlyYear(item?.from_date) + ' - ' + Utils.timeOnlyYear(item?.to_date)"
              :title="item.university"
              :content="item.speciality"
              line-type="dashed"
          >
            <template #icon>
              <n-icon size="24" class="text-primary">
                <HatGraduation12Filled/>
              </n-icon>
            </template>
          </n-timeline-item>
        </template>

      </n-timeline>
    </template>
  </UIDrawer>
</template>