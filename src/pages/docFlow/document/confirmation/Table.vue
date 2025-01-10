<script setup>
import {NoDataPicture, UIActionButton, UIPagination, UIUser, } from "@/components/index.js"
import {useConfirmationContractStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useConfirmationContractStore()
const signatureDrawer = ref(null)




const onEdit = (v)=>{
}

const onDelete = (v)=>{
}

const onAdd = (v)=>{
}

const onView = (v)=>{
  // pdfStore.getDocument(v.id, 'contracts')
  signatureDrawer.value.getDocument(v.contract.id, 'contracts')
}


const changePage = (v)=>{
  emits('onChangePage', v)
}

</script>



<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">
      <n-table
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="!text-center min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[30px] w-[60px]">{{$t('confirmation.contract.form.type')}}</th>
          <th class="min-w-[30px]">{{$t('confirmation.contract.form.worker')}}</th>
          <th class="min-w-[60px] w-[400px]">{{$t('confirmation.contract.form.organization')}}</th>
          <th class="min-w-[60px] w-[60px]">{{$t('confirmation.contract.form.number')}}</th>
          <th class="min-w-[100px] w-[140px]">{{$t('content.date')}}</th>
          <th class="min-w-[90px] w-[90px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>{{item?.contract?.type}}</td>
          <td>
            <UIUser
                :data="{
                    photo:item?.contract.worker.photo,
                    lastName:item?.contract.worker.last_name,
                    firstName:item?.contract.worker.first_name,
                    middleName:item?.contract.worker.middle_name,
                    position:$t('content.no-data'),
                }"
            />
          </td>
          <td>{{item?.contract?.organization?.name}}</td>
          <td>{{item?.contract?.number}}</td>
          <td>{{ Utils.timeWithMonth(item?.contract?.contract_date) }}</td>
          <td>
            <UIActionButton
                visible-view-btn
                :data="item"
                :loading-delete="item.id === store.elementId && store.deleteLoading"
                @on-edit="onEdit"
                @on-delete="onDelete"
                @on-add="onAdd"
                @onView="onView"
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
<!--    <UIPdfSignatureDrawer ref="signatureDrawer" />-->
  </n-spin>
</template>

<style scoped>

</style>