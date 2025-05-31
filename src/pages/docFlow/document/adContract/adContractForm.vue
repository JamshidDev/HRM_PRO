<script setup>
import {UISelect} from "@/components/index.js"
import UIHelper from "@/utils/UIHelper.js"
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useAdContractStore, useComponentStore} from "@/store/modules/index.js";
import { NAvatar } from "naive-ui"
import Utils from "@/utils/Utils.js"
import UIDepartment from "@/components/ui/UIDepartment.vue"
import {useAppSetting} from "@/utils/index.js"

const store = useAdContractStore()
const componentStore = useComponentStore()

const showCheckBox = ref(false)
const confirmationList = ref([])

const props = defineProps({
  callBack:{
    type: Function,
    default:null,
  },
  workers:{
    type:Array,
    default:[]
  },
  organization:{
    type:Array,
    default:[]
  }
})

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store.saveLoading = true
      if(store.visibleType){
        store._create(props.callBack)
      }else{
        store._update()
      }

    }
  })
}
const onChangeDepartment = (v)=>{
  store.payload.department_id = v
  componentStore.departmentPositionList = []
  store.payload.department_position_id = null
  componentStore._departmentPosition(v[0].id)
}
const onChangeStatus = (v)=>{
  if(v){
    componentStore._positions()
  }
}
const onChangeStructure = (v)=>{
  store.payload.organization_id=v
  if(v.length>0){
    componentStore.departmentList = []
    store.payload.department_id = []
    componentStore.depParams.organizations =v[0].id
    componentStore._departmentTree()
  }
}

const onChangeOrganization = (v)=>{
  store.organization=v
  if(v.length>0){
    componentStore.workerList = []
    store.workers = []
    componentStore.workerParams.organization_id= v[0].id
    componentStore._workers()
  }
}
const onFocusConf = ()=>{
  componentStore._confirmations()
}
const renderLabel = (option)=>{
  return [
    h(
        'div',
        {
          class:'flex gap-2 my-1 items-center'
        },[
          h(NAvatar,
              {
                class:'',
                src:option.photo,
                'fallback-src':Utils.noAvailableImage,
              },),
          h('div',{ class:'flex flex-col'}, [
            h('div',{ class:'text-xs font-medium text-gray-500'},`${option.last_name}.${option.last_name[0]}.${option.middle_name[0]}`),
            h('div',{ class:'text-xs text-gray-400'},option.position),
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
    h('div',{ class:'flex flex-col'}, [
      h('div',{ class:'text-xs font-medium text-gray-500'},option.name),
      h('div',{ class:'text-xs text-gray-400'},option.position),
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
const onChangeWorker = ()=>{
  const worker = componentStore.workerList.filter((v)=>v.id === store.payload.worker_position_id)[0]
  const typeId = worker.typeId
  store.payload.type = null
  componentStore._adContractType(typeId)
  showCheckBox.value = [2, 4, 5].includes(typeId)
  store.payload.group = worker.group
  store.payload.rank = worker.rank
  store.payload.salary = worker?.salary?.toString()
}

watchEffect(()=>{
  if(store.payload.type){
    store.payload.command_type = null
    const data = {
      status:'contract-additional',
      type:store.payload.type
    }
    componentStore._commandTypes(data)
  }
})

watchEffect(()=>{
  if(store.payload.director_id){
    store.payload.confirmations = store.payload.confirmations.filter(v=>v !==store.payload.director_id)
    confirmationList.value = componentStore.confirmationList.filter(v=>v.id !==store.payload.director_id)
  }

  if(store.payload.type === 8){
    componentStore._structures()
  }
})



onMounted(()=>{
  if(componentStore.groupList.length===0){
    componentStore._enums()
  }
  if(componentStore.scheduleList.length === 0){
    componentStore._scheduleList()
  }

 if( props.workers.length === 0){
   // componentStore._workers()
 }else{
   store.resetForm()
   componentStore.workerList = props.workers
   store.payload.worker_position_id = componentStore.workerList[0].id
   store.organization = props.organization
   componentStore._adContractType(componentStore.workerList[0].contractTypeId)
 }
  componentStore._structures()

})

const showPositionDate = computed(()=>{
  const show = [8].includes(store.payload.type)
  if(!show){
    store.payload.position_date = null
  }
  return show

})

const showForm = computed(()=>store.payload.type===null? true : [1,8].includes(store.payload.type))


</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.adContractFrom"
      :model="store.payload"
  >
    <div style="height:calc(100vh - 120px)" class="overflow-y-auto overflow-x-hidden pb-12">
      <div class="grid grid-cols-12 gap-x-4">
        <div class="col-span-12">
          <div class="grid grid-cols-12 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground mt-6 mb-4">
            <div class="col-span-12 md:col-span-6 flex">
              <n-form-item class="w-full" :label="$t(`documentPage.form.organization`)" path="organization_id">
                <UISelect
                    :options="componentStore.structureList"
                    :modelV="store.organization"
                    @updateModel="onChangeOrganization"
                    :checkedVal="store.structureCheck2"
                    @updateCheck="(v)=>store.structureCheck2=v"
                    v-model:search="componentStore.structureParams.search"
                    @onSearch="componentStore._structures"
                    :loading="componentStore.structureLoading"
                    :multiple="false"
                />
              </n-form-item>
            </div>
            <div class="col-span-12 md:col-span-6 flex">
              <n-form-item class="w-full" :label="$t(`documentPage.form.worker`)" path="worker">
                <n-select
                    :disabled="store.organization.length === 0 || workers.length>0"
                    v-model:value="store.payload.worker_position_id"
                    filterable
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
            </div>
          </div>
        </div>

        <div class="col-span-12 border border-dashed p-2 rounded-xl border-surface-line bg-surface-ground">
          <div class="grid grid-cols-12 gap-x-4">
            <div class="col-span-12 md:col-span-6 lg:col-span-2">
              <n-form-item :label="$t(`documentPage.form.contractNumber`)" path="number">
                <n-input
                    class="w-full"
                    type="text"
                    v-model:value="store.payload.number"
                />
              </n-form-item>
            </div>
            <div class="col-span-12 md:col-span-6 lg:col-span-6">
              <n-form-item :label="$t(`documentPage.form.type`)" path="type">
                <n-select
                    v-model:value="store.payload.type"
                    filterable
                    :options="componentStore.adContractTypes"
                    label-field="name"
                    value-field="id"
                    :loading="componentStore.adContractTypeLoading"
                />
              </n-form-item>
            </div>
            <div class="col-span-12 md:col-span-6 lg:col-span-4">
              <n-form-item :label="$t(`documentPage.form.contractDate`)" path="contract_date">
                <n-date-picker
                    class="w-full"
                    v-model:value="store.payload.contract_date"
                    type="date"

                    :format="useAppSetting.datePicketFormat"
                />
              </n-form-item>
            </div>
          </div>
        </div>

        <div
            class="col-span-12 border border-dashed p-2 rounded-xl border-surface-line bg-surface-ground mt-4">
          <div class="grid grid-cols-12 gap-x-4">

            <template v-if="showForm">
              <template  v-if="store.payload.type === 8">
                <div class="col-span-12">
                  <n-form-item :label="$t(`documentPage.form.organization`)" path="organization_id">
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
                    />

                  </n-form-item>
                </div>
                <div v-if="showCheckBox" class="col-span-12 flex justify-end">
                  <n-checkbox v-model:checked="store.payload.position_status" @update:checked="onChangeStatus">
                    <span class="text-xs text-gray-500">{{$t(`documentPage.form.positionStatus`)}}</span>
                  </n-checkbox>
                </div>
                <template v-if="store.payload.position_status && showCheckBox">
                  <div class="col-span-12 md:col-span-6 lg:col-span-4">
                    <n-form-item :label="$t(`documentPage.form.position`)" path="position_id">
                      <n-select
                          v-model:value="store.payload.position_id"
                          filterable

                          :options="componentStore.positionList"
                          label-field="name"
                          value-field="id"
                          :loading="componentStore.positionLoading"
                      />
                    </n-form-item>
                  </div>
                </template>
                <template v-else>
                  <div class="col-span-12 md:col-span-6 lg:col-span-6">
                    <n-form-item :label="$t(`documentPage.form.department`)" path="department_id">
                      <UIDepartment
                          :modelV="store.payload.department_id"
                          @updateModel="onChangeDepartment"
                          :checkedVal="store.departmentCheck"
                          @updateCheck="(v)=>store.departmentCheck=v"
                          :multiple="false"
                      />
                    </n-form-item>
                  </div>
                  <div class="col-span-6">
                    <n-form-item :label="$t(`documentPage.form.position`)" path="department_position_id">
                      <n-select
                          :disabled="!Boolean(store.payload.department_id)"
                          v-model:value="store.payload.department_position_id"
                          filterable

                          :options="componentStore.departmentPositionList"
                          label-field="name"
                          value-field="id"
                          :loading="componentStore.departmentPositionLoading"
                      />
                    </n-form-item>
                  </div>
                </template>
              </template>
              <div class="col-span-12 md:col-span-6 lg:col-span-4">
                <n-form-item :label="$t(`documentPage.form.group`)" path="group">
                  <n-select
                      v-model:value="store.payload.group"
                      filterable

                      :options="componentStore.groupList"
                      label-field="name"
                      value-field="id"
                      :loading="componentStore.enumLoading"
                      clearable
                  />
                </n-form-item>
              </div>
              <div class="col-span-12 md:col-span-6 lg:col-span-4">
                <n-form-item :label="$t(`documentPage.form.rank`)" path="rank">
                  <n-select
                      v-model:value="store.payload.rank"
                      filterable

                      :options="componentStore.rankList"
                      label-field="name"
                      value-field="id"
                      :loading="componentStore.enumLoading"
                      clearable
                  />
                </n-form-item>
              </div>
              <div class="col-span-12 md:col-span-6 lg:col-span-4">
                <n-form-item :label="$t(`documentPage.form.rate`)" path="rate">
                  <n-input-number
                      :max="1"
                      :min="0.1"
                      :step="0.1"
                      :show-button="false"
                      class="w-full"

                      v-model:value="store.payload.rate"
                  />
                </n-form-item>
              </div>
              <div class="col-span-12 md:col-span-6 lg:col-span-4">
                <n-form-item :label="$t(`documentPage.form.salary`)" path="salary">
                  <n-input
                      class="w-full"
                      type="text"

                      :allow-input="Utils.onlyAllowNumber"
                      v-model:value="store.payload.salary"
                  >
                    <template #suffix>
                      {{$t('content.sum')}}
                    </template>
                  </n-input>
                </n-form-item>
              </div>
              <div class="col-span-12 md:col-span-6 lg:col-span-4">
                <n-form-item :label="$t(`documentPage.form.schedule_id`)" path="schedule_id">
                  <n-select
                      v-model:value="store.payload.schedule_id"
                      filterable

                      :options="componentStore.scheduleList"
                      value-field="id"
                      :loading="componentStore.scheduleLoading"
                      :render-label="UIHelper.scheduleRender.label"
                      :render-tag="UIHelper.scheduleRender.value"
                      clearable
                  />
                </n-form-item>
              </div>
              <div class="col-span-12 md:col-span-6 lg:col-span-4"
                   v-if="showPositionDate"
              >
                <n-form-item :label="$t(`documentPage.form.position_date`)" path="position_date">
                  <n-date-picker
                      class="w-full"
                      v-model:value="store.payload.position_date"
                      type="date"

                      :format="useAppSetting.datePicketFormat"
                  />
                </n-form-item>
              </div>
            </template>
            <div  v-if="[12,13].includes(store.payload.type)" class="col-span-12 md:col-span-6 lg:col-span-4"
            >
              <n-form-item :label="$t(`documentPage.form.contract_to_date`)" path="contract_to_date">
                <n-date-picker
                    class="w-full"
                    v-model:value="store.payload.contract_to_date"
                    type="date"

                    :format="useAppSetting.datePicketFormat"
                />
              </n-form-item>
            </div>
<!--            <template v-if="store.payload.type === 8">-->
<!--              <div class="col-span-12">-->
<!--                <n-form-item :label="$t(`documentPage.form.postName`)" path="post_name">-->
<!--                  <n-input-->
<!--                      class="w-full"-->
<!--                      type="text"-->
<!--                      -->
<!--                      v-model:value="store.payload.post_name"-->
<!--                  />-->
<!--                </n-form-item>-->
<!--              </div>-->
<!--            </template>-->
          </div>
        </div>





        <div class="col-span-12">
          <n-form-item :label="$t(`documentPage.form.director`)" path="director_id">
            <n-select
                @focus="onFocusConf"
                size="large"
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
        <div class="col-span-12 pt-4 flex justify-center gap-2 items-center relative">
          <n-divider dashed title-placement="left" class="w-full mt-1!">
            <div class="flex items-center gap-3">
              <n-switch v-model:value="store.payload.command_status" />
              <span class="text-primary font-medium">{{$t(`documentPage.form.command_status`)}}</span>
            </div>

          </n-divider>
        </div>
        <div v-if="store.payload.command_status" class="col-span-12 border border-dashed p-2 rounded-xl border-surface-line bg-surface-ground mt-4">
          <div class="grid grid-cols-12 gap-x-4">
            <div class="col-span-12 md:col-span-6 lg:col-span-6" >
              <n-form-item :label="$t(`documentPage.form.command_type`)" path="command_type">
                <n-select
                    :disabled="!Boolean(store.payload.type)"
                    v-model:value="store.payload.command_type"
                    filterable

                    :options="componentStore.commandTypeList"
                    label-field="name"
                    value-field="id"
                    :loading="componentStore.commandTypeLoading"
                    clearable
                />
              </n-form-item>
            </div>
            <div class="col-span-12 md:col-span-6 lg:col-span-3">
              <n-form-item :label="$t(`documentPage.command.form.command_number`)" path="command_number">
                <n-input
                    class="w-full"
                    type="text"

                    v-model:value="store.payload.command_number"
                />
              </n-form-item>

            </div>
            <div class="col-span-12 md:col-span-6 lg:col-span-3">
              <n-form-item :label="$t(`documentPage.command.form.command_date`)" path="command_date">
                <n-date-picker
                    class="w-full"
                    v-model:value="store.payload.command_date"
                    type="date"

                    :format="useAppSetting.datePicketFormat"
                />
              </n-form-item>
            </div>
            <div class="col-span-12">
              <n-form-item :label="$t(`documentPage.command.form.confirm`)" path="director_id">
                <n-select
                    :disabled="!store.payload.director_id"
                    size="large"
                    value-field="id"
                    multiple
                    v-model:value="store.payload.confirmations"

                    :options="confirmationList"
                    :loading="componentStore.confirmationLoading"
                    :render-label="renderLabel" />
              </n-form-item>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.openVisible(false)" type="error" ghost>
        {{$t('content.cancel')}}
      </n-button>
      <n-button
          @click="onSubmit"
          :loading="store.saveLoading"
          type="primary">
        {{$t('content.save')}}
      </n-button>
    </div>
  </n-form>
</template>