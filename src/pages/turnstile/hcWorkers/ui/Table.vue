<script setup>
import {NoDataPicture, UIBadge, UIMenuButton, UIPagination, UIUser} from "@/components/index.js"
import { useTurnstileHikCentralWorkerStore} from "@/store/modules/index.js"
import {AddSquareMultiple20Regular} from '@vicons/fluent'
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()

const store = useTurnstileHikCentralWorkerStore()

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onEdit = (v)=>{
  store.editPayload.id = v.id
  store.payload.worker_id = v.worker?.id
  store._worker_photos(()=>{
    store.editVisible = true
  })
}

const onSelectEv = (v)=>{
  if(!accStore.checkAction(accStore.pn.turnstileHikCentralWorkersWrite)) return
  if(v.key === 'delete'){
    store.elementId = v.data.worker.id
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
  store.selectedRowId =store.selectedRowId === v.id? null : v.id
}



</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">
      <n-table
          class="mt-5 w-full table-fixed"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="w-[46px] min-w-[30px]">{{$t('content.number')}}</th>
          <th class="min-w-[200px] w-[400px]">{{$t('content.fullName')}}</th>
          <th class="min-w-[200px]">{{$t('turnstile.hcWorkersPage.access_levels')}}</th>
          <th class="max-w-[65px] w-[65px]">{{$t('content.action')}}</th>
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
                photo: item?.photo?.photo || item.worker?.photo,
                lastName: item.worker.last_name,
                firstName: item.worker.first_name,
                middleName: item.worker.middle_name,
                position: item.post_name
              }"
            />
          </td>
          <td class="text-center!">
            <div class="flex flex-wrap gap-2">
              <template v-if="store.selectedRowId !== item.id">
                <template v-for="level in item.access_levels.slice(0,3)" :key="level.id">
                  <n-button
                      dashed
                      :type="checkDeviceExpiry(level.to)"
                  >
                    <div class="flex flex-col p-1">
                      <span class="font-semibold"> {{level.name}}</span>
                      <span class="text-xs text-secondary"> {{level.to}}</span>
                    </div>

                    <template #icon>
                      <n-icon size="19">
                        <AddSquareMultiple20Regular/>
                      </n-icon>
                    </template>
                  </n-button>
                </template>
              </template>
              <n-button
                  @click="onSelect(item)"
                  round
                  secondary
                  v-if="item.access_levels.length>3"
                  :type="store.selectedRowId === item.id? 'error' : 'default'"
              >
                 {{ store.selectedRowId === item.id? $t('content.close') : `+ ${item.access_levels.length - 3}`}}
              </n-button>

            </div>
            <n-collapse-transition :show="item.id === store.selectedRowId">
              <div class="flex flex-wrap gap-2 mt-2">
                <template v-for="level in item.access_levels.slice(3)" :key="level.id">
                  <n-button
                      dashed
                      :type="checkDeviceExpiry(level.to)"
                  >
                    <div class="flex flex-col p-1">
                      <span class="font-semibold"> {{level.name}}</span>
                      <span class="text-xs text-secondary"> {{level.to}}</span>
                    </div>

                    <template #icon>
                      <n-icon size="19">
                        <AddSquareMultiple20Regular/>
                      </n-icon>
                    </template>
                  </n-button>
                </template>
              </div>
            </n-collapse-transition>
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
  </n-spin>
</template>
