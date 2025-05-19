<script setup>
import {UIUser, UIPagination, NoDataPicture} from "@/components/index.js"
import {useDashboardStore} from "@/store/modules/index.js"

const store = useDashboardStore()

const filterEvent = ()=>{
  store._index_detail()
}

onMounted(() => {
  filterEvent()
})

const changePage = (v) => {
  store.params.page = v.page
  store.params.per_page = v.per_page
  filterEvent()
}

</script>

<template>
  <n-spin :show="store.detailLoading" class="pt-2">
    <n-table
        v-if="store.detailData?.length"
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
        v-if="store.detailData?.length"
        :page="store.params.page"
        :per_page="store.params.per_page"
        :total="store.detailDataTotal"
        @change-page="changePage"
    />
    <NoDataPicture v-if="!store.detailData?.length && !store.detailLoading"/>
  </n-spin>
</template>