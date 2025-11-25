<script setup>
import {NoDataPicture,UIMenuButton, UIPagination, UIOnlineOffline} from "@/components/index.js"
import { useDevicesStore} from "@/store/modules/index.js"
import {useAccountStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import {CheckmarkCircle12Filled} from "@vicons/fluent"


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
  store.payload.device_id = v.device_id
  store.payload.device_code = v.device_code
  store.payload.organization_id = v.organization_id? [v.organization_id] : []

  store.payload.log = v.log
  store.payload.config = v.config
  store.payload.upload_workers = v.upload_workers

  store.payload.contract_number = v.contract_number
  store.payload.contract_date = v.contract_date? new Date(v.contract_date).getTime() : null

  store.isAdmin = accStore.checkPermission(accStore.pn.admin) || false

  store.visible = true
  store.visibleType = false
}

const onSelectEv = (v)=>{
  store.elementId = v.data.id
  if(!accStore.checkAction(accStore.pn.turnstileDevicesWrite)) return
  if(v.key === 'delete'){
    onDelete()
  }else if(v.key === Utils.ActionTypes.edit){
    onEdit(v.data)
  }
}

const onDelete = ()=>{
  store._delete()
}
</script>

<template>
<n-spin :show="store.loading" style="min-height: 200px">
  <div class="w-full  mt-4 overflow-y-auto" v-if="store.list.length>0">
    <n-table :bordered="false" :single-line="false">
      <thead>
        <tr>
          <th class="w-[46px] min-w-[30px]">{{$t('content.number')}}</th>
          <th class="min-w-[100px]">{{$t('content.name')}}</th>
          <th class="min-w-[60px] w-[80px]">{{$t('devices.status')}}</th>
          <th class="min-w-[100px] w-[100px]">{{$t('content.organization')}}</th>
          <th class="min-w-[60px] w-[60px]">{{$t('devices.log')}}</th>
          <th class="min-w-[60px] w-[60px]">{{$t('devices.config')}}</th>
          <th class="min-w-[60px] w-[60px]">{{$t('devices.upload_workers')}}</th>
          <th class="min-w-[100px] w-[140px]">{{$t('devices.ipAddress')}}</th>
          <th class="min-w-[100px] w-[140px]">{{$t('devices.macAddress')}}</th>
          <th class="min-w-[100px] w-[120px]">{{$t('devices.device_code')}}</th>
<!--          <th class="min-w-[100px] w-[120px]">{{$t('devices.contract_number')}}</th>-->
<!--          <th class="min-w-[100px] w-[120px]">{{$t('devices.contract_date')}}</th>-->
<!--          <th class="min-w-[100px] w-[120px]">{{$t('devices.price')}}</th>-->
          <th class="min-w-[100px] w-[120px]">{{$t('devices.serialNumber')}}</th>
          <th class="min-w-[90px] w-[120px]">{{$t('content.updatedAt')}}</th>
          <th class="max-w-[40px] w-[40px]"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in store.list" :key="item.id">
          <td class="text-center!">
            {{ (store.params.page - 1) * store.params.per_page + index + 1 }}
          </td>
          <td>
            <span class="font-medium">{{ item.name }}</span>
          </td>
          <td>
            <UIOnlineOffline :status="item.status" :text="$t(item.status? 'devices.online' : 'devices.offline')" />
          </td>
          <td>

            <n-tooltip
                trigger="hover"
            >
              <template #trigger>
                <p class="text-sm cursor-pointer">{{ item?.organization_id?.code }}</p>
              </template>
              {{item?.organization_id?.name }}
            </n-tooltip>
          </td>
          <td class="!text-center">
            <n-icon size="26" :class="[item.log? 'text-success' : 'text-secondary']">
              <CheckmarkCircle12Filled v-if="item.log" />
            </n-icon>
          </td>
          <td class="!text-center">
            <n-icon size="26" :class="[item.config? 'text-success' : 'text-secondary']">
              <CheckmarkCircle12Filled v-if="item.config" />
            </n-icon>
          </td>
          <td class="!text-center">
            <n-icon size="26" :class="[item.upload_workers? 'text-success' : 'text-secondary']">
              <CheckmarkCircle12Filled v-if="item.upload_workers" />
            </n-icon>
          </td>
          <td>
            <span>{{ item.ip_address }}</span>
          </td>
          <td>
            <span>{{ item.mac_address }}</span>
          </td>
          <td>
            <span>{{ item.device_code }}</span>
          </td>
<!--          <td>-->
<!--            <span>{{ item.contract_number }}</span>-->
<!--          </td>-->
<!--          <td>-->
<!--            <span>{{ item.contract_date }}</span>-->
<!--          </td>-->
<!--          <td>-->
<!--            <span>{{ item.price }}</span>-->
<!--          </td>-->
          <td>
            <n-tooltip
                trigger="hover"
            >
              <template #trigger>
                <p class="text-sm overflow-hidden text-nowrap text-ellipsis !w-[120px] !max-w-[120px] cursor-pointer">{{ item.serial_number }}</p>
              </template>
              {{item.serial_number }}
            </n-tooltip>

          </td>
          
          <td>
            <p class="leading-[1.2] text-xs">{{ Utils.timeWithMonth(item.updated_at) }}</p>
          </td>
          <td>
            <UIMenuButton
                :data="item"
                :show-edit="true"
                @select-ev="onSelectEv"
            />
          </td>
        </tr>
      </tbody>
    </n-table>
    
    <div class="flex justify-end mt-4" v-if="store.totalItems >0">
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
