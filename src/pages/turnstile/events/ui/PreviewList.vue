<script setup>
import {NoDataPicture, UIPagination, UIUser, UIBadge, UIStatus, UISelect} from "@/components/index.js"
import {useComponentStore, useEventStore} from "@/store/modules/index.js"
import {ArrowCircleDownRight20Regular, ArrowCircleUpLeft20Regular, ArrowCircleDown48Regular} from "@vicons/fluent"
import Utils from "@/utils/Utils.js"
import i18n from "@/i18n/index.js"

const {t} = i18n.global
const store = useEventStore()
const componentStore = useComponentStore()

const filterVisible = ref({
  start_time:false,
  end_time:false,
  hours:false,
  start_date_and_time:false,
  end_date_and_time:false,
})

const changePage = (v)=>{
  store.previewParams.page = v.page
  store.previewParams.per_page = v.per_page
  store._preview()
}


const maskStatus = {
  1:{
    name:t("hcEvent.form.withMask"),
    id:1
  },
  2:{
    name:t("hcEvent.form.NoMask"),
    id:2
  },
  3:{
    name:t("hcEvent.form.NoMask"),
    id:2
  },
}

const eventStatus = {
  'ACSEventFaceVerifyPass':{
    name:t("hcEvent.form.face"),
    id:3
  },
  'ACSEventCardFingerThrough':{
    name:t("hcEvent.form.finger"),
    id:1
  },
  'ACSEventFingerThrough':{
    name:t("hcEvent.form.finger"),
    id:1
  },
  'ACSEventHumanDetectFail':{
    name:t("hcEvent.form.face"),
    id:3
  },
  'ACSEventLegalCardThrough':{
    name:t("hcEvent.form.card"),
    id:9
  },
}


const filterEvent = ()=>{
  store.params.page = 1
  store._preview()
}

const onChangeStructure = (v)=>{
  store.previewParams.organizations=v
  filterEvent()
}

const onStartTimeEv = ()=>{
  if(store.previewParams.start_time?.length !== 5) return
  filterEvent()
}

const onEndTimeEv = ()=>{
  if(store.previewParams.end_time?.length !== 5) return
  filterEvent()
}

const onHourEv = ()=>{
  if(store.previewParams.hours?.length<3 && store.previewParams.hours?.length>0) return
  filterEvent()
}

const isHideColumn = computed(()=>['late_workers', 'early_leave_workers'].includes(store.previewParams.type))
const isShowMinuteColumn = computed(()=>store.previewParams.type ==='work_hours')

onMounted(()=>{
  if(store.levelList.length===0){
    store._levels()
  }

  if(componentStore.structureList.length===0){
    componentStore._structures()
  }
  controlFilter(store.previewParams.type)

})

const controlFilter =(v)=>{
  Object.keys(filterVisible.value).forEach((key)=>{filterVisible.value[key] = false})

  if(v==='late_workers'){
    store.previewParams.start_time = '09:00'
    filterVisible.value.start_time = true
    filterVisible.value.start_date_and_time = true
    filterVisible.value.end_date_and_time = true
  }
  else if(v==='absent_workers'){
    filterVisible.value.start_date_and_time = true
    filterVisible.value.end_date_and_time = true
  }
  else if(v==='early_leave_workers'){
    store.previewParams.end_time = '18:00'
    filterVisible.value.end_time = true
    filterVisible.value.start_date_and_time = true
    filterVisible.value.end_date_and_time = true
  }
  else if(v==='work_hours'){
    store.previewParams.hours = '8'
    filterVisible.value.hours = true
    filterVisible.value.start_date_and_time = true
    filterVisible.value.end_date_and_time = true
  }
  store._preview()
}


</script>

<template>
  <div class="h-[calc(100vh-100px)] overflow-y-auto">
    <div class="w-full grid gap-2 grid-cols-12">
<!--      <div class="col-span-2">-->
<!--        <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('actionLog.table.structure')}}</label>-->
<!--        <UISelect-->
<!--            :options="componentStore.structureList"-->
<!--            :modelV="store.previewParams.organizations"-->
<!--            @defaultValue="(v)=>store.previewParams.organizations=v"-->
<!--            @updateModel="onChangeStructure"-->
<!--            :checkedVal="store.structureCheck3"-->
<!--            @updateCheck="(v)=>store.structureCheck3=v"-->
<!--            :loading="componentStore.structureLoading"-->
<!--            v-model:search="componentStore.structureParams.search"-->
<!--            @onSearch="componentStore._structures"-->
<!--            @onSubmit="filterEvent"-->
<!--        />-->
<!--      </div>-->
<!--      <div class="col-span-2">-->
<!--        <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('turnstile.hcWorkersPage.access_levels')}}</label>-->
<!--        <n-select-->
<!--            multiple-->
<!--            clearable-->
<!--            v-model:value="store.previewParams.access_levels"-->
<!--            :options="store.levelList"-->
<!--            :loading="store.levelLoading"-->
<!--            label-field="name"-->
<!--            value-field="id"-->
<!--            @update:value="filterEvent"-->
<!--            :max-tag-count="2"-->
<!--        />-->
<!--      </div>-->
      <div v-if="filterVisible.hours" class="col-span-2">
        <label class="text-textColor3 ml-1">{{$t('hcEvent.form.hours')}}</label>
        <n-input
            v-mask="'##'"
            class="w-full"
            type="text"
            v-model:value="store.previewParams.hours"
            @keydown.enter="onHourEv"
            :loading="store.previewLoading"
            :disabled="store.previewLoading"
        />
      </div>
      <div v-if="filterVisible.start_time" class="col-span-2">
        <label class="text-textColor3 ml-1">{{$t('hcEvent.form.start_time')}}</label>
        <n-input
            v-mask="'##:##'"
            class="w-full"
            type="text"
            v-model:value="store.previewParams.start_time"
            @keydown.enter="onStartTimeEv"
            :loading="store.previewLoading"
            :disabled="store.previewLoading"
        />
      </div>
      <div v-if="filterVisible.end_time" class="col-span-2">
        <label class="text-textColor3 ml-1">{{$t('hcEvent.form.end_time')}}</label>
        <n-input
            v-mask="'##:##'"
            class="w-full"
            type="text"
            v-model:value="store.previewParams.end_time"
            @keydown.enter="onEndTimeEv"
            :loading="store.previewLoading"
            :disabled="store.previewLoading"
        />
      </div>
<!--      <div v-if="filterVisible.start_date_and_time" class="col-span-2">-->
<!--        <label class="text-xs text-gray-500">{{ $t('content.from') }}</label>-->
<!--        <n-date-picker-->
<!--            v-model:value="store.previewParams.start_date_and_time"-->
<!--            @update:value="filterEvent"-->
<!--            type="datetime"-->
<!--            update-value-on-close-->
<!--            :actions="null"-->
<!--            clearable />-->
<!--      </div>-->
<!--      <div v-if="filterVisible.end_date_and_time" class="col-span-2">-->
<!--        <label class=" text-xs text-gray-500">{{ $t('content.to') }}</label>-->
<!--        <n-date-picker-->
<!--            v-model:value="store.previewParams.end_date_and_time"-->
<!--            @update:value="filterEvent"-->
<!--            type="datetime"-->
<!--            update-value-on-close-->
<!--            :actions="null"-->
<!--            clearable />-->
<!--      </div>-->
      <div class="col-span-2">
        <n-button @click="store._download()" :loading="store.previewLoading" type="success" class="!mt-5 !w-full">
          {{$t('content.download')}}
          <template #icon>
            <ArrowCircleDown48Regular/>
          </template>
        </n-button>
      </div>

      <div class="col-span-12">
        <n-spin :show="store.previewLoading" style="min-height: 200px">
          <div class="w-full overflow-x-auto"  v-if="store.previewList.length>0">
            <div class="w-full mt-4">
              <n-table
                  :single-line="false"
                  size="small"
              >
                <thead>
                <tr>
                  <th class="text-center! min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
                  <th class="min-w-[200px]">{{$t('content.worker')}}</th>
                  <th v-if="isHideColumn" class="min-w-[130px] w-[130px] !text-center">{{$t('content.date')}}</th>
                  <th v-if="isHideColumn" class="min-w-[110px] w-[110px] !text-center">{{$t('content.hour')}}</th>
                  <th v-if="isHideColumn" class="min-w-[100px] w-[100px]">{{$t('hcEvent.form.direction')}}</th>
                  <th v-if="isHideColumn" class="min-w-[100px] w-[300px]">{{$t('hcEvent.form.device')}}</th>
                  <th v-if="isHideColumn" class="min-w-[100px] w-[160px]">{{$t('hcEvent.form.device')}}</th>
                  <th v-if="isHideColumn" class="min-w-[100px] w-[120px] !text-center">{{$t('hcEvent.form.mask_status')}}</th>
                  <th v-if="isHideColumn" class="min-w-[100px] w-[100px] !text-center">{{$t('hcEvent.form.temperature')}}</th>

                  <th v-if="!isHideColumn && !isShowMinuteColumn" class="min-w-[100px] w-[500px]">{{$t('content.position')}}</th>
                  <th v-if="!isHideColumn && !isShowMinuteColumn" class="min-w-[100px] w-[300px]">{{$t('content.department')}}</th>

                  <th v-if="isShowMinuteColumn" class="min-w-[100px] w-[300px]">{{$t('hcEvent.form.workTime')}}</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(item, idx) in store.previewList" :key="idx">
                  <td><span class="text-center block">{{ (store.previewParams.page - 1) * store.previewParams.per_page + idx + 1 }}</span></td>
                  <td>
                    <div>
                      <UIUser
                          :hide-tooltip="true"
                          :short="false"
                          :data="{
                    photo:item?.worker?.photo,
                    firstName:item?.worker?.first_name,
                    middleName:item?.worker?.middle_name,
                    lastName:item?.worker?.last_name,
                    position:item?.worker.id,
                  }"
                      />
                    </div>
                  </td>
                  <td v-if="isHideColumn" class="!text-center">
                    <UIBadge :show-icon="false" :label="item?.event_date" />
                  </td>
                  <td v-if="isHideColumn" class="!text-center">
                    <UIBadge :show-icon="false" :label="item?.event_time" :type="Utils.colorTypes.dark" />
                  </td>
                  <td v-if="isHideColumn" class="!text-center">
                    <n-button :type="item.direction? 'primary' : 'error'" secondary size="tiny">
                      <span>{{$t(item.direction? 'turnstile.workDurationPage.enter' : 'turnstile.workDurationPage.exit')}}</span>
                      <template #icon>
                        <n-icon size="17">
                          <ArrowCircleDownRight20Regular v-if="item.direction"/>
                          <ArrowCircleUpLeft20Regular v-else />
                        </n-icon>
                      </template>
                    </n-button>
                  </td>
                  <td v-if="isHideColumn">{{item.device}}</td>
                  <td v-if="isHideColumn">
                    <UIStatus :status="eventStatus[item.auth_type]"/>
                  </td>
                  <td v-if="isHideColumn" class="!text-center">
                    <UIStatus :status="maskStatus[item.mask_status]"/>
                  </td>
                  <td v-if="isHideColumn" class="!text-center">
                    <template v-if="[1,2].includes(item.temperature)">
                      <UIStatus :status="store.temperatureStatus[item.temperature]"/>
                    </template>
                    <template v-else>
                      <UIStatus :status="store.temperatureStatus[3]"/>
                    </template>
                  </td>

                  <td v-if="!isHideColumn && !isShowMinuteColumn" class="!text-center">
                    {{item?.position?.name}}
                  </td>
                  <td v-if="!isHideColumn && !isShowMinuteColumn" class="!text-center">
                    {{item?.department?.name}}
                  </td>

                  <td v-if="isShowMinuteColumn" class="!text-center">
                    {{item?.minutes_worked}}
                  </td>
                </tr>
                </tbody>
              </n-table>
            </div>
            <UIPagination
                :page="store.previewParams.page"
                :per_page="store.previewParams.size"
                :total="store.previewTotal"
                @change-page="changePage"
            />
          </div>
          <NoDataPicture v-if="store.previewList.length===0 && !store.previewLoading" />
        </n-spin>
      </div>

    </div>
  </div>
</template>
