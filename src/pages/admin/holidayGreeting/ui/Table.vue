<script setup>
  import { NoDataPicture, UIMenuButton, UIPagination } from '@/components/index.js'
  import { useHolidayGreetingStore, useAccountStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { CheckmarkCircle16Filled, DismissCircle16Regular } from '@vicons/fluent'

  const store = useHolidayGreetingStore()
  const accStore = useAccountStore()

  const onEdit = (item) => {
    if (!accStore.checkAction(accStore.pn.admin)) return
    store.onEdit(item)
  }

  const onDelete = (item) => {
    if (!accStore.checkAction(accStore.pn.admin)) return
    store.elementId = item.id
    store._delete()
  }

  const onSelectEv = (v) => {
    if (Utils.ActionTypes.edit === v.key) {
      onEdit(v.data)
    } else if (Utils.ActionTypes.delete === v.key) {
      onDelete(v.data)
    }
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const showBanner = (url) => {
    if (!url) return
    $MediaViewer.showMediaViewer(url, 'jpg')
  }
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto" v-if="store.list.length > 0">
      <n-table class="mt-4" :single-line="false" size="small">
        <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
            <th class="min-w-[160px]">{{ $t('holidayGreetingPage.table.name') }}</th>
            <th class="min-w-[120px] w-[140px]">{{ $t('holidayGreetingPage.table.date') }}</th>
            <th class="text-center! min-w-[100px] w-[120px]">
              {{ $t('holidayGreetingPage.table.recurring') }}
            </th>
            <th class="text-center! min-w-[100px] w-[120px]">
              {{ $t('holidayGreetingPage.table.status') }}
            </th>
            <th class="text-center! min-w-[80px] w-[80px]">
              {{ $t('holidayGreetingPage.table.banner') }}
            </th>
            <th class="min-w-[60px] w-[60px]"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in store.list" :key="item.id">
            <td>
              <span class="text-center text-[12px] text-gray-600 block">{{
                (store.params.page - 1) * store.params.per_page + idx + 1
              }}</span>
            </td>
            <td>{{ item.name }}</td>
            <td>{{ Utils.timeOnlyDate(item.holiday_date) }}</td>
            <td class="text-center!">
              <n-icon v-if="item.is_recurring" size="18" color="#2dcb73">
                <CheckmarkCircle16Filled />
              </n-icon>
              <n-icon v-else size="18" color="#98a2b3">
                <DismissCircle16Regular />
              </n-icon>
            </td>
            <td class="text-center!">
              <n-tag :type="item.is_active ? 'success' : 'error'" size="small" round>
                {{ item.is_active ? $t('content.active') : $t('content.noActive') }}
              </n-tag>
            </td>
            <td class="text-center!">
              <img
                v-if="item.banner_url"
                @click="showBanner(item.banner_url)"
                :src="item.banner_url"
                @error="Utils.onImgError"
                class="w-[40px] h-[40px] object-cover rounded-sm cursor-pointer inline-block"
              />
              <span v-else>—</span>
            </td>
            <td>
              <UIMenuButton :data="item" show-edit @selectEv="onSelectEv" />
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
