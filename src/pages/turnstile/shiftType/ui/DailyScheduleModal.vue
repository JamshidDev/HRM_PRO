<script setup>
import {CheckmarkCircle24Filled, DismissCircle24Filled} from "@vicons/fluent"
import {useShiftTypeStore} from "@/store/modules/index.js"
import {UIModal, UIUser, UIPageFilter} from "@/components/index.js"
import {UIPagination} from "@/components/index.js"
import i18n from "@/i18n/index.js"

const store = useShiftTypeStore()
const t = i18n.global.t



const changePage = (v)=>{
  store.notScheduleParams.page = v.page
  store.notScheduleParams.per_page = v.per_page
  store._notScheduleWorker()
}

const onSave = ()=>{
  if(store.selectedWorkers.length === 0) {
    $Toast.warning(t('content.empty'))
    return
  }
  const data = {
    group_id:store.groupId || undefined,
    schedule_type:store.elementId,
    start_date:store.notScheduleParams.start_date,
    end_date:store.notScheduleParams.end_date,
    worker_position_ids:store.selectedWorkers,
  }
  store._generateWorkerSchedule(data)
}

const onSearchEv = ()=>{
  store.notScheduleParams.page = 1
  store._notScheduleWorker()
}

const onSelectAll = () =>{
  const idCollection = store.notScheduleWorkerList.map(item=>item.id)
  const otherIds = store.selectedWorkers.filter(v=>!idCollection.includes(v))

  store.selectedWorkers = isSelectedAll.value? [...otherIds] : [...otherIds, ...idCollection]
}

const isSelectedAll = computed(()=>{
  return store.notScheduleWorkerList.every(v=>store.selectedWorkers.includes(v.id))
})

const onForceUnSelect = ()=>{
  store.selectedWorkers = []
}


</script>

<template>
  <UIModal
      v-model:visible="store.notScheduleVisible"
      :width="'90%'"
      :title="$t('shiftType.createTitle')">

    <div>
      <n-spin :show="store.notScheduleLoading">
        <UIPageFilter @onSearch="onSearchEv" v-model:search="store.notScheduleParams.search" :search-loading="store.notScheduleLoading" :show-add-button="false" :show-filter-button="false">
          <template #filterAction>
            <n-button @click="onSelectAll" :type="isSelectedAll? 'error' : 'primary'">
              <template #icon>
                <DismissCircle24Filled v-if="isSelectedAll"/>
                <CheckmarkCircle24Filled v-else />
              </template>
              {{$t(isSelectedAll? 'content.unSelectList' : 'content.selectList')}}
            </n-button>
          </template>
        </UIPageFilter>
        <div class="w-full overflow-y-auto h-[600px] pr-2 mt-4" >
          <template v-if="store.notScheduleWorkerList.length>0">
            <n-checkbox-group v-model:value="store.selectedWorkers">
              <n-table
                  :single-line="false"
                  size="small"
                  class="sticky-table-header"
              >
                <thead>
                <tr>
                  <th class="text-center! min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
                  <th class="min-w-[40px] w-[40px]"></th>
                  <th class="min-w-[100px]">{{$t('content.fullName')}}</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(item, idx) in store.notScheduleWorkerList" :key="idx">
                  <td><span class="text-center block">{{ (store.notScheduleParams.page - 1) * store.notScheduleParams.per_page + idx + 1 }}</span></td>
                  <td>
                    <div class="flex justify-center">
                      <n-checkbox size="large" :value="item.id" />
                    </div>
                  </td>
                  <td>
                    <UIUser :hide-tooltip="true" :short="false" class="w-full" :data="item.data" />
                  </td>

                </tr>
                </tbody>
              </n-table>
            </n-checkbox-group>
          </template>

        </div>
        <UIPagination
            :page="store.notScheduleParams.page"
            :per_page="store.notScheduleParams.per_page"
            :total="store.notScheduleWorkerCount"
            @change-page="changePage"
        />
        <div class="flex justify-between gap-4 mt-10">
          <div class="flex gap-2">
            <n-button type="primary" secondary>{{$t('content.selected')}} <span class="font-bold ml-2">{{store.selectedWorkers.length}}</span></n-button>
            <n-button @click="onForceUnSelect" secondary type="error" >
              <template #icon>
                <DismissCircle24Filled/>
              </template>
              {{$t('content.forceUnSelectAll')}}
            </n-button>
          </div>

            <div class="flex gap-4">
              <n-button type="error" secondary @click="store.notScheduleVisible=false">{{$t('content.cancel')}}</n-button>
              <n-button :loading="store.saveLoading" type="primary" @click="onSave">{{$t('content.save')}}</n-button>
            </div>
        </div>
      </n-spin>
    </div>

  </UIModal>
</template>
