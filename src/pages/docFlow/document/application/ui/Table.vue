<script setup>
import {NoDataPicture, UIMenuButton, UIPagination, UIStatus, UIUser} from "@/components/index.js"
import {useApplicationStore} from "@/store/modules/index.js"
import Utils from "../../../../../utils/Utils.js"
import {DocumentBulletList20Regular} from '@vicons/fluent'

const store = useApplicationStore()



const emits = defineEmits([ 'openOffice'])
const onEdit = (v)=>{
  store.visibleType = false
  store.elementId = v.id
  store.payload.name = v.name
  store.visible = true
}

const onDelete = (v)=>{
  store.elementId = v.id
  store._delete()
}

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelectEv = (v)=>{
  if(Utils.ActionTypes.view === v.key){
    onOpenFile(v.data)
  }
}

const onOpenFile = (v)=>{
  emits('openOffice', v.id)
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
          <th class="!text-center min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[120px] w-[200px]">{{$t('applicationPage.form.number')}}</th>
          <th class="min-w-[200px]">{{$t('applicationPage.form.type')}}</th>
          <th class="min-w-[200px] w-[200px]">{{$t('content.worker')}}</th>

          <th class="min-w-[120px] w-[120px]">{{$t('content.status')}}</th>
          <th class="min-w-[90px] w-[90px]">{{$t('content.date')}}</th>
          <th class="w-[120px]">{{$t('content.document')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td><span class="font-medium">{{item?.number}}</span></td>
          <td
              @click="onOpenFile(item)"
              class="text-sm hover:text-primary hover:underline cursor-pointer">{{item.type?.name}}</td>
          <td>
            <UIUser
                class="cursor-pointer"
                :data="{
                    photo:item?.worker.photo,
                    firstName:item?.worker.first_name,
                    middleName:item?.worker.middle_name,
                    lastName:item?.worker.last_name,
                    position:item?.worker?.birthday,
                  }"
            />
          </td>

          <td>
            <UIStatus
                :status="item.confirmation"
            />
          </td>
          <td>{{Utils.timeOnlyDate(item?.created_at)}}</td>
          <td><UIStatus :status="Utils.documentStatus[item?.generate]"/></td>
          <td>
           <UIMenuButton
               :data="item"
               :show-edit="true"
               :show-view="true"
               @selectEv="onSelectEv"
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
