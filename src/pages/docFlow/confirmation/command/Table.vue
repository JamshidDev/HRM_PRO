<script setup>
import {NoDataPicture, UIMenuButton, UIPagination, UIStatus, UIUser,} from "@/components/index.js"
import {useConfirmCommandStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useConfirmCommandStore()

const emits = defineEmits([ 'openOffice', 'onChangePage'])


const onOpenFile = (documentId, signatureId)=>{
  emits('openOffice', {documentId, signatureId})
}


const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelect = (v)=>{
  if(v.key === "view"){
    onOpenFile(v.data?.command.id, v.data.id)
  }
}

</script>



<template>
  <n-spin :show="store.loading" style="min-height:200px">
    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">
      <n-table
          class="mt-10"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="!text-center min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[140px]">{{$t('confirmation.contract.form.type')}}</th>
          <th class="min-w-[60px] w-[60px]">{{$t('confirmation.contract.form.number')}}</th>
          <th class="min-w-[60px] w-[400px]">{{$t('confirmation.contract.form.organization')}}</th>
          <th class="min-w-[80px] w-[80px]">{{$t('content.status')}}</th>
          <th class="min-w-[80px] w-[80px]">{{$t('content.date')}}</th>
          <th class="w-[120px]">{{$t('content.document')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <span @click="onOpenFile(item?.command.id, item.id)" class="hover:text-primary hover:underline cursor-pointer">{{item?.command?.type.name}}</span>
          </td>
          <td>
            <div class="flex justify-center"><n-button class="font-medium" round type="error" size="tiny">{{item?.command.command_number}}</n-button></div>
          </td>
          <td>{{item?.command?.organization?.name}}</td>

          <td><UIStatus :status="item?.status"/></td>
          <td>{{ Utils.timeOnlyDate(item?.command?.command_date) }}</td>
          <td><UIStatus :status="Utils.documentStatus[item?.generate]"/></td>

          <td>
            <UIMenuButton
                :show-view="true"
                :data="item"
                @selectEv="onSelect"
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
