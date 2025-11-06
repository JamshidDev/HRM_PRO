<script setup>
import {NoDataPicture,UIMenuButton, UIPagination, UIUser} from "@/components/index.js"
import { useTurnstileHikCentralWorkerStore} from "@/store/modules/index.js"
import {AddSquareMultiple20Regular, ArrowSync24Filled, ErrorCircle24Filled} from '@vicons/fluent'
import {useAccountStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import UIBadge from "@/components/ui/UIBadge.vue"
import AccessLevelModal from "./AccessLevelModal.vue"

const accStore = useAccountStore()

const store = useTurnstileHikCentralWorkerStore()

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onEdit = (v)=>{
  const existPerson = Boolean(v.hcpPerson)
  const photoId = v?.hcpPerson?.photo?.id
  

  store.payload.end_time =v?.hcpPerson?.to? new Date(v.hcpPerson.to).getTime() : null
  store.payload.access_level_ids = v?.hcpPerson?.access_levels.map(a=>a.access_level_id) || []
  store.editPayload.id =v?.hcpPerson?.id || undefined 
  store.editPayload.worker_id =v?.hcpPerson?.id? undefined:v.id

  store.payload.worker_id = v?.id

  store.editVisible = true
  store._access_levels()

  store._worker_photos(()=>{
    if(!existPerson) return
    const idx = store.photos.findIndex(x=>x.id == photoId)
    store.payload.photo_index = idx
    store.payload.photo_id = photoId
  })
  
  
 
}

const onSelectEv = (v)=>{
  store.elementId = v.data.id
  if(!accStore.checkAction(accStore.pn.turnstileHikCentralWorkersWrite)) return
  if(v.key === 'delete'){
    onDelete()
  }else if(v.key==='edit'){
    store.resetEditPayload()
    store.resetForm()
    onEdit(v.data)
  }
}

const checkDeviceExpiry = (date)=>{
  const now = new Date()
  const expiryDate = new Date(date)
  if(now > expiryDate) return 'error'
  const oneMonthLater = new Date(now)
  oneMonthLater.setMonth(now.getMonth() + 1)
  if(expiryDate<=oneMonthLater) return 'warning'
  return 'primary'

}

const onSelect = (v)=>{
  store.accessLevelModalVisible = true
  store.selectedWorker = v
}

const onRefreshAccessLevel = async (v) => {
  onRefresh(v)
}

const onDelete = ()=>{
  store._delete()
}

const onRefresh = (v)=>{
  store._onRefreshAcessLeves(v.id)
}

const onShowErrorEv = (worker_id, access_level_id)=>{
  const params = {
    worker_id:worker_id || undefined,
    access_level_id:access_level_id || undefined,
  }
  store._getErrors(params)
  store.errorVisible = true
}



</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">
      <n-table
          class="mt-4 w-full"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="w-[46px] min-w-[30px]">{{$t('content.number')}}</th>
          <th class="min-w-[260px] w-[400px]">{{$t('content.fullName')}}</th>
          <th class="min-w-[300px] ">{{$t('turnstile.hcWorkersPage.access_levels')}}</th>
          <th class="min-w-[120px] w-[120px]">{{$t('content.expiryDate')}}</th>
          <th class="min-w-[120px] w-[120px]">{{$t('content.updatedAt')}}</th>
          <th class="min-w-[90px] w-[90px]">{{$t('content.error')}}</th>
          <th class="max-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td class="w-[20px] max-w-[20px]"><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <UIUser
                :hide-tooltip="true"
                :short="false"
                :data="{
                photo:item?.hcpPerson?.photo?.photo || item?.photo,
                lastName: item?.last_name,
                firstName: item?.first_name,
                middleName: item?.middle_name,
                position: item.post_name,
              }"
            >
              <template #position>
                <div class="text-xs line-clamp-1 text-secondary"><n-button class="!py-0 !h-[16px] !text-xs !select-all" secondary type="primary" size="tiny">{{item.id}}</n-button> {{item.post_name}}</div>
              </template>
            </UIUser>
          </td>
          <td>
            <div class="flex flex-wrap gap-2" v-if="item.hcpPerson">
              <template v-for="level in item.hcpPerson.access_levels.slice(0,3)" :key="level.id">
                  <n-button
                      class="!px-1"
                      dashed
                      :type="level.type || 'default'"
                  >
                    <div class="flex flex-col px-4 relative group overflow-hidden min-w-[100px]">
                      <span class="font-semibold"> {{level.name}}</span>
                      <span @click.stop="onRefresh(level)" class="px-1 bottom-0 absolute w-full h-full text-success flex justify-center items-center gap-2 top-0 right-[-200px] group-hover:right-[4px] transition-all duration-300 z-[999] bg-surface-section">
                        <n-icon size="16">
                          <ArrowSync24Filled/>
                        </n-icon>
                        {{ $t('content.refresh') }}
                      </span>
                    </div>

                    <template #icon>
                      <n-icon size="19">
                        <ErrorCircle24Filled @click.stop="onShowErrorEv(undefined,level.id )" v-if="level.type === 'error'" />
                        <AddSquareMultiple20Regular v-else />
                      </n-icon>
                    </template>
                  </n-button>
                </template>
              <n-button
                  @click="onSelect(item)"
                  round
                  secondary
                  v-if="item.hcpPerson.access_levels.length>3"
              >
                +{{ item.hcpPerson.access_levels.length - 3 }} {{ $t('accessLevel.more') }}
              </n-button>

            </div>
          </td>
          <td class="text-center">
            <UIBadge
              v-if="item?.hcpPerson?.to"
              :show-icon="false"
              :label="Utils.timeOnlyDate(item?.hcpPerson?.to)"
            />
          </td>
          <td class="text-center">
            {{ Utils.timeOnlyDate(item?.hcpPerson?.updated_at) }}
          </td>
          <td class="text-center">
            <n-button @click="onShowErrorEv(item.id)" v-if="item.errorMessage" type="error" secondary size="small">
              <template #icon>
                <n-icon size="24" class="text-danger">
                  <ErrorCircle24Filled/>
                </n-icon>
              </template>
              {{$t('content.error')}}
            </n-button>
          </td>
          <td>
            <UIMenuButton
                :data="item"
                :show-edit="true"
                @select-ev="onSelectEv"
            />
<!--                :loading="store.elementId === item.worker.id && store.deleteLoading"-->
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          v-if="store.totalItems>store.params.per_page"
          :page="store.params.page"
          :per_page="store.params.per_page"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
    
    <!-- Access Level Modal -->
    <AccessLevelModal
      :visible="store.accessLevelModalVisible"
      @update:visible="(v) => store.accessLevelModalVisible = v"
      @refresh="onRefreshAccessLevel"
      :access-levels="store.selectedWorker?.hcpPerson?.access_levels || []"
      :worker-name="`${store.selectedWorker?.first_name} ${store.selectedWorker?.last_name}`"
    />
  </n-spin>
</template>
