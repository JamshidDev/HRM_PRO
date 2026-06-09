<script setup>
  import { NoDataPicture, UIMenuButton, UIPagination, UIStatus } from '@/components/index.js'
  import { useStructureReportStore, useComponentStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'

  const store = useStructureReportStore()
  const componentStore = useComponentStore()
  const emits = defineEmits(['openOffice'])

  const onOpenFile = (v) => {
    emits('openOffice', v)
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onSelect = (v) => {
    if (v.key === 'view') {
      emits('openOffice', v.data.id)
    } else if (v.key === Utils.ActionTypes.edit) {
      if (componentStore.structureList.length === 0) {
        componentStore._structures()
      }
      store.openEditModal(v.data.uuid || v.data.id)
    } else if (v.key === Utils.ActionTypes.download) {
      store.openExcelModal(v.data.uuid || v.data.id)
    } else if (v.key === Utils.ActionTypes.delete) {
      store._delete(v.data.id)
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
            <th class="min-w-[120px] w-[200px]">{{ $t('content.date') }}</th>
            <th class="min-w-[200px]">{{ $t('content.organization') }}</th>
            <th class="min-w-[60px] w-[60px]">{{ $t('content.count') }}</th>
            <th class="min-w-[100px] w-[100px]">{{ $t('content.status') }}</th>
            <th class="min-w-[100px] w-[100px]">{{ $t('content.document') }}</th>
            <th class="min-w-[100px] w-[100px]">{{ $t('content.createdDate') }}</th>
            <th class="min-w-[40px] w-[40px]"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in store.list" :key="item.id">
            <td>
              <span class="text-center text-[12px] text-gray-600 block">
                {{ (store.params.page - 1) * store.params.per_page + idx + 1 }}
              </span>
            </td>
            <td>
              <div
                @click="onOpenFile(item.id)"
                class="group flex flex-col hover:!text-primary hover:underline cursor-pointer"
              >
                <span class="text-sm line-clamp-2 leading-[1.2] font-medium">
                  {{ Utils.getMonthNameById(item.month) }} {{ item.year }}
                </span>
                <span class="text-xs rounded-2xl px-1 text-secondary group-hover:!text-primary">
                  {{ Utils.timeHHMMWithMonth(item.created_at) }}
                </span>
              </div>
            </td>
            <td>
              <span class="text-sm">{{ item.organization?.name }}</span>
            </td>
            <td>
              <div class="flex justify-center">
                <n-button type="primary" class="font-medium" round dashed size="tiny">
                  {{ item.details_count }}
                </n-button>
              </div>
            </td>
            <td>
              <UIStatus :status="item?.confirmation" />
            </td>
            <td>
              <UIStatus :status="Utils.documentStatus[item?.generate]" />
            </td>
            <td>{{ Utils.timeOnlyDate(item?.created_at) }}</td>
            <td>
              <UIMenuButton
                :show-view="true"
                :show-edit="true"
                :show-download="true"
                :show-delete="true"
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
