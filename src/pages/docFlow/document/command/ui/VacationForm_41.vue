<script setup>
import {useCommandStore, useComponentStore} from "@/store/modules/index.js"
import {DismissCircle20Filled, Calculator24Regular, PersonNote20Regular, DismissCircle16Regular} from "@vicons/fluent"
import Utils from "../../../../../utils/Utils.js"
import i18n from "@/i18n/index.js"

const store = useCommandStore()
const componentStore = useComponentStore()
const {t} = i18n.global



const onChange = (id, idx)=>{
  if(store.vacations[idx].additional){
    const v = componentStore.vacationAdditional.filter((v)=>v.id === store.vacations[idx].additional)[0]
    store.vacations[idx].addList.push({
      ...v,
      day:0,
    })
  }
}
const onRemove = (id, idx)=>{
  store.vacations[idx].addList = store.vacations[idx].addList.filter((x)=>x.id !== id)
}
const onRemoveWorker = (id)=>{
  store.vacations =  store.vacations.filter((v)=>v.id !== id)
  store.payload.workers = store.payload.workers.filter((workerId)=>workerId !== id)
}
const onCalculate = (idx)=>{
  const details = store.vacations[idx]
  if(details.main_day && details.second_day && details.from){
    const data = {
      id:details.id,
      from:Utils.timeToZone(details.from),
      main_day:details.main_day,
      second_day:details.second_day,
      additional:details.addList.map((v)=>({
        id:v.id,
        value:v.day
      })),
    }
    store._calculateVacation(data, idx)
  }else{
    $Toast.warning(t('documentPage.command.form.isNotValid'))
  }

}
const onSubmit = (mainData)=>{
  const checkForm = store.vacations.every((v)=>v.result !== null)
  if(checkForm){
    const data = store.vacations.map(v=>({
      id:v.id,
      period_from:Utils.timeToZone(v.result?.period_from),
      period_to:Utils.timeToZone(v.result?.period_to),
      from:Utils.timeToZone(v.from),
      to:Utils.timeToZone(v.result?.to),
      all_day:v.result?.all_day,
      main_day:v.main_day,
      additional:v.addList.map(x=>({
        id:x.id,
        value:x.day,
      })),
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



defineExpose({
  onSubmit
})


onMounted(()=>{
  componentStore._enums()
})


</script>

<template>
  <div v-for="(item, idx) in store.vacations" :key="idx"
       class="grid grid-cols-12 mb-8 gap-x-4 border border-gray-300 border-dashed p-2 rounded-md bg-gray-200">
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
            :label="$t(`documentPage.command.form.from`)" path="from">
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
            :label="$t(`documentPage.command.form.main_day`)" path="main_day">
          <n-input
              class="w-full"
              type="text"
              :placeholder="$t(`content.enterField`)"
              v-model:value="item.main_day"
          />
        </n-form-item>
      </div>
      <div class="col-span-2">
        <n-form-item
            :show-feedback="false"
            :label="$t(`documentPage.command.form.second_day`)" path="second_day">
          <n-input
              class="w-full"
              type="text"
              :placeholder="$t(`content.enterField`)"
              v-model:value="item.second_day"
          />
        </n-form-item>
      </div>
      <div class="col-span-6">
        <n-form-item
            :show-feedback="false"
            :label="$t(`documentPage.command.form.additionals`)" path="additional">
          <n-select
              v-model:value="item.additional"
              filterable
              :placeholder="$t(`content.choose`)"
              :options="componentStore.vacationAdditional"
              label-field="name"
              value-field="id"
              :loading="componentStore.enumLoading"
              @update:value="onChange(item.id, idx)"
          />
        </n-form-item>
      </div>
      <div class="col-span-12">
        <template v-for="(subItem,index) in item.addList" :key="index">
          <div class="flex justify-between items-center w-full bg-white border border-surface-line mb-2 px-2 py-1 rounded-md">
            <span class="text-xs font-semibold">{{subItem.name}}</span>
            <span class="w-[150px] flex gap-4">
           <n-input-number v-model:value="subItem.day"></n-input-number>
            <n-button
                @click="onRemove(subItem.id,idx )"
                circle type="error" secondary>
              <template #icon>
                <DismissCircle20Filled/>
              </template>
            </n-button>
        </span>
          </div>
        </template>
      </div>
      <div class="col-span-2 flex justify-center pt-11">
        <n-button
            :loading="store.calculateLoading"
            @click="onCalculate(idx)"
            type="success"
            secondary
        >
          <template #icon>
            <Calculator24Regular/>
          </template>
          {{$t('documentPage.command.form.calculateVacation')}}</n-button>
      </div>
      <div class="col-span-10 flex items-end">
        <template v-if="item.result">
          <div class="grid mt-2 grid-cols-12 gap-x-4 w-full border border-dashed border-surface-400 bg-surface-300 rounded-md p-2">
            <div class="col-span-3">
              <n-form-item
                  :show-feedback="false"
                  :label="$t(`documentPage.command.form.to`)"
                  path="to">
                <n-date-picker
                    class="w-full"
                    v-model:value="item.result.to"
                    type="date"
                    :placeholder="$t(`content.choose`)"
                />
              </n-form-item>
            </div>
            <div  class="col-span-3">
              <n-form-item
                  :show-feedback="false"
                  :label="$t(`documentPage.command.form.work_day`)" path="work_day">
                <n-date-picker
                    class="w-full"
                    v-model:value="item.result.work_day"
                    type="date"
                    :placeholder="$t(`content.choose`)"
                />
              </n-form-item>
            </div>
            <div  class="col-span-2">
              <n-form-item
                  :show-feedback="false"
                  :label="$t(`documentPage.command.form.period_from`)" path="period_from">
                <n-date-picker
                    class="w-full"
                    v-model:value="item.result.period_from"
                    type="date"
                    :placeholder="$t(`content.choose`)"
                />
              </n-form-item>
            </div>
            <div  class="col-span-2">
              <n-form-item
                  :show-feedback="false"
                  :label="$t(`documentPage.command.form.period_to`)" path="period_to">
                <n-date-picker
                    class="w-full"
                    v-model:value="item.result.period_to"
                    type="date"
                    :placeholder="$t(`content.choose`)"
                />
              </n-form-item>
            </div>
            <div class="col-span-2">
              <n-form-item
                  :show-feedback="false"
                  :label="$t(`documentPage.command.form.all_day`)" path="all_day">
                <n-input
                    class="w-full"
                    type="text"
                    :placeholder="$t(`content.enterField`)"
                    v-model:value="item.result.all_day"
                />
              </n-form-item>
            </div>
          </div>
        </template>
        <template v-else>
          <span class="w-full text-center block text-xs font-medium text-danger mt-4">{{$t('documentPage.command.form.no-calculate')}}</span>
        </template>
      </div>
  </div>
</template>
