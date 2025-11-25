<script setup>
import {NoDataPicture, UIBadge, UIMenuButton, UIPagination} from "@/components/index.js"
import {useShiftTypeStore, useScheduleGroupWorkerStore} from "@/store/modules/index.js"
import {CalendarLtr24Regular, Eye24Filled, Table24Regular} from "@vicons/fluent"
import Utils from "@/utils/Utils.js"


const store = useShiftTypeStore()
const scheduleGroupworkerStore = useScheduleGroupWorkerStore()

const changePage = (v)=>{
  store.groupParams.page = v.page
  store.groupParams.per_page = v.per_page
  store._group()
}

const onViewWorkers = (v)=>{
  scheduleGroupworkerStore.params.group = v.id
  scheduleGroupworkerStore.params.year1 = +v.start_date.split("-")[0]
  scheduleGroupworkerStore.params.month1 = +v.start_date.split("-")[1]
  scheduleGroupworkerStore.params.year2 = +v.end_date.split("-")[0]
  scheduleGroupworkerStore.params.month2 = +v.end_date.split("-")[1]
  store.activeTab = 3
}

const onSelectEv = (v)=>{
      store.elementId = v.data.id
    if(v.key === Utils.ActionTypes.delete){
      store._deleteGroup()
    }else if(v.key === Utils.ActionTypes.edit){
      onEdit(v.data)
    }else if(v.key === Utils.ActionTypes.view){
      onViewWorkers(v.data)
    }
}

const onEdit = (v)=>{
  store.generatePayload.name = v.name
  store.generatePayload.start_date = Utils.datePickerFormatter(v.start_date)
  store.generatePayload.end_date = Utils.datePickerFormatter(v.end_date)
  store.generatePayload.name = v.name
  store.isDailySchedule = false
  store.visibleType=false
  store.visible = true


}


</script>

<template>
  <n-spin :show="store.groupLoading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.groupList.length>0">
      <n-table
          class="mt-3 w-full table-fixed"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="w-[40px] min-w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[150px]">{{$t('content.name')}}</th>
          <th class="min-w-[150px] w-[200px]">{{$t('content.worker')}}</th>
          <th class="min-w-[120px] w-[120px]">{{$t('content.from')}}</th>
          <th class="min-w-[120px] w-[120px]">{{$t('content.to')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.groupList" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.groupParams.page - 1) * store.groupParams.per_page + idx + 1 }}</span></td>
          <td>
            <div @click="onViewWorkers(item)" class="hover:text-primary cursor-pointer">{{item.name}}</div>
          </td>
          <td>
            <UIBadge :show-icon="false" :label="item.workers_count" />
          </td>
          <td>
            <UIBadge :show-icon="false" :label="item.start_date" />
          </td>
          <td>
            <UIBadge :show-icon="false" :label="item.end_date" />
          </td>
          <td>
            <UIMenuButton
                @selectEv="onSelectEv"
                :data="item"
                :show-view="true"
                :show-edit="true"
                :show-attachment="item?.schedule_type?.type?.id === 2"
            />
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          :page="store.groupParams.page"
          :per_page="store.groupParams.per_page"
          :total="store.totalGroup"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.groupList.length===0 && !store.groupLoading" />
  </n-spin>
</template>
