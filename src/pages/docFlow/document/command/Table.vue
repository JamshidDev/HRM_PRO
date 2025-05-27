<script setup>
import {
  NoDataPicture,
  UIActionButton,
  UIMenuButton,
  UIPagination,
  UIStatus,
  UIUser,
  UIUserGroup,
} from "@/components/index.js"
import {useAccountStore, useCommandStore, useComponentStore} from "@/store/modules/index.js"
import {CheckmarkCircle32Regular} from "@vicons/fluent"
import Utils from "@/utils/Utils.js"

const store = useCommandStore()
const accStore = useAccountStore()
const componentStore = useComponentStore()
const emits = defineEmits([ 'openOffice',])
import i18n from "@/i18n/index.js"

const {t} = i18n.global

const onOpenFile = (v)=>{
  emits('openOffice', v)
}


const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onDelete = (v)=>{
  store.elementId = v.id
  store._delete()
}

const onSelect = (v)=>{
  if(!accStore.checkAction(accStore.pn.hrCommandsRead)) return

  if(v.key === 'view'){
    emits('openOffice', v.data.id)
  }else if(v.key === Utils.ActionTypes.delete){
    onDelete(v.data)
  }else if(v.key === Utils.ActionTypes.confirm){
    store.elementId = v.data.id
    componentStore.files = []
    componentStore.fileVisible = true
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
          <th class="min-w-[60px]">{{$t('content.type')}}</th>
          <th class="min-w-[60px] w-[120px]">{{$t('content.worker')}}</th>
          <th class="min-w-[60px] w-[60px]">{{$t('confirmation.contract.form.number')}}</th>
          <th class="min-w-[100px] w-[300px]">{{$t('confirmation.contract.form.organization')}}</th>
          <th class="min-w-[100px] w-[100px]">{{$t('content.status')}}</th>
          <th class="min-w-[100px] w-[100px]">{{$t('content.date')}}</th>
          <th class="min-w-[100px] w-[100px]">{{$t('content.document')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <span @click="onOpenFile(item.id)" class="hover:text-primary hover:underline cursor-pointer">{{item?.type?.name}}</span>
          </td>
          <td>
           <div class="flex justify-center w-fullx">
             <UIUserGroup class="relative" :has-more="(item.workers.length>4? item.workers.length-4:0)" :data="item.workers.map((v) => ({
            photo: v?.worker?.photo,
            fullName: v?.worker?.last_name + ' ' + v?.worker?.first_name,
          }))" />
           </div>
          </td>
          <td>
            <div class="flex justify-center"> <n-button class="font-medium" round type="error" size="tiny">{{item?.command_number}}</n-button></div>
          </td>
          <td>{{item?.organization?.name}}</td>
          <td><UIStatus :status="item?.confirmation"/> </td>
          <td>{{ Utils.timeOnlyDate(item?.command_date) }}</td>
          <td><UIStatus :status="Utils.documentStatus[item?.generate]"/></td>
          <td>
            <UIMenuButton
                :show-view="true"
                :show-edit="true"
                :data="item"
                @selectEv="onSelect"
                :extra-options="[
                     {
                        label: t('content.confirm'),
                        key: Utils.ActionTypes.confirm,
                        icon: CheckmarkCircle32Regular,
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
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
  </n-spin>
</template>

<style scoped>

</style>