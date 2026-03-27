<script setup>
  import { UIUser, UIPagination, NoDataPicture, UIBadge } from '@/components/index.js'
  import { useDashboardStore } from '@/store/modules/index.js'
  import UIHelper from "@utils/UIHelper.js"
  import {Utils} from "@utils"

  const store = useDashboardStore()

  function filterEvent() {
    store._index_detail()
  }

  onMounted(() => {
    if (!store.params.type) {
      store.params.type = 'ended'
    }
    if (!store.params.month) {
      store.params.month = new Date().getMonth() || 12
    }
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
    <n-table class="mt-4" :single-line="false" size="small" v-if="store.detailData?.length">
      <thead>
        <tr>
          <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
          <th>{{ $t('content.worker') }}</th>
          <th class="min-w-[100px] w-[300px]">{{ $t('content.organization') }}</th>
          <th class="min-w-[100px] w-[140px] !text-center">{{ $t('content.from') }}</th>
          <th class="min-w-[100px] w-[140px] !text-center">{{ $t('content.to') }}</th>
          <th class="min-w-[100px] w-[140px]">{{ $t('content.status') }}</th>
        </tr>
      </thead>
      <tbody class="sort-target">
        <tr v-for="(item, idx) in store.detailData" :key="idx">
          <td>
            <span class="text-center text-[12px] text-gray-600 block">{{
              (store.params.page - 1) * store.params.per_page + idx + 1
            }}</span>
          </td>
          <td>
            <UIUser
              :hide-tooltip="true"
              :short="false"
              :data="{
                photo: item?.worker?.photo,
                lastName: item?.worker?.last_name,
                firstName: item?.worker?.first_name,
                middleName: item?.worker?.middle_name,
                position: item?.type
              }"
            />
          </td>
          <td>{{ item?.organization?.name }}</td>
          <td class="!text-center">
            <UIBadge v-if="item?.from" :show-icon="false" :label="item.from" />
          </td>
          <td class="!text-center">
            <UIBadge v-if="item?.to" :show-icon="false" :label="item.to" />
          </td>
          <td class="!text-center">
            <UIBadge
              v-if="item?.status"
              :show-icon="false"
              :label="item.status.name"
              :type="item.status.id === 'active' ? Utils.colorTypes.success : Utils.colorTypes.error"
            />
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
    <NoDataPicture v-if="!store.detailData?.length && !store.detailLoading" />
  </n-spin>
</template>
