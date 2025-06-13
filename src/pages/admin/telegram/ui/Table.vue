<script setup>
import {useTelegramStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import {
  NoDataPicture,
  UIPagination,
  UIMenuButton,
  UIUser
} from "@/components/index.js"
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()

const onDelete = (v)=>{
  store.elementId = v.id
  store._delete()
}

const onSelectEv = (v)=>{
  if(!accStore.checkAction(accStore.pn.telegramWrite)) return
  // if(v.key === Utils.ActionTypes.edit){
  //   onEdit(v.data)
  // }else
  if(v.key === Utils.ActionTypes.delete){
    onDelete(v.data)
  }
}

// const onEdit = (v)=>{
//   store.visibleType = false
//   store.elementId = v.id
//   store.payload.name = v.name
//   store.visible = true
// }


const store = useTelegramStore()

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
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
          <th class="max-w-[200px]">{{$t('content.staff')}}</th>
          <th class="min-w-[100px]">{{$t('telegramPage.chatId')}}</th>
          <th class="max-w-[200px] w-[200px]">{{$t('content.created')}}</th>
          <th class="min-w-[40px] w-[40px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <UIUser
                :data="{
                    photo:item?.user.worker.photo,
                    lastName:item?.user.worker.last_name,
                    firstName:item?.user.worker.first_name,
                    middleName:item?.user.worker.middle_name,
                    position:item.user?.phone,
                }"
            />
          </td>
          <td>{{item.chat_id}}</td>
          <td>{{Utils.timeWithMonth(item.created_at)}}</td>
          <td>
            <UIMenuButton
                :data="item"
                :show-edit="false"
                @select-ev="onSelectEv"
            />
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
  </n-spin>
</template>