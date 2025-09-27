<script setup>
import {NoDataPicture, UIPagination, UIBadge, UIStatus, UIMenuButton} from "@/components/index.js"
import {useAccountStore, useSyncLogStore} from "@/store/modules/index.js"
import {ErrorCircle24Filled, PersonAvailable20Filled, CellularWarning20Regular} from "@vicons/fluent"
import Utils from "@/utils/Utils.js"
import i18n from "@/i18n/index.js"

const {t} = i18n.global
const store = useSyncLogStore()
const accStore = useAccountStore()

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelect = (v)=>{
  if(!accStore.checkAction(accStore.pn.turnstileHikCentralSyncWrite)) return
    store.elementId = v.data.id
    if(v.key === Utils.ActionTypes.view){
      store._show()
      store.visible = true
    }else if(v.key === Utils.ActionTypes.confirm){
      onOfflineDevicesEv()
    }
}

const onOfflineDevicesEv = ()=>{
  store._offlineDeviceList()
  store.offlineDeviceVisible =true
}

const statusObj = {
  1: {
    name:t('content.process'),
    id:1,
  },
  2: {
    name:t('content.error'),
    id:4,
  },
  3: {
    name:t('content.success'),
    id:3,
  }
}

</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">
      <n-table
          class="mt-4"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="text-center! min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[100px] w-[300px]">{{$t('content.date')}}</th>
          <th class="min-w-[100px] w-[300px]">{{$t('content.hour')}}</th>
          <th class="min-w-[100px] w-[300px]">{{$t('content.type')}}</th>
          <th class="min-w-[100px]">{{$t('content.status')}}</th>
          <th class="min-w-[100px]">{{$t('hcServer.form.exported_count')}}</th>
          <th class="min-w-[80px] w-[80px]">{{$t('content.error')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>{{item.type.name==='Foydalanuvchi'? item?.day:item?.sync_datetime?.split(' ')?.[0] }}</td>
          <td>{{item?.sync_datetime?.split(' ')?.[1]}}</td>
          <td>
            <UIBadge :type="item?.type?.name==='Tizim'? Utils.colorTypes.dark :Utils.colorTypes.warning" :show-icon="false" :label="item?.type?.name"/>
          </td>
          <td>
            <UIStatus :status="statusObj[item?.status]"/>
          </td>
          <td>
            <div v-if="item?.sync_events_count>0">
              <UIBadge
                  :type="Utils.colorTypes.success"
                  :show-icon="true"
                  :label="item?.sync_events_count">
                <template #icon>
                  <n-icon size="20" class="text-success ">
                    <PersonAvailable20Filled/>
                  </n-icon>
                </template>
              </UIBadge>
            </div>
          </td>
          <td>
            <div class="flex justify-center">
              <template v-if="item?.error">

                <n-popover trigger="click">
                  <template #trigger>
                    <n-button type="error" secondary size="small">
                      <template #icon>
                        <n-icon size="24" class="text-danger">
                          <ErrorCircle24Filled/>
                        </n-icon>
                      </template>
                      {{$t('content.error')}}
                    </n-button>
                  </template>
                  <div class="w-[200px] h-[260px] overflow-y-auto text-danger">
                    {{item.error}}
                  </div>
                </n-popover>
              </template>
            </div>
          </td>
          <td>
            <UIMenuButton
                v-if="item.type.name !== 'Foydalanuvchi'"
                :show-delete="false"
                :show-view="true"
                :data="item"
                @selectEv="onSelect"
                :extra-options="[
                    {
                        label: t('syncLog.offlineDevices'),
                        key: Utils.ActionTypes.confirm,
                        icon: CellularWarning20Regular,
                        visible:true
                     },
                ]"
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
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
  </n-spin>
</template>
