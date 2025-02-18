<script setup>
import {ReceiptAdd24Regular, DocumentCheckmark24Regular, ArrowSyncCheckmark20Filled} from "@vicons/fluent"
import {NoDataPicture, UIPagination, UIUser, UIStatus, UIMenuButton} from "@/components/index.js"
import {useAdContractStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useAdContractStore()



const emits = defineEmits([ 'openOffice','commandEv'])

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onOpenFile = (v)=>{
  emits('openOffice', v.id)
}

const onEdit = (v)=>{
  store.visibleType = false
  store.payload.number = v.number.toString()
  store.payload.type = v.type.id
  store.payload.contract_date = new Date(v.contract_date).getTime()
  store.payload.contract_to_date = new Date(v.contract_date).getTime()
  store.payload.position_date = new Date(v.contract_date).getTime()
  store.visible = true
}


const openContract = (v, statusId)=>{
  if(statusId !== 2){
    emits('commandEv',v)
  }

}

const onSelect =(v)=>{
  if(v.key === 'view'){
    emits('openOffice', v.data.id)
  }else if(v.key === 'delete'){
    store.elementId = v.data.id
    store._delete()
  }
}

</script>



<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.list?.length>0">
      <n-table
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="!text-center min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[200px]">{{$t('contractPage.table.type')}}</th>
          <th class="w-[80px]">{{$t('contractPage.table.number')}}</th>
          <th class="min-w-[120px] w-[200px]">{{$t('contractPage.table.worker')}}</th>
          <th class="min-w-[100px] w-[100px]">{{$t('contractPage.table.command')}}</th>
          <th class="w-[120px]">{{$t('contractPage.table.status')}}</th>
          <th class="w-[300px]">{{$t('contractPage.table.organization')}}</th>
          <th class="w-[100px]">{{$t('contractPage.table.date')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td><span
              @click="onOpenFile(item)"
              class="text-sm hover:text-primary hover:underline cursor-pointer">{{item?.type?.name}}</span></td>
          <td>
            <div class="flex justify-center"><n-button class="font-medium" round type="error" size="tiny">{{item?.number}}</n-button></div>
          </td>
          <td>
            <UIUser
                :data="{
                  photo:item.worker.photo,
                  position:item.worker.birthday,
                  lastName:item.worker.last_name,
                  firstName:item.worker.first_name,
                  middleName:item.worker.middle_name,
                }"
            />
          </td>
          <td><div class="flex justify-center">
            <n-button
                :type="item?.command_status.id === 1? 'primary' : 'default'"
                @click="openContract(item, item?.command_status.id)"
                size="small">
              <template #icon>
                <ReceiptAdd24Regular v-if="item?.command_status.id === 1" />
                <ArrowSyncCheckmark20Filled v-else-if="item?.command_status.id === 2"/>
                <DocumentCheckmark24Regular v-else-if="item?.command_status.id === 3"/>
              </template>
              {{item?.command_status?.name}}</n-button>
          </div>
          </td>
          <td><UIStatus :status="item?.confirmation?.name"/></td>
          <td><span class="text-sm">{{item?.organization.name}}</span></td>
          <td>
            <span class="text-sm">{{Utils.timeOnlyDate(item?.contract_date)}}</span>
          </td>
          <td>
            <UIMenuButton
                :show-view="true"
                :show-edit="true"
                :data="item"
                @selectEv="onSelect"
            />
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          v-if="store.totalItems>10"
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list?.length===0 && !store.loading" />
  </n-spin>
</template>