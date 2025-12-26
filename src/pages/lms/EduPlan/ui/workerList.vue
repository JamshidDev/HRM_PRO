<script setup>
  import { NoDataPicture, UIPagination, UIUser } from '@/components/index.js'
  import { useEduPlanStore } from '@/store/modules/index.js'
  import { Delete20Filled } from '@vicons/fluent'

  const store = useEduPlanStore()

  const onDelete = (v) => {
    const data = {
      ids: [v.id]
    }
    store._detachWorkers(data)
  }

  const changePage = (v) => {
    store.workerParams.page = v.page
    store.workerParams.per_page = v.per_page
    store._attachedWorkers()
  }
</script>

<template>
  <n-spin :show="store.workerLoading" style="min-height: 200px">
    <div v-if="store.workerList.length > 0">
      <div class="w-full overflow-x-auto">
        <n-table class="mt-5" :single-line="false" size="small">
          <thead>
            <tr>
              <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
              <th class="min-w-[200px]">{{ $t('content.name') }}</th>
              <th class="w-[300px]">{{ $t('content.organization') }}</th>
              <th class="w-[200px]">{{ $t('content.phone') }}</th>
              <th class="w-[60px]"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in store.workerList" :key="idx">
              <td>
                <span class="text-center text-[12px] text-gray-600 block">{{
                  (store.workerParams.page - 1) * store.workerParams.per_page + idx + 1
                }}</span>
              </td>
              <td>
                <UIUser
                  :hide-tooltip="true"
                  :short="false"
                  :data="{
                    photo: item?.worker_position.worker.photo,
                    lastName: item?.worker_position.worker.last_name,
                    firstName: item?.worker_position.worker.first_name,
                    middleName: item?.worker_position.worker.middle_name,
                    position: item?.worker_position.post_short_name
                  }"
                />
              </td>
              <td class="!text-center">
                {{ item.worker_position?.organization?.name }}
              </td>
              <td class="!text-center">
                {{ item.worker_position?.phones.toString() }}
              </td>
              <td class="!text-center">
                <n-button
                  secondary
                  :loading="
                    store.deleteLoading && item.worker_position_id === store.selectedWorkers?.[0]
                  "
                  @click="onDelete(item)"
                  type="error"
                  size="small"
                  bordered
                >
                  <template #icon>
                    <Delete20Filled />
                  </template>
                </n-button>
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
