<script setup>
  import { NoDataPicture, UIPagination, UIUser, UIBadge } from '@/components/index.js'
  import { useInvalidUserStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  const { t } = i18n.global
  const store = useInvalidUserStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto" v-if="store.list.length > 0">
      <div class="w-full h-[600px] overflow-y-auto mt-4">
        <n-table :single-line="false" size="small">
          <thead>
            <tr>
              <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
              <th class="min-w-[200px]">{{ $t('content.worker') }}</th>
              <th class="min-w-[130px] w-[200px] !text-center">{{ $t('content.date') }}</th>
              <th class="min-w-[130px] w-[200px] !text-center">{{ $t('invalidUser.syncTime') }}</th>
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
                    :hide-tooltip="true"
                    :short="false"
                    :data="{
                      photo: item?.photo,
                      firstName: item?.worker?.first_name,
                      middleName: item?.worker?.middle_name,
                      lastName: item?.worker?.last_name,
                      position: item?.worker?.id
                    }"
                  />
                </div>
              </td>
              <td class="!text-center">
                <UIBadge :show-icon="false" :label="Utils.timeWithMonth(item.updated_at)" />
              </td>
              <td class="!text-center">
                <UIBadge :show-icon="false" :label="item.sync_time" />
              </td>
            </tr>
          </tbody>
        </n-table>
      </div>
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
