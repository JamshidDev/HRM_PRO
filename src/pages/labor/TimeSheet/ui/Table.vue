<script setup>
import {NoDataPicture, UIMenuButton, UIPagination} from "@/components/index.js"
import {useTimeSheetStore, useTimesheetWorkerStore} from "@/store/modules/index.js"
import dayjs from "dayjs";

const store = useTimeSheetStore()
const workerStore = useTimesheetWorkerStore()

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelect = (v)=>{
  if(v.key === 'view'){
    workerStore.elementId = v.data.id
    workerStore.visible = true
    workerStore._index()
  }else if(v.key === 'edit'){
    store.elementId = v.data.id
    store.payload.department_id = v.data.department.id
    store.payload.timestamp = dayjs().month(v.data.month-1).year(v.data.year).valueOf()
    store.visibleType = false
    store.visible = true
  }else if(v.key==='view'){

  }
}

</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">
      <n-table
          class="mt-5 w-full table-fixed"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="!text-center w-[30px] max-w-[30px]">{{$t('content.number')}}</th>
          <th class="!text-center min-w-[500px]">{{$t('content.organization')}}</th>
          <th class="!text-center">{{$t('content.month')}}</th>
          <th class="!text-center max-w-[100px] w-[100px]">{{$t('content.status')}}</th>
          <th class="max-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td class="w-[20px] max-w-[20px]"><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>{{item.department.name}}</td>
          <td class="!text-center">{{dayjs().year(item.year).month(item.month-1).format('YYYY MMMM')}}</td>
          <td class="!text-center">{{item.confirmation.name}}</td>
          <td>
            <UIMenuButton
                :show-view="true"
                :data="item"
                @select-ev="onSelect"
                show-edit
                :show-delete="false"
            />
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          v-if="store.totalItems>store.params.per_page"
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
  </n-spin>
</template>
