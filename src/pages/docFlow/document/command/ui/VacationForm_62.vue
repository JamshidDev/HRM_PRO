<script setup>
import {useCommandStore, useComponentStore} from "@/store/modules/index.js"
import {PersonNote20Regular, DismissCircle16Regular, Eye24Regular} from "@vicons/fluent"
import Utils from "../../../../../utils/Utils.js"
import i18n from "@/i18n/index.js"
import {UIStructure,UISelect} from "@/components/index.js"

const store = useCommandStore()
const componentStore = useComponentStore()
const {t} = i18n.global


const onRemoveWorker = (id)=>{
  store.vacations62 =  store.vacations62.filter((v)=>v.id !== id)
  store.payload.workers = store.payload.workers.filter((workerId)=>workerId !== id)
}

const onSubmit = (mainData)=>{

  const checkForm = store.vacations62.every((v)=>{
    console.log(v)
    return (Boolean(v.from) && Boolean(v.to) && (v.reason))
  })
  if(checkForm){
    const data = store.vacations62.map(v=>({
      id:v.id,
      from:Utils.timeToZone(v?.from),
      to:Utils.timeToZone(v?.to),
      reason:v.reason,
      ...(v.organizationType ===2?
          {to_organization:v.to_organization}
          :
          {
            work_place_id:v.work_place_id[0].id,
            department_id:v.department_id[0].id,
          })
    }))

    return {
      data:{
        ...mainData,
        worker_positions:data,
      },
      isValid:true,
    }
  }else{
    $Toast.warning(t('documentPage.command.form.isNotCalculate'))
    return {
      data:null,
      isValid:false,
    }
  }


}

const organizationTypes = [
  {
    name:t('commandPage.form_62.railwayOrg'),
    id:1
  },
  {
    name:t('commandPage.form_62.otherOrg'),
    id:2
  },
]

const onChangeStructure = (v, workerId)=>{
  const index = store.vacations62.findIndex(a=>a.id === workerId)
  store.vacations62[index].work_place_id = v
  store.vacations62[index].departmentList =[]
  store.vacations62[index].department_id =[]
  store.vacations62[index].loading = true
  if(v.length>0){
    componentStore._departmentTreeList(v[0].id, (x)=>{
      store.vacations62[index].departmentList = x
      store.vacations62[index].loading = false
    })
  }
}

const getLastVacation = (v)=>{
  store.vacationId = v.id
  store.lastVacation((data)=>{
    let index = store.vacations62.findIndex(a=>a.id === v.id)
    if(index === -1) return
    store.vacations62[index].lastVacation =data.length>0?  data[0] : t('content.no-data')
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
  <div v-for="(item, idx) in store.vacations62" :key="idx"
       class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line p-2 rounded-md bg-surface-ground">
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


    <div class="col-span-12 flex justify-between">
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
    <div class="col-span-2">
      <n-form-item
          :show-feedback="false"
          :label="$t(`commandPage.form_62.from`)" path="from">
        <n-date-picker
            class="w-full"
            v-model:value="item.from"
            type="date"
            :placeholder="$t(`content.choose`)"
        />
      </n-form-item>
    </div>
    <div class="col-span-2">
      <n-form-item
          :show-feedback="false"
          :label="$t(`commandPage.form_62.to`)" path="to">
        <n-date-picker
            class="w-full"
            v-model:value="item.to"
            type="date"
            :placeholder="$t(`content.choose`)"
        />
      </n-form-item>
    </div>
    <div class="col-span-5">
      <n-form-item
          :show-feedback="false"
          :label="$t(`commandPage.form_62.reason`)" path="reason">
        <n-input
            class="w-full"
            type="text"
            :placeholder="$t(`content.enterField`)"
            v-model:value="item.reason"
        />
      </n-form-item>
    </div>
    <div class="col-span-3">
      <n-form-item
          :show-feedback="false"
          :label="$t(`commandPage.form_62.orgType`)" path="organizationType">
        <n-select
            v-model:value="item.organizationType"
            :placeholder="$t(`content.choose`)"
            :options="organizationTypes"
            label-field="name"
            value-field="id"
        />
      </n-form-item>
    </div>

    <template v-if="item.organizationType === 1">
      <div class="col-span-6">
        <n-form-item
            :show-feedback="false"
            :label="$t(`commandPage.form_62.to_organization`)" path="to_organization">
          <UIStructure
              :modelV="item.work_place_id"
              @updateModel="onChangeStructure($event, item.id)"
              :checkedVal="item.orgCheck"
              @updateCheck="(v)=>item.orgCheck=v"
              :multiple="false"
          />
        </n-form-item>
      </div>
      <div class="col-span-6">
        <n-form-item
            :show-feedback="false"
            :label="$t(`commandPage.form_62.department_id`)" path="department_id">
          <UISelect
              :options="item.departmentList"
              :modelV="item.department_id"
              @updateModel="(v)=>item.department_id=v"
              :checkedVal="item.depCheck"
              @updateCheck="(v)=>item.depCheck=v"
              :multiple="false"
              :loading="item.loading"
          />
        </n-form-item>
      </div>
    </template>
    <template v-else>
      <div class="col-span-12">
        <n-form-item
            :show-feedback="false"
            :label="$t(`commandPage.form_62.to_organization`)" path="to_organization">
          <n-input
              class="w-full"
              type="text"
              :placeholder="$t(`content.enterField`)"
              v-model:value="item.to_organization"
          />
        </n-form-item>
      </div>
    </template>



  </div>
</template>
