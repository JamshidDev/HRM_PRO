<script setup>
import {NoDataPicture, UIMenuButton, UIPagination, UIStatus} from "@/components/index.js"
import {
  useTimesheetConfirmStore,
  useTimesheetStore,
  useTimesheetWorkerStore
} from "@/store/modules/index.js"
import {Checkmark16Filled, CalendarCheckmark28Filled, CheckmarkCircle24Filled} from "@vicons/fluent";
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()

import dayjs from "dayjs";
import Utils from "@/utils/Utils.js";

const store = useTimesheetStore()
const timesheetWorkerStore = useTimesheetWorkerStore()
const timesheetConfirmStore = useTimesheetConfirmStore()

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelect = (v)=>{
  if(v.key ===  Utils.ActionTypes.view){
    timesheetWorkerStore.elementId = v.data.id
    timesheetWorkerStore.visible = true
    timesheetWorkerStore._index()
  }else if(v.key === Utils.ActionTypes.edit){
    if(!accStore.checkAction(accStore.pn.hrTableWorkersWrite)) return
    store.elementId = v.data.id
    store.payload.department_id = v.data.department?.id
    store.payload.work_place_id = v.data.work_place?.id
    store.payload.active_tab = v.data.department?.id ? 'department' : 'organization'
    store.payload.timestamp = dayjs().month(v.data.month-1).year(v.data.year).valueOf()
    store.visibleType = false
    store.visible = true
    console.log(store.payload)
  }else if(v.key===Utils.ActionTypes.verifier){
    if(!accStore.checkAction(accStore.pn.hrTableWorkersWrite)) return
    timesheetConfirmStore.elementId = v.data.id
    timesheetConfirmStore.visible = true
  }else if(v.key===Utils.ActionTypes.finish){
    if(!accStore.checkAction(accStore.pn.hrTableWorkersWrite)) return
    store.warningVisible = true
    store.elementId = v.data.id
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
          <th class="text-center! w-[40px] max-w-[40px]">{{$t('content.number')}}</th>
          <th class="text-center! min-w-[500px]">{{$t('timesheetWorkerPage.work_place')}}</th>
          <th class="text-center!">{{$t('content.month')}}</th>
          <th class="text-center! max-w-[120px] w-[120px]">{{$t('timesheet.status')}}</th>
          <th class="text-center! max-w-[100px] w-[100px]">{{$t('content.status')}}</th>
          <th class="max-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td class="w-[20px] max-w-[20px]"><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>{{item.department?.name || item.work_place?.name}}</td>
          <td class="text-center!">{{dayjs().year(item.year).month(item.month-1).format('YYYY MMMM')}}</td>
          <td class="text-center! max-w-[120px] w-[120px]">
            <n-button v-if="!!item?.status" type='primary' size="tiny" dashed>
              <template #icon>
                <n-icon :component="CheckmarkCircle24Filled"/>
              </template>
              {{$t('timesheet.finished')}}
            </n-button>
          </td>
          <td class="text-center!"><UIStatus :status="item.confirmation"/></td>
          <td>
            <UIMenuButton
                :show-view="true"
                :data="item"
                @select-ev="onSelect"
                show-edit
                :show-delete="false"
                :extra-options="(()=>{
                    let options =[{
                      label: $t('timesheetPage.verifiers'),
                      key: Utils.ActionTypes.verifier,
                      icon: Checkmark16Filled,
                      visible:true,
                    }]
                    if(!item.status){
                      options.push({
                        label: $t('content.finish'),
                        key: Utils.ActionTypes.finish,
                        icon: CalendarCheckmark28Filled,
                        visible:true,
                      })
                    }
                    return options
                })()"
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
