<script setup>
import { NoDataPicture, UIPagination, UIUser, UIBadge, UIMenuButton } from '@/components/index.js'
import { useMobileUserStore } from '@/store/modules/index.js'
import Utils from '@/utils/Utils.js'

const store = useMobileUserStore()

const changePage = (v) => {
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}


const onSelect = (v) => {
  if (v.key === Utils.ActionTypes.view) {
    store._show(v.data.id)
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
            <th class="min-w-[250px]">{{ $t('content.user') }}</th>
            <th class="min-w-[150px]">{{ $t('mobileUserPage.deviceModel') }}</th>
            <th class="min-w-[100px] w-[120px]">{{ $t('mobileUserPage.platform') }}</th>
            <th class="min-w-[150px] w-[150px]">{{ $t('mobileUserPage.verificationTime') }}</th>
            <th class="min-w-[150px] w-[150px]">{{ $t('content.date') }}</th>
            <th class="min-w-[60px] w-[60px]">{{ $t('content.action') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in store.list" :key="idx">
            <td>
              <span class="text-center text-[12px] text-gray-600 block">
                {{ (store.params.page - 1) * store.params.per_page + idx + 1 }}
              </span>
            </td>
            <td>
              <UIUser
                :data="{
                  photo: item?.user?.worker?.photo,
                  lastName: item?.user?.worker?.last_name,
                  firstName: item?.user?.worker?.first_name,
                  middleName: item?.user?.worker?.middle_name,
                  position:item?.user?.phone,
                }"
              />
            </td>
            <td>
              <UIBadge :show-icon="false" :type="Utils.colorTypes.info" :label="item?.device_model || '-'" />
            </td>
            <td>
              <UIBadge :show-icon="false" :type="item?.platform==='ios'? Utils.colorTypes.error : Utils.colorTypes.success" :label="item?.platform || '-'" />
            </td>
            <td>
              <div class="text-[13px]">{{ item?.face ? Utils.timeWithMonth(item?.face) : '' }}</div>
            </td>
            <td>
              <div class="text-[13px]">{{ Utils.timeWithMonth(item?.created_at) }}</div>
            </td>
            <td>
              <UIMenuButton
                :data="item"
                :show-view="true"
                :show-delete="false"
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
