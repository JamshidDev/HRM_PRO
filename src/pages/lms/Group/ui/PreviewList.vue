<script setup>
  import { NoDataPicture, UIPagination, UIUser, UIBadge } from '@/components/index.js'
  import { useComponentStore, useLmsGroupStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'

  const store = useLmsGroupStore()
  const componentStore = useComponentStore()

  const onDelete = (v) => {
    store.selectedWorkers = [v.worker_position_id]
    store._delete()
  }

  const changePage = (v) => {
    store.workerParams.page = v.page
    store.workerParams.per_page = v.per_page
    store._index()
  }
</script>

<template>
  <n-spin :show="store.workerLoading" style="min-height: 200px">
    <div v-if="store.workerList.length > 0">
      <div class="w-full overflow-x-auto min-h-[calc(100vh-400px)]">
        <n-table class="mt-5" :single-line="false" size="small">
          <thead>
            <tr>
              <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
              <th class="min-w-[300px]">{{ $t('content.worker') }}</th>
              <th class="w-[120px]">{{ $t('content.action') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in store.workerList" :key="idx">
              <td>
                <span class="text-center text-[12px] text-gray-600 block">{{
                  (store.params.page - 1) * store.params.per_page + idx + 1
                }}</span>
              </td>
              <td>
                <UIUser
                  :short="false"
                  :data="{
                    photo: item?.worker.photo,
                    lastName: item?.worker.last_name,
                    firstName: item?.worker.first_name,
                    middleName: item?.worker.middle_name,
                    position: item?.position
                  }"
                />
              </td>
              <td class="text-center">
                <n-button
                  :loading="
                    store.deleteLoading && item.worker_position_id === store.selectedWorkers?.[0]
                  "
                  @click="onDelete(item)"
                  type="error"
                  size="small"
                  bordered
                  >{{ $t('content.delete') }}</n-button
                >
              </td>
            </tr>
          </tbody>
        </n-table>
      </div>
      <UIPagination
        :page="store.workerParams.page"
        :per_page="store.workerParams.per_page"
        :total="store.totalWorker"
        @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.workerList.length === 0 && !store.workerLoading" />
  </n-spin>
</template>
