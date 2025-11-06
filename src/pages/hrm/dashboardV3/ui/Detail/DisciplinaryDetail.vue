<script setup>
import {UIUser, UIPagination, NoDataPicture, UIBadge} from "@/components/index.js"
import {useDashboardStore} from "@/store/modules/index.js"

const store = useDashboardStore()

function filterEvent() {
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
  <n-spin :show="store.detailLoading">
    <n-table
        class="mt-4"
        :single-line="false"
        size="small"
        v-if="store.detailData?.length"
    >
      <thead>
      <tr>
        <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
        <th>{{ $t('content.worker') }}</th>
        <th class="min-w-[100px] w-[140px]">{{ $t('content.type') }}</th>
        <th class="min-w-[100px] w-[300px]">{{ $t('content.organization') }}</th>
        <th class="min-w-[100px] w-[300px]">{{ $t('incentive.form.reason') }}</th>
        <th class="min-w-[100px] w-[100px]">{{ $t('content.number') }}</th>
        <th class="min-w-[100px] w-[140px]">{{ $t('content.date') }}</th>
      </tr>
      </thead>
      <tbody class="sort-target">
      <tr v-for="(item, idx) in store.detailData" :key="idx">
        <td><span class="text-center text-[12px] text-gray-600 block">{{
            (store.params.page - 1) * store.params.per_page + idx + 1
          }}</span></td>
        <td>
          <UIUser
              :hide-tooltip="true"
              :data="{
                photo:item?.worker_position?.worker.photo,
                lastName:item?.worker_position?.worker.last_name,
                firstName:item?.worker_position?.worker.first_name,
                middleName:item?.worker_position?.worker.middle_name,
                position:item?.worker_position?.post_short_name
              }"
          />
        </td>
        <td>{{item?.fine}}</td>
        <td>{{item?.organization?.name}}</td>
        <td>{{item?.reason}}</td>
        <td>{{item?.number}}</td>
        <td>
          <UIBadge :show-icon="false" :label="item.date" />
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