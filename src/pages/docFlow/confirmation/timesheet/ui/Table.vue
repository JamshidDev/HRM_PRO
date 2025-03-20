<script setup>
import {NoDataPicture, UIMenuButton, UIPagination, UIStatus, UIUser,} from "@/components/index.js"
import {useTimesheetStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useTimesheetStore()

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
    onOpenFile(v.data?.timesheet.id, v.data.id)
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
          <th class="min-w-[200px] w-[300px]">{{$t('content.worker')}}</th>
          <th class="min-w-[120px]">{{$t('timesheetWorkerPage.work_place')}}</th>
          <th class="min-w-[100px] w-[100px]">{{$t('content.month')}}</th>
          <th class="min-w-[120px] w-[100px]">{{$t('content.year')}}</th>

          <th class="min-w-[120px] w-[120px]">{{$t('content.status')}}</th>

          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <UIUser
                :data="{
                    photo:item.timesheet.user?.worker.photo,
                    firstName:item.timesheet.user?.worker.first_name,
                    middleName:item.timesheet.user?.worker.middle_name,
                    lastName:item.timesheet.user?.worker.last_name,
                    position:item.timesheet.user?.position || ' ',
                  }"
            />
          </td>
          <td><div class="font-medium">{{item?.timesheet?.work_place?.name || item?.timesheet?.department?.name}}</div></td>
          <td><div class="font-medium">{{Utils.getMonthNameById(item?.timesheet?.month)}}</div></td>
          <td><div class="font-medium">{{item?.timesheet?.year}}</div></td>

          <td><UIStatus :status="item?.status"/></td>
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
