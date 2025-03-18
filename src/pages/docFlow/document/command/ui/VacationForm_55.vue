<script setup>
import {useCommandStore, useComponentStore} from "@/store/modules/index.js"
import {PersonNote20Regular, DismissCircle16Regular} from "@vicons/fluent"
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
    <div class="col-span-3">
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
    <div class="col-span-3">
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
    <div class="col-span-3">
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
    <div class="col-span-3">
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
