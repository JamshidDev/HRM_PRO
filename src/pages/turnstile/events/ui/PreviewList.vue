<script setup>
import {NoDataPicture, UIPagination, UIUser, UIBadge, UIStatus, UISelect} from "@/components/index.js"
import {useComponentStore, useEventStore} from "@/store/modules/index.js"
import {ArrowCircleDownRight20Regular, ArrowCircleUpLeft20Regular, ArrowCircleDown48Regular} from "@vicons/fluent"
import Utils from "@/utils/Utils.js"
import i18n from "@/i18n/index.js"

const {t} = i18n.global
const store = useEventStore()
const componentStore = useComponentStore()

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

const onEnterEv = ()=>{
  if(store.previewParams.first_time?.length !== 5) return
  filterEvent()
}

onMounted(()=>{
  if(store.levelList.length===0){
    store._levels()
  }

  if(componentStore.structureList.length===0){
    componentStore._structures()
  }
})

</script>

<template>
  <div class="h-[calc(100vh-100px)] overflow-y-auto">
    <div class="w-full grid gap-2 grid-cols-12">
      <div class="col-span-2">
        <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('actionLog.table.structure')}}</label>
        <UISelect
            :options="componentStore.structureList"
            :modelV="store.previewParams.organizations"
            @defaultValue="(v)=>store.previewParams.organizations=v"
            @updateModel="onChangeStructure"
            :checkedVal="store.structureCheck3"
            @updateCheck="(v)=>store.structureCheck3=v"
            :loading="componentStore.structureLoading"
            v-model:search="componentStore.structureParams.search"
            @onSearch="componentStore._structures"
            @onSubmit="filterEvent"
        />
      </div>
      <div class="col-span-2">
        <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('turnstile.hcWorkersPage.access_levels')}}</label>
        <n-select
            multiple
            clearable
            v-model:value="store.previewParams.access_levels"
            :options="store.levelList"
            :loading="store.levelLoading"
            label-field="name"
            value-field="id"
            @update:value="filterEvent"
            :max-tag-count="2"
        />
      </div>
      <div class="col-span-2">
        <label class="text-textColor3 ml-1">{{$t('turnstile.workDurationPage.startTime')}}</label>
        <n-input
            v-mask="'##:##'"
            class="w-full"
            type="text"
            v-model:value="store.previewParams.first_time"
            @keydown.enter="onEnterEv"
            :loading="store.previewLoading"
            :disabled="store.previewLoading"
        />
      </div>
      <div class="col-span-2">
        <label class="text-xs text-gray-500">{{ $t('content.from') }}</label>
        <n-date-picker
            v-model:value="store.previewParams.start_time"
            @update:value="filterEvent"
            type="date"
            update-value-on-close
            clearable />
      </div>
      <div class="col-span-2">
        <label class=" text-xs text-gray-500">{{ $t('content.to') }}</label>
        <n-date-picker
            v-model:value="store.previewParams.end_time"
            @update:value="filterEvent"
            type="date"
            update-value-on-close
            :actions="null"
            clearable />
      </div>
      <div class="col-span-2">
        <n-button type="success" class="!mt-5 !w-full">
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
                  <th class="min-w-[130px] w-[130px] !text-center">{{$t('content.date')}}</th>
                  <th class="min-w-[110px] w-[110px] !text-center">{{$t('content.hour')}}</th>
                  <th class="min-w-[100px] w-[100px]">{{$t('hcEvent.form.direction')}}</th>
                  <th class="min-w-[100px] w-[300px]">{{$t('hcEvent.form.device')}}</th>
                  <th class="min-w-[100px] w-[160px]">{{$t('hcEvent.form.device')}}</th>

                  <th class="min-w-[100px] w-[120px] !text-center">{{$t('hcEvent.form.mask_status')}}</th>
                  <th class="min-w-[100px] w-[100px] !text-center">{{$t('hcEvent.form.temperature')}}</th>
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
                  <td class="!text-center">
                    <UIBadge :show-icon="false" :label="item?.event_date" />
                  </td>
                  <td class="!text-center">
                    <UIBadge :show-icon="false" :label="item?.event_time" :type="Utils.colorTypes.dark" />
                  </td>


                  <td class="!text-center">
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
                  <td>{{item.device}}</td>
                  <td>
                    <UIStatus :status="eventStatus[item.auth_type]"/>
                  </td>
                  <td class="!text-center">
                    <UIStatus :status="maskStatus[item.mask_status]"/>
                  </td>
                  <td class="!text-center">
                    <template v-if="[1,2].includes(item.temperature)">
                      <UIStatus :status="store.temperatureStatus[item.temperature]"/>
                    </template>
                    <template v-else>
                      <UIStatus :status="store.temperatureStatus[3]"/>
                    </template>
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
