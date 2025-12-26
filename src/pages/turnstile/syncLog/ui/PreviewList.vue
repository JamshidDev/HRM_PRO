<script setup>
  import { NoDataPicture, UIBadge } from '@/components/index.js'
  import { useSyncLogStore } from '@/store/modules/index.js'
  import { PersonAvailable20Filled } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import SortBtn from '@/pages/turnstile/syncLog/ui/SortBtn.vue'

  const { t } = i18n.global
  const store = useSyncLogStore()

  const sortByTime = () => {
    store.sortByCount = 0
    store.sortByTime = store.sortByTime === -1 ? 1 : -1
    store.previewList.sort((a, b) => {
      const aItem = new Date(a.device?.last_sync).getTime()
      const bItem = new Date(b.device?.last_sync).getTime()
      return store.sortByTime === 1 ? aItem - bItem : bItem - aItem
    })
  }

  const sortByCount = () => {
    store.sortByTime = 0
    store.sortByCount = store.sortByCount === -1 ? 1 : -1
    store.previewList.sort((a, b) => {
      const aItem = new Date(a.events_count).getTime()
      const bItem = new Date(b.events_count).getTime()
      return store.sortByCount === 1 ? aItem - bItem : bItem - aItem
    })
  }
</script>

<template>
  <n-spin :show="store.showLoading" style="min-height: 200px">
    <div class="w-full overflow-x-auto h-[calc(100vh-200px)]" v-if="store.previewList.length > 0">
      <n-table class="mt-4" :single-line="false" size="small">
        <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
            <th class="min-w-[100px]">{{ $t('content.name') }}</th>
            <th class="min-w-[160px]">
              <div @click="sortByTime" class="flex gap-2 items-center cursor-pointer">
                <SortBtn :order-number="store.sortByTime" />
                <span>{{ $t('syncLog.form.deviceLastSync') }}</span>
              </div>
            </th>
            <th class="min-w-[100px]">
              <div @click="sortByCount" class="flex gap-2 items-center cursor-pointer">
                <SortBtn :order-number="store.sortByCount" />
                <span>{{ $t('hcServer.form.exported_count') }}</span>
              </div>
            </th>
            <th class="min-w-[80px] w-[180px]">{{ $t('content.from') }}</th>
            <th class="min-w-[80px] w-[180px]">{{ $t('content.to') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in store.previewList" :key="idx">
            <td>
              <span class="text-center block">{{
                (store.params.page - 1) * store.params.per_page + idx + 1
              }}</span>
            </td>
            <td>{{ item.device?.area_name }}</td>
            <td>{{ item.device?.last_sync }}</td>
            <td>
              <div>
                <UIBadge
                  :type="
                    item?.events_count > 0 ? Utils.colorTypes.success : Utils.colorTypes.warning
                  "
                  :show-icon="true"
                  :label="item?.events_count"
                >
                  <template #icon>
                    <n-icon
                      size="20"
                      :class="[item?.events_count > 0 ? 'text-success' : 'text-warning']"
                    >
                      <PersonAvailable20Filled />
                    </n-icon>
                  </template>
                </UIBadge>
              </div>
            </td>
            <td>{{ item.start_time }}</td>
            <td>{{ item.end_time }}</td>
          </tr>
        </tbody>
      </n-table>
    </div>
    <NoDataPicture v-if="store.previewList.length === 0 && !store.showLoading" />
  </n-spin>
</template>
