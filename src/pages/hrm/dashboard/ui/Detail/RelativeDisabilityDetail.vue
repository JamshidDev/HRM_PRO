<script setup>
  import { UIUser, UIPagination, NoDataPicture, UIBadge } from '@/components/index.js'
  import { useDashboardStore } from '@/store/modules/index.js'

  const store = useDashboardStore()

  const filterEvent = () => {
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
    <n-table v-if="store.detailData?.length" class="mt-4" :single-line="false" size="small">
      <thead>
        <tr>
          <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
          <th class="min-w-[240px]">{{ $t('content.worker') }}</th>
          <th class="min-w-[200px]">{{ $t('dashboardPage.disability.relative') }}</th>
          <th class="min-w-[160px]">{{ $t('content.organization') }}</th>
          <th class="min-w-[80px] w-[80px] text-center!">{{ $t('dashboardPage.disability.groupTitle') }}</th>
          <th class="min-w-[120px]">{{ $t('dashboardPage.disability.number') }}</th>
          <th class="min-w-[120px]">{{ $t('dashboardPage.disability.fromDate') }}</th>
          <th class="min-w-[120px]">{{ $t('dashboardPage.disability.toDate') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in store.detailData" :key="item.id">
          <td>
            <span class="text-center text-[12px] text-gray-600 block">
              {{ (store.params.page - 1) * store.params.per_page + idx + 1 }}
            </span>
          </td>
          <td>
            <UIUser
              :short="false"
              :data="{
                photo: item?.worker?.photo,
                lastName: item?.worker?.last_name,
                firstName: item?.worker?.first_name,
                middleName: item?.worker?.middle_name,
              }"
            >
              <template #position>
                <span class="text-xs text-textColor3">{{ item?.position?.name }}</span>
              </template>
            </UIUser>
          </td>
          <td>
            <div class="flex flex-col gap-0.5">
              <span class="text-[13px] font-medium text-textColor0">
                {{ item.relative.last_name }} {{ item.relative.first_name }}
              </span>
              <span class="text-xs text-textColor3">{{ item.relative.relative_name }}</span>
            </div>
          </td>
          <td>
            <span class="text-[13px]">{{ item?.organization?.name }}</span>
          </td>
          <td class="text-center!">
            <n-tag type="warning" size="small" round>
              {{ item.level }}-{{ $t('dashboardPage.disability.group') }}
            </n-tag>
          </td>
          <td>
            <n-button dashed type="primary" round size="small">
              {{ item.number }}
            </n-button>
          </td>
          <td>
            <UIBadge :show-icon="false" :label="item.from" />
          </td>
          <td>
            <UIBadge v-if="item.to" :show-icon="false" :label="item.to" />
            <UIBadge v-else :show-icon="false" :label="$t('dashboardPage.disability.unlimited')" type="Error" />
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
