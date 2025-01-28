<script setup>
import {NoDataPicture, UIActionButton, UIPagination, UIStatus, UIUser,} from "@/components/index.js"
import {useCommandStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useCommandStore()

const emits = defineEmits([ 'openOffice',])


const onEdit = (v)=>{
}

const onDelete = (v)=>{
}

const onAdd = (v)=>{
}


const onOpenFile = (v)=>{
  emits('openOffice', v)
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
          <th class="min-w-[60px]">{{$t('confirmation.contract.form.organization')}}</th>
          <th class="min-w-[60px] w-[60px]">{{$t('confirmation.contract.form.number')}}</th>
          <th class="min-w-[100px] w-[100px]">{{$t('content.status')}}</th>
          <th class="min-w-[100px] w-[100px]">{{$t('content.date')}}</th>
          <th class="min-w-[90px] w-[90px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>{{item?.organization?.name}}</td>
          <td>{{item?.command_number}}<span v-if="item?.contract"> / {{item?.contract?.number}}</span></td>
          <td><UIStatus :status="item?.contract?.status?.name"/> </td>
          <td>{{ Utils.timeOnlyDate(item?.command_date) }}</td>
          <td>
            <UIActionButton
                visible-view-btn
                :data="item"
                :loading-delete="item.id === store.elementId && store.deleteLoading"
                @on-edit="onEdit"
                @on-delete="onDelete"
                @on-add="onAdd"
                @onView="onOpenFile(item.id)"
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

<style scoped>

</style>