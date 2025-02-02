<script setup>
import {NoDataPicture, UIActionButton, UIPagination, UIStatus, UIUser,} from "@/components/index.js"
import {useConfirmCommandStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useConfirmCommandStore()

const emits = defineEmits([ 'openOffice', 'onChangePage'])


const onOpenFile = (documentId, signatureId)=>{
  emits('openOffice', {documentId, signatureId})
}


const changePage = (v)=>{
  emits('onChangePage', v)
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
          <th class="min-w-[60px] w-[400px]">{{$t('confirmation.contract.form.organization')}}</th>
          <th class="min-w-[60px] w-[60px]">{{$t('confirmation.contract.form.number')}}</th>
          <th class="min-w-[80px] w-[80px]">{{$t('content.status')}}</th>
          <th class="min-w-[80px] w-[80px]">{{$t('content.date')}}</th>
          <th class="min-w-[60px] w-[60px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>{{item?.command?.type.name}}</td>
          <td>{{item?.command?.organization?.name}}</td>
          <td>
            <div class="flex justify-center"><n-button class="font-medium" round type="error" size="tiny">{{item?.command.command_number}}</n-button></div>
          </td>
          <td><UIStatus :status="item?.status?.name"/></td>
          <td>{{ Utils.timeOnlyDate(item?.command?.command_date) }}</td>
          <td>
            <UIActionButton
                :visible-delete-btn="false"
                :visible-edit-btn="false"
                :visible-view-btn="true"
                :data="item"
                @onView="onOpenFile(item?.command.id, item.id)"
            />
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          v-show="store.list.length>10"
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
  </n-spin>
</template>
