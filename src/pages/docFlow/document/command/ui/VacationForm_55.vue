<script setup>
import {useCommandStore, useComponentStore} from "@/store/modules/index.js"
import {PersonNote20Regular, DismissCircle16Regular, Eye24Regular} from "@vicons/fluent"
import Utils from "../../../../../utils/Utils.js"
import i18n from "@/i18n/index.js"

const store = useCommandStore()
const componentStore = useComponentStore()
const {t} = i18n.global

const onRemoveWorker = (id)=>{
  store.vacations55 =  store.vacations55.filter((v)=>v.id !== id)
  store.payload.workers = store.payload.workers.filter((workerId)=>workerId !== id)
}

const onSubmit = (mainData)=>{
  const checkForm = store.vacations55.every((v)=>(v.from && v.to && v.from_time && v.to_time))
  if(checkForm){
    const data = store.vacations55.map(v=>({
      id:v.id,
      from:Utils.timeToZone(v.from),
      from_time:Utils.timeOnlyHour(v.from_time),
      to_time:Utils.timeOnlyHour(v.to_time),
      to:Utils.timeToZone(v.to),
    }))

    return {
      data:{
        ...mainData,
        worker_positions:data,
      },
      isValid:true,
    }
  }else{
    $Toast.warning(t('documentPage.command.form.requiredVacationData'))
    return {
      data:null,
      isValid:false,
    }
  }


}

const getLastVacation = (v)=>{
  store.vacationId = v.id
  store.lastVacation((data)=>{
    let index = store.vacations55.findIndex(a=>a.id === v.id)
    if(index === -1) return
    store.vacations55[index].lastVacation =data.length>0?  data[0] : t('content.no-data')
  })
}

defineExpose({
  onSubmit
})


onMounted(()=>{
  componentStore._enums()
})


</script>

<template>
  <div v-for="(item, idx) in store.vacations55" :key="idx"
       class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground">
    <div class="col-span-12">
      <template v-if="item?.lastVacation && item?.lastVacation?.period_from">
        <n-collapse-transition v-show="Boolean(item?.lastVacation)">
          <div class="mb-4 flex flex-wrap justify-center gap-x-[20px] text-secondary border border-gray-300 px-2 py-1 rounded-lg border-dashed">
            <div>
              <div class="font-medium"> {{ item?.lastVacation.period_from}}</div>
              <div class="text-xs">{{$t('documentPage.command.form.period_from')}}</div>
            </div>
            <div>
              <div class="font-medium"> {{ item?.lastVacation.period_to}}</div>
              <div class="text-xs">{{$t('documentPage.command.form.period_to')}}</div>
            </div>
            <div>
              <div class="font-medium"> {{ item?.lastVacation.from}}</div>
              <div class="text-xs">{{$t('documentPage.command.form.from')}}</div>
            </div>
            <div>
              <div class="font-medium"> {{ item?.lastVacation.to}}</div>
              <div class="text-xs">{{$t('documentPage.command.form.to')}}</div>
            </div>
            <div>
              <div class="font-medium text-warning"> {{ item?.lastVacation?.type?.name}}</div>
              <div class="text-xs">{{$t('content.type')}}</div>
            </div>
            <div>
              <div class="font-medium text-primary"> {{ item?.lastVacation?.all_day}}</div>
              <div class="text-xs">{{$t('documentPage.command.form.all_day')}}</div>
            </div>
            <div>
              <div class="font-medium" :class="[item?.lastVacation.rest_day>=0? 'text-success' : 'text-danger']"> {{ item?.lastVacation.rest_day}}</div>
              <div class="text-xs">{{$t('documentPage.command.form.rest_day')}}</div>
            </div>

          </div>
        </n-collapse-transition>
      </template>
      <template v-if="typeof item?.lastVacation === 'string'">
        <div class="text-center mb-4 text-warning">{{item?.lastVacation}}</div>
      </template>
    </div>
    <div class="col-span-12 flex justify-center mb-1">
      <n-button
          :loading="store.vacationLoading"
          ghost
          size="tiny"
          @click="getLastVacation(item)"
      >
        <template #icon>
          <Eye24Regular/>
        </template>
        {{$t('documentPage.command.lastVacation')}}</n-button>
    </div>

    <div class="col-span-12 flex justify-between mb-2">
      <n-button type="info" secondary size="tiny">
        <template #icon>
          <PersonNote20Regular/>
        </template>
        {{Utils.combineFullName(item.worker.worker)}}</n-button>

      <n-button
          type="error"
          secondary
          size="tiny"
          @click="onRemoveWorker(item.id)"
      >
        <template #icon>
          <DismissCircle16Regular/>
        </template>
        {{$t('documentPage.command.form.removeWorker')}}</n-button>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item
          :show-feedback="false"
          :label="$t(`commandPage.form_55.from`)" path="from">
        <n-date-picker
            class="w-full"
            v-model:value="item.from"
            type="date"
            :placeholder="$t(`content.choose`)"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item
          :show-feedback="false"
          :label="$t(`commandPage.form_55.from_time`)" path="from_time">

        <n-time-picker
            class="w-full"
            :placeholder="$t(`content.choose`)"
            v-model:value="item.from_time"
            format="h:mm a" />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item
          :show-feedback="false"
          :label="$t(`commandPage.form_55.to`)" path="to">
        <n-date-picker
            class="w-full"
            v-model:value="item.to"
            type="date"
            :placeholder="$t(`content.choose`)"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item
          :show-feedback="false"
          :label="$t(`commandPage.form_55.to_time`)" path="to_time">
        <n-time-picker
            class="w-full"
            :placeholder="$t(`content.choose`)"
            v-model:value="item.to_time"
            format="h:mm a" />
      </n-form-item>
    </div>
  </div>
</template>
