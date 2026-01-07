<script setup>
import {
  NoDataPicture, UIEditorViewer,
  UIPagination, UIUser,
} from '@components'
import {
  useNotificationStore,
} from '@stores'
import {Utils} from '@utils'

const store = useNotificationStore()

const changePage = (v) => {
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto" v-if="store.list.length > 0">
      <n-table class="mt-4" :single-line="false" size="small">
        <thead>
        <tr>
          <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
          <th class="min-w-[200px]">{{ $t('content.worker') }}</th>
          <th class="min-w-[200px]">{{ $t('content.title') }}</th>
          <th class="min-w-[400px]">{{ $t('content.description') }}</th>
          <th class="min-w-[140px]">{{ $t('content.created') }}</th>
          <th class="min-w-[140px]">{{ $t('content.read') }}</th>

        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td>
              <span class="text-center text-[12px] text-gray-600 block">{{
                  (store.params.page - 1) * store.params.per_page + idx + 1
                }}</span>
          </td>
          <td>
            <UIUser
                :hide-tooltip="true"
                :data="{
                  photo: item.user?.worker?.photo,
                  lastName: item.user?.worker?.last_name,
                  firstName: item.user?.worker?.first_name,
                  middleName: item.user?.worker?.middle_name
                }"
            >
            </UIUser>
          </td>
          <td>{{ item?.data?.title }}</td>
          <td>
            <UIEditorViewer :html="item?.data?.message"></UIEditorViewer>
          </td>
          <td>{{ Utils.timeHHMMWithMonth(item.created_at) }}</td>
          <td>{{ Utils.timeHHMMWithMonth(item?.read_at) }}</td>
        </tr>
        </tbody>
      </n-table>
    </div>
    <UIPagination
        v-if="store.totalItems>0"
        :page="store.params.page"
        :per_page="store.params.per_page"
        :total="store.totalItems"
        @change-page="changePage"
    />
    <NoDataPicture v-if="store.list.length === 0 && !store.loading"/>
  </n-spin>
</template>
