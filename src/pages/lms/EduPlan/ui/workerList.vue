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
      <!-- >= md (768px): to'liq jadval -->
      <div class="w-full overflow-x-auto hidden md:block">
        <n-table class="mt-5 min-w-[860px] table-fixed" :single-line="false" size="small">
          <colgroup>
            <col class="w-[52px]" />
            <col />
            <col class="w-[34%]" />
            <col class="w-[170px]" />
            <col class="w-[64px]" />
          </colgroup>
          <thead>
            <tr>
              <th class="text-center!">{{ $t('content.number') }}</th>
              <th>{{ $t('content.name') }}</th>
              <th>{{ $t('content.organization') }}</th>
              <th class="text-center!">{{ $t('content.phone') }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in store.workerList" :key="idx">
              <td>
                <span class="text-center text-[12px] text-gray-600 block">{{
                  (store.workerParams.page - 1) * store.workerParams.per_page + idx + 1
                }}</span>
              </td>
              <td class="overflow-hidden">
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
              <td>
                <span
                  class="line-clamp-2 break-words"
                  :title="item.worker_position?.organization?.name"
                >
                  {{ item.worker_position?.organization?.name }}
                </span>
              </td>
              <td class="!text-center">
                <div
                  v-for="phone in item.worker_position?.phones || []"
                  :key="phone"
                  class="whitespace-nowrap"
                >
                  {{ phone }}
                </div>
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

      <!-- < md (768px): karta ko'rinishi — gorizontal scroll o'rniga vertikal stack -->
      <div class="flex flex-col gap-2 mt-5 md:hidden">
        <div
          v-for="(item, idx) in store.workerList"
          :key="idx"
          class="rounded-xl border border-surface-line bg-surface-section p-3 flex flex-col gap-2"
        >
          <div class="flex items-start gap-2">
            <span class="text-[12px] text-gray-600 shrink-0 pt-1 w-5 text-center">{{
              (store.workerParams.page - 1) * store.workerParams.per_page + idx + 1
            }}</span>
            <div class="min-w-0 flex-1">
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
            </div>
          </div>

          <div class="pl-7 flex flex-col gap-1 text-xs text-textColor2">
            <div v-if="item.worker_position?.organization?.name" class="flex gap-1">
              <span class="text-textColor3 shrink-0">{{ $t('content.organization') }}:</span>
              <span class="truncate">{{ item.worker_position.organization.name }}</span>
            </div>
            <div v-if="item.worker_position?.phones?.length" class="flex gap-1">
              <span class="text-textColor3 shrink-0">{{ $t('content.phone') }}:</span>
              <span class="truncate">{{ item.worker_position.phones.join(', ') }}</span>
            </div>
          </div>

          <div class="pl-7 flex justify-end">
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
          </div>
        </div>
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
