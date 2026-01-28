<script setup>
import {NoDataPicture, UIMenuButton, UIPagination, UIUser} from '@/components/index.js'
import { useApproveStore, useAccountStore} from "@stores"
import { Utils} from "@utils"
import i18n from "@/i18n"
import {UIStatus} from "@components"

const accStore = useAccountStore()
const store = useApproveStore()
const t = i18n.global.t

const changePage = (v) => {
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onShow = (v => {
    store.approve.visible = true
    store._show()
})

const onEdit = () => {
  store.visible = true
  store.visibleType = false
  store._show((v)=>{
    store.payload.title = v.title
    store.payload.description = v.description
    store.payload.receiver_organization_id = [v.receiver_organization]
    store.payload.access_levels = v.access_levels.map(v=>v.id)
    store.worker.list = v.worker_positions.map(v=>({
      id: v.id,
      name: Utils.combineFullName(v.worker),
      position: v.post_name,
    }))
    store.payload.worker_position_ids = store.worker.list.map(v=> v.id)
    store._accessLevel()

    store.worker.params.page = 1
    store.worker.params.search = null
    store._workers()
  })
}


const onSelectEv = (v) => {
  store.elementId = v.data.id
  if (!accStore.checkAction(accStore.pn.turnstileDevicesWrite)) return
  if (v.key === 'delete') {
    onDelete()
  }else if(v.key === Utils.ActionTypes.confirm){
    onShow(v.data)
  }else if(v.key === Utils.ActionTypes.edit){
    onEdit(v.data)
  }
}

const onDelete = () => {
  store._delete()
}

const actionStatus = {
  sended:{
    id:2,
    name:t('approve.form.sended')
  },
  received:{
    id:9,
    name:t('approve.form.received')
  },
}

const approveStatus = {
  1: {
    id:1,
    name:t('content.process')
  },
  2: {
    id:3,
    name:t('uploadReport.form.confirmed')
  },
  3: {
    id:4,
    name:t('content.Rejected')
  },
}
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="mt-4" v-if="store.totalItems > 0">
      <n-table size="small" v-if="store.list.length > 0" :bordered="false" :single-line="false">
        <thead>
        <tr>
          <th class="w-[46px] min-w-[30px]">{{ $t('content.number') }}</th>
          <th class="min-w-[100px]">{{ $t('content.worker') }}</th>
          <th class="min-w-[100px] w-[300px]">{{ $t('content.organization') }}</th>
          <th class="min-w-[100px] w-[300px]">{{ $t('content.name') }}</th>
          <th class="w-[200px]">{{ $t('content.description') }}</th>
          <th class="w-[120px]">{{ $t('content.status') }}</th>
          <th class="w-[120px]">{{ $t('content.status') }}</th>
          <th class="max-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in store.list" :key="item.id">
          <td class="text-center!">
            {{ (store.params.page - 1) * store.params.per_page + index + 1 }}
          </td>
          <td>
            <UIUser
                :hide-tooltip="true"
                :short="false"
                :data="{
                  photo: item?.user?.worker?.photo,
                  lastName: item?.user?.worker?.last_name,
                  firstName: item?.user?.worker?.first_name,
                  middleName: item?.user?.worker?.middle_name,
                  position: item?.organization?.name,
                }"
            />
          </td>
          <td>
            {{item.status === 'received'? item?.organization?.name : item?.receiver_organization?.name }}
          </td>
          <td>
            <n-tooltip trigger="hover">
              <template #trigger>
                <p class="cursor-pointer text-sm text-textColor2 line-clamp-1 w-full leading-[1.2] truncate">
                  {{item?.title}}
                </p>
              </template>
              {{item?.title}}
            </n-tooltip>
          </td>

          <td>
            <n-tooltip trigger="hover">
              <template #trigger>
                <p class="cursor-pointer text-sm text-textColor2 line-clamp-1 w-full leading-[1.2] truncate">
                  {{item?.description}}
                </p>
              </template>
              {{item?.description}}
            </n-tooltip>
          </td>
          <td>
            <UIStatus :status="approveStatus[item.approved]" />
          </td>
          <td>
            <UIStatus :status="actionStatus[item.status]" />
          </td>
          <td>
            <UIMenuButton
                :show-delete="item.status === 'sended' && item.approved !==2"
                :show-edit="item.status === 'sended' && item.approved ===1"
                :show-confirm="item.status === 'received' && item.approved ===1"
                :data="item"
                @select-ev="onSelectEv"
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
