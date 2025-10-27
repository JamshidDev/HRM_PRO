<script setup>
import {NoDataPicture,UIMenuButton, UIPagination} from "@/components/index.js"
import { useDevicesStore} from "@/store/modules/index.js"
import {useAccountStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import i18n from "@/i18n/index.js"
import UIStatus from "@/components/ui/UIStatus.vue"
import UIBadge from "@/components/ui/UIBadge.vue"

const { t } = i18n.global

const accStore = useAccountStore()
const store = useDevicesStore()

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onEdit = (v)=>{
  store.payload.name = v.name
  store.payload.ip_address = v.ip_address
  store.payload.mac_address = v.mac_address
  store.payload.serial_number = v.serial_number
  store.elementId = v.id
  store.visible = true
  store.visibleType = false
}

const onSelectEv = (v)=>{
  store.elementId = v.data.id
  if(!accStore.checkAction(accStore.pn.turnstileDevicesWrite)) return
  if(v.key === 'delete'){
    onDelete()
  }
}

const onDelete = ()=>{
  store._delete()
}

const getStatusType = (status) => {
  return status ? Utils.colorTypes.success : Utils.colorTypes.error
}

const getStatusLabel = (status) => {
  return status ? t('devices.online') : t('devices.offline')
}
</script>

<template>
<n-spin :show="store.loading">
  <div class="w-full  mt-4">
    <n-table :bordered="false" :single-line="false">
      <thead>
        <tr>
          <th class="w-[46px] min-w-[30px]">{{$t('content.number')}}</th>
          <th class="min-w-[100px]">{{$t('content.name')}}</th>
          <th class="min-w-[90px] w-[100px]">{{$t('devices.status')}}</th>
          <th class="min-w-[100px] w-[160px]">{{$t('devices.ipAddress')}}</th>
          <th class="min-w-[100px] w-[160px]">{{$t('devices.macAddress')}}</th>
          <th class="min-w-[100px] w-[360px]">{{$t('devices.serialNumber')}}</th>
          <th class="min-w-[90px] w-[180px]">{{$t('content.updatedAt')}}</th>
          <th class="max-w-[40px] w-[40px]"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in store.list" :key="item.id">
          <td class="text-center!">
            {{ (store.params.page - 1) * store.params.per_page + index + 1 }}
          </td>
          <td class="text-center">
            <span class="font-medium">{{ item.name }}</span>
          </td>
          <td class="text-center">
            <UIBadge :show-icon="false" :type="item.status? Utils.colorTypes.success : Utils.colorTypes.error" :label="$t(item.status? 'devices.online' : 'devices.offline')" />
          </td>
          <td class="text-center">
            <span>{{ item.ip_address }}</span>
          </td>
          <td class="text-center">
            <span>{{ item.mac_address }}</span>
          </td>
          <td>
            <span class="font-mono text-sm">{{ item.serial_number }}</span>
          </td>
          
          <td class="text-center">
            {{ Utils.timeWithMonth(item.updated_at) }}
          </td>
          <td class="text-center">
            <!-- <UIMenuButton
                :data="item"
                :show-edit="true"
                :show-delete="false"
                @select-ev="onSelectEv"
            /> -->
          </td>
        </tr>
      </tbody>
    </n-table>
    
    <div class="flex justify-end mt-4" v-if="store.totalItems > store.params.per_page">
      <UIPagination
          :page="store.params.page"
          :per_page="store.params.per_page"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
  </div>
</n-spin>
</template>
