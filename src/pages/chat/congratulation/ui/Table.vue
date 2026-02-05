<script setup>
import { NoDataPicture, UIPagination, UIUser, UIBadge } from '@/components/index.js'
import {useCongratulationStore } from '@/store/modules/index.js'
import Utils from '@/utils/Utils.js'

const store = useCongratulationStore()

const changePage = (v) => {
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onPreview = (v) => {
  store.selectedContent = v.message
  store.visible = true
}
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto" v-if="store.list.length > 0">
      <n-table class="mt-4" :single-line="false" size="small">
        <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
            <th class="min-w-[200px] w-[300px]">{{ $t('confirmationPage.table.worker') }}</th>
            <th class="min-w-[500px]">{{ $t('content.messageContent') }}</th>
            <th class="min-w-[130px]">{{ $t('content.type') }}</th>
            <th class="min-w-[100px]">{{ $t('content.status') }}</th>
            <th class="min-w-[90px] w-[90px]">{{ $t('content.date') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in store.list" :key="idx">
            <td>
              <span class="text-center block">{{
                (store.params.page - 1) * store.params.per_page + idx + 1
              }}</span>
            </td>
            <td>
              <div>
                <UIUser
                  :hide-tooltip="false"
                  :short="false"
                  :data="{
                    photo: item?.user?.worker.photo,
                    firstName: item?.user?.worker.first_name,
                    middleName: item?.user?.worker.middle_name,
                    lastName: item?.user?.worker.last_name,
                    position: item?.worker_position?.post_short_name
                  }"
                />
              </div>
            </td>
            <td>
              <div @click="onPreview(item)" class="line-clamp-2 hover:underline hover:text-primary cursor-pointer" v-html="item.message"></div>
            </td>
            <td>
              <UIBadge :show-icon="false" :label="item?.type?.name" :type="Utils.colorTypes.dark" />
            </td>
            <td>
              <n-button :type="Boolean(item.status) ? 'success' : 'error'" size="tiny" secondary>{{ $t(item.status === 1? 'content.sent' : 'content.unSend') }}</n-button>
            </td>
            <td>
              {{ Utils.timeOnlyDate(item.created_at) }}
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
