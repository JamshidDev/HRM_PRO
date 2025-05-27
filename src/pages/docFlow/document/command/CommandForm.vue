<script setup>
import {DocumentBulletList20Filled} from "@vicons/fluent"
import validationRules from "@/utils/validationRules.js"
import {useCommandStore, useComponentStore} from "@/store/modules/index.js"
import {NAvatar} from "naive-ui"
import Utils from "@/utils/Utils.js"
import VacationForm_41 from "@/pages/docFlow/document/command/ui/VacationForm_41.vue"
import {UISelect} from "@/components/index.js"
import EmptyForm from "@/pages/docFlow/document/command/ui/EmptyForm.vue"
import CancelForm_32 from "@/pages/docFlow/document/command/ui/CancelForm_32.vue"
import VacationForm_44 from "@/pages/docFlow/document/command/ui/VacationForm_44.vue"
import VacationForm_43 from "@/pages/docFlow/document/command/ui/VacationForm_43.vue"
import VacationForm_45 from "@/pages/docFlow/document/command/ui/VacationForm_45.vue"
import VacationForm_49 from "@/pages/docFlow/document/command/ui/VacationForm49.vue"
import VacationForm_48 from "@/pages/docFlow/document/command/ui/VacationForm_48.vue"
import VacationForm_55 from "@/pages/docFlow/document/command/ui/VacationForm_55.vue"
import VacationForm_62 from "@/pages/docFlow/document/command/ui/VacationForm_62.vue"
import CommandFrom_51 from "./ui/CommandForm_51.vue"
import CommandForm_71 from "./ui/CommandForm_71.vue"
import CommandForm_72 from "./ui/CommandForm_72.vue"
import CommandForm_73 from "./ui/CommandForm_73.vue"
import {useAppSetting} from "@/utils/index.js"



const store = useCommandStore()
const componentStore = useComponentStore()


// command ids of only single select
const commandIdList = [32,33,34,35,36,37,38,39]
const singleSelectCommands = [32,33,34,35,36,37,38,39, 44,43,45,49,48,51,52,53,54]

const formRef = ref(null)
const confirmationList = ref([])

const cancelForm_32 = ref(null)
const vacationForm_41 = ref(null)
const vacationForm_43 = ref(null)
const vacationForm_44 = ref(null)
const vacationForm_45 = ref(null)
const vacationForm_48 = ref(null)
const vacationForm_49 = ref(null)
const vacationForm_55 = ref(null)
const vacationForm_62 = ref(null)
const vacationForm_51 = ref(null)
const vacationForm_71 = ref(null)
const vacationForm_72 = ref(null)
const vacationForm_73 = ref(null)

const onFocusConf = ()=>{
  componentStore._confirmations()
}
const renderLabel = (option)=>{
  return [
    h(
        'div',
        {
          class:'flex gap-2 my-1 items-center px-2'
        },[
          h(NAvatar,
              {
                class:'',
                src:option.photo,
                'fallback-src':Utils.noAvailableImage,
              },),
          h('div',{ class:'flex flex-col'}, [
            h('div',{ class:'text-xs font-medium text-gray-500 leading-[1.2]'},`${option.last_name}.${option.last_name[0]}.${option.middle_name[0]}`),
            h('div',{ class:'text-xs text-primary leading-[1.2]'},option.position),
          ])
        ]
    ),
  ];
}
const renderValue = ({option})=>{
  return [
    h(
        'div',
        {
          class:'flex gap-2 my-1 items-center'
        },`${option?.last_name} ${option?.first_name} ${option?.middle_name}`),
  ];
}
const workerRenderLabel = (option)=>{
  return [
    h('div',{ class:'flex flex-col pt-2'}, [
      h('div',{ class:'text-xs font-medium text-gray-500'},option.name),
      h('div',{ class:'text-xs text-primary'},option.position),
    ])
  ];
}
const workerRenderValue = ({option})=>{
  return [
    h('div',{ class:'flex flex-col'}, [
      h('div',{ class:'text-sm font-medium text-gray-500'},option.name),
    ])
  ];
}
const onChangeWorkers = ()=>{
  generationVacation55()
  generationVacation()
  generationVacation62()
  generationData()
}

const onChangeWorker = ()=>{}

const onSubmit = (status)=>{
  formRef.value?.validate( async (error)=>{
    validationComponent()
    if(!error){
      const mainData = {
        command_date:Utils.timeToZone(store.payload.command_date),
        director_id:store.payload.director_id,
        organization_id:store.payload.organization_id?.[0]?.id,
        confirmations:store.payload.confirmations,
        command_number:store.payload.command_number,
        command_type:store.payload.command_type,
        workers:store.payload.worker? [store.payload.worker] : store.payload.workers,
        worker_position_id:store.payload.worker || undefined,
      }
      let validate = null



      if(commandIdList.includes(store.payload.command_type)){
        validate =await cancelForm_32.value?.onSubmit(mainData)
      }
      else if(store.payload.command_type === 41){
        validate = vacationForm_41.value?.onSubmit(mainData)
      }
      else if(store.payload.command_type === 44){
        validate =await vacationForm_44.value?.onSubmit(mainData)
      }
      else if(store.payload.command_type === 43){
        validate =await vacationForm_43.value?.onSubmit(mainData)
      }
      else if(store.payload.command_type === 45){
        validate =await vacationForm_45.value?.onSubmit(mainData)
      }
      else if(store.payload.command_type === 49){
        validate =await vacationForm_49.value?.onSubmit(mainData)
      }
      else if(store.payload.command_type === 48){
        validate =await vacationForm_48.value?.onSubmit(mainData)
      }
      else if(store.payload.command_type === 55){
        validate =await vacationForm_55.value?.onSubmit(mainData)
      }
      else if(store.payload.command_type === 62 || store.payload.command_type === 61){
        validate =await vacationForm_62.value?.onSubmit(mainData)
      }
      else if([51,52,53,54].includes(store.payload.command_type)){
        validate =await vacationForm_51.value?.onSubmit(mainData)
      }
      else if(store.payload.command_type === 71){
        validate =await vacationForm_71.value?.onSubmit(mainData)
      }else if(store.payload.command_type === 72){
        validate =await vacationForm_72.value?.onSubmit(mainData)
      }else if(store.payload.command_type === 73){
        validate =await vacationForm_73.value?.onSubmit(mainData)
      }


      if(validate?.isValid){

        if(store.visibleType){
          if(status){
            store._viewCommand(validate?.data)
          }else{
            store.saveLoading = true
            store._create(validate?.data)
          }
        }else{
          store._update()
        }
      }
    }
  })
}
const validationComponent = ()=>{
  if(store.payload.command_type === 44){
    vacationForm_44.value?.validateForm()
  }
  else if(store.payload.command_type === 43){
    vacationForm_43.value?.validateForm()
  }
  else if(store.payload.command_type === 45){
    vacationForm_45.value?.validateForm()
  }
  else if(store.payload.command_type === 48){
    vacationForm_48.value?.validateForm()
  }
  else if(store.payload.command_type === 49){
    vacationForm_49.value?.validateForm()
  }
}


const onChangeStructure = (v)=>{
  store.payload.organization_id=v
  if(v.length>0){
    componentStore.workerList = []
    store.workers = []
    store.payload.worker = null
    store.payload.workers = []
    fillVacation()
    fillVacation55()
    fillVacation62()
    generationData(true)

    componentStore.workerParams.organization_id= v[0].id
    componentStore._workers()
  }
}
const onChangeCommandType = ()=>{


  const commandId = store.payload.command_type
  if(commandIdList.includes(commandId)){
    if(store.payload.workers.length>0){
      const val = componentStore.workerList.filter(v=>v.id === store.payload.workers[0])[0]
      store.payload.worker = val?.id
      store.payload.workers = []
    }
  }
  else{
    if(store.payload.worker){
      store.payload.workers = [store.payload.worker]
      store.payload.worker = null
    }
  }

  if(store.payload.command_type === 41) {
    fillVacation()
  }
  else if(store.payload.command_type === 55){
    fillVacation55()
  }
  else if(store.payload.command_type === 62){
    fillVacation62()
  }
  else if([71,72,73].includes(store.payload.command_type)){
    generationData(true)
  }


  if([44, 43, 48].includes(store.payload.command_type)){
    componentStore.reasonTypes = []
    componentStore._reasonTypes(store.payload.command_type)
  }
}

const isSingleSelect = computed(()=>{
  return singleSelectCommands.includes(store.payload.command_type)
})

// vacation 41
const generationVacation = ()=>{
  const oldValues = store.vacations.map((v)=>v.id)
  const id = store.payload.workers[store.payload.workers?.length-1]
  const worker = componentStore.workerList.filter(x=>x.id === id)[0]
  if(!oldValues.includes(id) &&  store.payload.workers.length > store.vacations.length){
    store.vacations.push({
      worker,
      id,
      from:null,
      main_day:'21',
      second_day:'0',
      additional:null,
      addList:[],
      result:null,
      lastVacation:null,
    })
  }
  else if(store.payload.workers.length < store.vacations.length){
    store.vacations = store.vacations.filter((a)=>store.payload.workers.includes(a.id))
  }
}
const fillVacation = ()=>{
  store.vacations = []
  store.vacations = store.payload.workers.map((id)=>{
    const worker = componentStore.workerList.filter(v=>v.id === id)[0]
    return {
      worker,
      id,
      from:null,
      main_day:'21',
      second_day:'0',
      additional:null,
      addList:[],
      result:null,
      lastVacation:null
    }
  })
}

// vacation 55
const generationVacation55 = ()=>{
  const oldValues = store.vacations55.map((v)=>v.id)
  const id = store.payload.workers[store.payload.workers?.length-1]
  const worker = componentStore.workerList.filter(x=>x.id === id)[0]
  if(!oldValues.includes(id) &&  store.payload.workers.length > store.vacations55.length){
    store.vacations55.push({
      worker,
      id,
      from:null,
      to:null,
      from_time:null,
      to_time:null,
      lastVacation:null
    })
  }
  else if(store.payload.workers.length < store.vacations55.length){
    store.vacations55 = store.vacations55.filter((a)=>store.payload.workers.includes(a.id))
  }
}
const fillVacation55 = ()=>{
  store.vacations55 = []
  store.vacations55 = store.payload.workers.map((id)=>{
    const worker = componentStore.workerList.filter(v=>v.id === id)[0]
    return {
      worker,
      id,
      from:null,
      to:null,
      from_time:null,
      to_time:null,
      lastVacation:null
    }
  })
}

const generationVacation62 = ()=>{
  const oldValues = store.vacations62.map((v)=>v.id)
  const id = store.payload.workers[store.payload.workers?.length-1]
  const worker = componentStore.workerList.filter(x=>x.id === id)[0]
  if(!oldValues.includes(id) &&  store.payload.workers.length > store.vacations62.length){
    store.vacations62.push({
      worker,
      id,
      from:null,
      to:null,
      reason:null,
      department_id:[],
      work_place_id:[],
      orgCheck:[],
      depCheck:[],
      to_organization:null,
      organizationType:1,
      departmentList:[],
      loading:false,
      lastVacation:null
    })
  }
  else if(store.payload.workers.length < store.vacations62.length){
    store.vacations62 = store.vacations62.filter((a)=>store.payload.workers.includes(a.id))
  }
}

const fillVacation62 = ()=>{
  store.vacations62 = []
  store.vacations62 = store.payload.workers.map((id)=>{
    const worker = componentStore.workerList.filter(v=>v.id === id)[0]
    return {
      worker,
      id,
      from:null,
      to:null,
      reason:null,
      department_id:[],
      work_place_id:[],
      orgCheck:[],
      depCheck:[],
      to_organization:null,
      organizationType:1,
      departmentList:[],
      loading:false,
      lastVacation:null
    }
  })
}

const generationData = (isFill=false)=>{

  if(!store.payload.command_type) return
  const typeId = store.payload.command_type

  const objectSchema = {
    '71':{
      by_whom:null,
      reason:null,
      gift:null,
      gift_type:null,
    },
    '72':{
      reason:null,
      fine:null,
      fine_type:null,
    },
    '73':{
      reason:null,
      type:null,
      amount:null,
    },
  }


  if(isFill){

    store.workerData = []
    store.workerData = store.payload.workers.map((id)=>{
      const worker = componentStore.workerList.filter(v=>v.id === id)[0]
      return {
        worker,
        id,
        ...(objectSchema[typeId] || {})
      }
    })

  }else{

    const oldValues = store.workerData.map((v)=>v.id)
    const id = store.payload.workers[store.payload.workers?.length-1]
    const worker = componentStore.workerList.filter(x=>x.id === id)[0]

    if(!oldValues.includes(id) &&  store.payload.workers.length > store.workerData.length){
      store.workerData.push({
        worker,
        id,
        ...(objectSchema[typeId] || {})
      })
    }
    else if(store.payload.workers.length < store.workerData.length){
      store.workerData = store.workerData.filter((a)=>store.payload.workers.includes(a.id))
    }
  }






}




watchEffect(()=>{
  if(store.payload.director_id){
    store.payload.confirmations = store.payload.confirmations.filter(v=>v !==store.payload.director_id)
    confirmationList.value = componentStore.confirmationList.filter(v=>v.id !==store.payload.director_id)
  }
})



onMounted(()=>{
  componentStore._commandTypes()
  store.resetForm()
  componentStore._structures()
})
</script>

<template>
  <div style="height:calc(100vh - 120px)" class="overflow-y-auto overflow-x-hidden ">
    <n-form
        ref="formRef"
        :model="store.payload"
        :rules="validationRules.commandFrom"
        class="grid grid-cols-12 gap-x-4"
    >

<!--      Command header-->
      <div class="col-span-12">
        <div class="grid grid-cols-12 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground">
          <div class="col-span-12  md:col-span-6 lg:col-span-2">
            <n-form-item :label="$t(`documentPage.command.form.command_number`)" path="command_number">
              <n-input
                  class="w-full"
                  type="text"

                  v-model:value="store.payload.command_number"
              />
            </n-form-item>

          </div>
          <div class="col-span-12  md:col-span-6 lg:col-span-2">
            <n-form-item :label="$t(`documentPage.command.form.command_date`)" path="command_date">
              <n-date-picker
                  class="w-full"
                  v-model:value="store.payload.command_date"
                  type="date"

                  :format="useAppSetting.datePicketFormat"
              />
            </n-form-item>
          </div>
          <div class="col-span-12 lg:col-span-8">
            <n-form-item :label="$t(`documentPage.command.form.type`)" path="command_type">
              <n-select
                  v-model:value="store.payload.command_type"
                  filterable
                  :options="componentStore.commandTypeList"
                  label-field="name"
                  value-field="id"
                  :loading="componentStore.commandTypeLoading"
                  @update:value="onChangeCommandType"
              />
            </n-form-item>
          </div>

        </div>
      </div>


      <div class="col-span-12">
        <div class="grid grid-cols-12 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground mt-6">
          <div class="col-span-12 md:col-span-6 flex">
            <n-form-item class="w-full" :label="$t(`documentPage.form.organization`)" path="organization_id">
              <UISelect
                  :options="componentStore.structureList"
                  :modelV="store.payload.organization_id"
                  @updateModel="onChangeStructure"
                  :checkedVal="store.structureCheck"
                  @updateCheck="(v)=>store.structureCheck=v"
                  v-model:search="componentStore.structureParams.search"
                  @onSearch="componentStore._structures"
                  :loading="componentStore.structureLoading"
                  :multiple="false"
                  :auto-select="true"
              />
            </n-form-item>
          </div>
          <div class="col-span-12 md:col-span-6 flex">
            <template v-if="isSingleSelect">
              <n-form-item class="w-full" :label="$t(`documentPage.form.worker`)" path="worker">
                <n-select
                    :disabled="store.payload.organization_id.length === 0"
                    v-model:value="store.payload.worker"
                    filterable
                    :placeholder="$t('content.searchWorker')"
                    :options="componentStore.workerList"
                    label-field="name"
                    value-field="id"
                    :render-label="workerRenderLabel"
                    :render-tag="workerRenderValue"
                    @update:value="onChangeWorker"
                    :loading="componentStore.workerLoading"
                    @scroll="componentStore.onScrollWorker"
                    @search="componentStore.onSearchWorker"
                />
              </n-form-item>
            </template>
            <template v-else>
              <n-form-item class="w-full" :label="$t(`documentPage.form.worker`)" path="workers">
                <n-select
                    :disabled="store.payload.organization_id.length === 0"
                    multiple
                    v-model:value="store.payload.workers"
                    filterable
                    :placeholder="$t('content.searchWorker')"
                    :options="componentStore.workerList"
                    label-field="name"
                    value-field="id"
                    :render-label="workerRenderLabel"
                    :render-tag="workerRenderValue"
                    @update:value="onChangeWorkers"
                    :loading="componentStore.workerLoading"
                    @scroll="componentStore.onScrollWorker"
                    :filter="()=>true"
                    @search="componentStore.onSearchWorker"
                    :reset-menu-on-options-change="false"
                />
              </n-form-item>
            </template>

          </div>
        </div>
      </div>


      <div class="col-span-12 mt-4">

        <template v-if="store.payload.command_type === 41">
          <VacationForm_41 ref="vacationForm_41"/>
        </template>
        <template v-else-if="commandIdList.includes(store.payload.command_type )">
          <CancelForm_32 ref="cancelForm_32" />
        </template>
        <template v-else-if="store.payload.command_type === 44">
          <VacationForm_44 ref="vacationForm_44" />
        </template>
        <template v-else-if="store.payload.command_type === 43">
          <VacationForm_43 ref="vacationForm_43" />
        </template>
        <template v-else-if="store.payload.command_type === 45">
          <VacationForm_45 ref="vacationForm_45" />
        </template>
        <template v-else-if="store.payload.command_type === 48">
          <VacationForm_48 ref="vacationForm_48" />
        </template>
        <template v-else-if="store.payload.command_type === 49">
          <VacationForm_49 ref="vacationForm_49" />
        </template>
        <template v-else-if="store.payload.command_type === 55">
          <VacationForm_55 ref="vacationForm_55" />
        </template>
        <template v-else-if="store.payload.command_type === 62 || store.payload.command_type === 61">
          <VacationForm_62 ref="vacationForm_62" />
        </template>

        <template v-else-if="[51,52,53,54].includes(store.payload.command_type)">
          <CommandFrom_51 ref="vacationForm_51" />
        </template>
        <template v-else-if="store.payload.command_type === 71">
          <CommandForm_71 ref="vacationForm_71" />
        </template>
        <template v-else-if="store.payload.command_type === 72">
          <CommandForm_72 ref="vacationForm_72" />
        </template>
        <template v-else-if="store.payload.command_type === 73">
          <CommandForm_73 ref="vacationForm_73" />
        </template>

        <template v-else>
          <EmptyForm/>
        </template>

      </div>


      <div class="col-span-12 mt-6 mb-6">
        <div class="grid grid-cols-12 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground">
          <div class="col-span-12 mt-4">
            <n-form-item :label="$t(`documentPage.command.form.director_id`)" path="director_id">
              <n-select
                  @focus="onFocusConf"
                  value-field="id"
                  label-field="last_name"
                  v-model:value="store.payload.director_id"

                  :options="componentStore.confirmationList"
                  :loading="componentStore.confirmationLoading"
                  :render-label="renderLabel"
                  :render-tag="renderValue"
              />
            </n-form-item>
          </div>
          <div class="col-span-12 mt-4">
            <n-form-item :label="$t(`documentPage.command.form.confirm`)" path="confirmations">
              <n-select
                  :disabled="!store.payload.director_id"
                  value-field="id"
                  multiple
                  v-model:value="store.payload.confirmations"

                  :options="confirmationList"
                  :loading="componentStore.confirmationLoading"
                  :render-label="renderLabel"
              />
            </n-form-item>
          </div>
        </div>
      </div>
    </n-form>
  </div>
  <div class="grid grid-cols-12 gap-2">
    <n-button
        @click="onSubmit(true)"
        :loading="store.viewLoading"
        class="col-span-3"
        ghost>
      {{$t('content.view')}}
      <template #icon>
        <DocumentBulletList20Filled/>
      </template>
    </n-button>
    <div class="col-span-3">

    </div>
    <n-button
        class="col-span-3"
        @click="store.openVisible(false)" type="error" ghost>
      {{$t('content.cancel')}}
    </n-button>
    <n-button
        class="col-span-3"
        @click="onSubmit(false)"
        :loading="store.saveLoading"
        type="primary">
      {{$t('content.save')}}
    </n-button>
  </div>
</template>

<style>

</style>