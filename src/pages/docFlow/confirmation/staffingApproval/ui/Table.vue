<script setup>
  import { NoDataPicture, UIMenuButton, UIPagination, UIStatus } from '@/components/index.js'
  import { useAccountStore, useConfStaffingApprovalStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'

  const store = useConfStaffingApprovalStore()
  const accStore = useAccountStore()
  const emits = defineEmits(['openOffice'])

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onOpen = (id) => {
    emits('openOffice', id)
  }

  const onSelect = (v) => {
    store.elementId = v.data.id
    if (v.key === 'view') {
      onOpen(v.data.id)
    }
  }
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto" v-if="store.list.length > 0">
      <n-table class="mt-4" :single-line="false" size="small">
        <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
            <th class="min-w-[60px] w-[60px]">{{ $t('confirmation.contract.form.number') }}</th>
            <th class="min-w-[100px]">
              {{ $t('confirmation.contract.form.organization') }}
            </th>
            <th class="min-w-[100px] w-[100px]">{{ $t('content.status') }}</th>
            <th class="min-w-[100px] w-[100px]">{{ $t('content.document') }}</th>
            <th class="min-w-[100px] w-[100px]">{{ $t('content.date') }}</th>
            <th class="min-w-[40px] w-[40px]"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in store.list" :key="idx">
            <td>
              <span class="text-center text-[12px] text-gray-600 block">{{
                (store.params.page - 1) * store.params.per_page + idx + 1
              }}</span>
            </td>
            <td @click="onOpen(item.id)">
              <div class="flex justify-center">
                <n-button type="primary" class="font-medium" round dashed size="tiny">{{
                  item?.staffing_approve?.number
                }}</n-button>
              </div>
            </td>

            <td>{{ item?.staffing_approve?.organization?.name }}</td>
            <td><UIStatus :status="item?.staffing_approve?.confirmation" /></td>
            <td><UIStatus :status="Utils.documentStatus[item?.generate]" /></td>
            <td>{{ Utils.timeOnlyDate(item?.staffing_approve?.date) }}</td>
            <td>
              <UIMenuButton
                :show-view="true"
                :show-delete="false"
                :data="item"
                @selectEv="onSelect"
              />
            </td>
          </tr>
        </tbody>
      </n-table>
      <UIPagination
        :page="store.params.page"
        :per_page="store.params.per_page"
        :total="store.totalItems"
        @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length === 0 && !store.loading" />
  </n-spin>
</template>
