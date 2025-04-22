<script setup>
import {NoDataPicture, UIActionButton, UIMenuButton, UIPagination, UIStatus, UIUser,} from "@/components/index.js"
import {useCommandStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useCommandStore()

const emits = defineEmits([ 'openOffice',])


const onOpenFile = (v)=>{
  emits('openOffice', v)
}


const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelect = (v)=>{
  if(v.key === 'view'){
    emits('openOffice', v.data.id)
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
          <th class="!text-center min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[60px]">{{$t('content.type')}}</th>
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