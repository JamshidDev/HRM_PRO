<script setup>
import {UIAutoComplete, UIStructure, UIUpload, UIUser} from "@/components/index.js"
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useAdContractStore, useComponentStore} from "@/store/modules/index.js";
import { NAvatar } from "naive-ui"
import Utils from "@/utils/Utils.js"
import UIDepartment from "@/components/ui/UIDepartment.vue"

const store = useAdContractStore()
const componentStore = useComponentStore()

const props = defineProps({
  callBack:{
    type: Function,
    default:null,
  },
  workers:{
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
const scheduleLabel = (option)=>{
  return [
    h(
        'div',
        {
          class:'w-full',
        },[
          h('div',{ class:'flex flex-col w-full'}, [
            h('div',{ class:'text-xs font-medium text-gray-500'},`${option.name}`),
            h('div',{ class:'text-xs text-gray-400'},`${ option.work_days[0].type.name}`),
            h('div',{ class:'text-xs text-gray-400'},`${option.work_days[0].start_time} - ${option.work_days[0].end_time}`),
          ])
        ]
    ),
  ];
}
const scheduleValue = ({option})=>{
  return h('div', {
        class:'flex',
      }, [
        h('div', {class:'text-sm font-medium'},option.name)
      ]
  )
}
const onChangeWorker = ()=>{
  const typeId = componentStore.workerList.filter((v)=>v.id === store.payload.worker_position_id)[0].typeId
  componentStore._adContractType(1)

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



onMounted(()=>{
  if(componentStore.groupList.length===0){
    componentStore._enums()
  }
  if(componentStore.scheduleList.length === 0){
    componentStore._scheduleList()
  }

 if( props.workers.length === 0){
   componentStore._workers()
 }else{
   componentStore.workerList = props.workers
   store.payload.worker_position_id = componentStore.workerList[0].id
   componentStore._adContractType(1)
 }

})

</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.adContractFrom"
      :model="store.payload"
  >
    <div style="height:calc(100vh - 120px)" class="overflow-y-auto overflow-x-hidden">
      <div class="grid grid-cols-12 gap-x-4">
        <div class="col-span-12 flex justify-center">
          <div class="w-[600px]">
            <n-form-item :label="$t(`documentPage.form.worker`)" path="worker_position_id">
              <n-select
                  :disabled="workers.length>0"
                  v-model:value="store.payload.worker_position_id"
                  filterable
                  :placeholder="$t(`content.choose`)"
                  :options="componentStore.workerList"
                  label-field="name"
                  value-field="id"
                  :render-label="workerRenderLabel"
                  :render-tag="workerRenderValue"
                  @update:value="onChangeWorker"
                  :loading="componentStore.workerLoading"
              />
            </n-form-item>
          </div>
        </div>


        <div class="col-span-12 border border-dashed p-2 rounded-xl border-gray-200 bg-gray-50">
          <div class="grid grid-cols-12 gap-x-4">
            <div class="col-span-2">
              <n-form-item :label="$t(`documentPage.form.contractNumber`)" path="number">
                <n-input
                    class="w-full"
                    type="text"
                    :placeholder="$t(`content.enterField`)"
                    v-model:value="store.payload.number"
                />
              </n-form-item>
            </div>
            <div class="col-span-4">
              <n-form-item :label="$t(`documentPage.form.type`)" path="type">
                <n-select
                    v-model:value="store.payload.type"
                    filterable
                    :placeholder="$t(`content.choose`)"
                    :options="componentStore.adContractTypes"
                    label-field="name"
                    value-field="id"
                    :loading="componentStore.adContractTypeLoading"
                />
              </n-form-item>
            </div>
            <div class="col-span-3">
              <n-form-item :label="$t(`documentPage.form.contractDate`)" path="contract_date">
                <n-date-picker
                    class="w-full"
                    v-model:value="store.payload.contract_date"
                    type="date"
                    :placeholder="$t(`content.choose`)"
                />
              </n-form-item>
            </div>

            <div class="col-span-3">
              <n-form-item :label="$t(`documentPage.form.schedule_id`)" path="schedule_id">
                <n-select
                    v-model:value="store.payload.schedule_id"
                    filterable
                    :placeholder="$t(`content.choose`)"
                    :options="componentStore.scheduleList"
                    value-field="id"
                    :loading="componentStore.scheduleLoading"
                    :render-label="scheduleLabel"
                    :render-tag="scheduleValue"
                    clearable
                />
              </n-form-item>
            </div>
            <div class="col-span-3 pt-10">
              <n-checkbox v-model:checked="store.payload.command_status" />
              {{$t(`documentPage.form.command_status`)}}
            </div>
            <div class="col-span-3" v-if="store.payload.command_status">
              <n-form-item :label="$t(`documentPage.form.command_type`)" path="command_type">
                <n-select
                    :disabled="!Boolean(store.payload.type)"
                    v-model:value="store.payload.command_type"
                    filterable
                    :placeholder="$t(`content.choose`)"
                    :options="componentStore.commandTypeList"
                    label-field="name"
                    value-field="id"
                    :loading="componentStore.commandTypeLoading"
                    clearable
                />
              </n-form-item>
            </div>

          </div>
        </div>

        <div class="col-span-12 border border-dashed p-2 rounded-xl border-gray-200 bg-gray-50 mt-4">
          <div class="grid grid-cols-12 gap-x-4">
            <div class="col-span-12">
              <n-form-item :label="$t(`documentPage.form.organization`)" path="organization_id">
                <UIStructure
                    :modelV="store.payload.organization_id"
                    @updateModel="onChangeStructure"
                    :checkedVal="store.structureCheck"
                    @updateCheck="(v)=>store.structureCheck=v"
                    :multiple="false"
                />
              </n-form-item>
            </div>
            <div v-if="store.payload.type === 2" class="col-span-12 flex justify-end">
              <n-checkbox v-model:checked="store.payload.position_status" @update:checked="onChangeStatus">
                <span class="text-xs text-gray-500">{{$t(`documentPage.form.positionStatus`)}}</span>
              </n-checkbox>
            </div>
            <template v-if="store.payload.position_status && (store.payload.type === 2)">
              <div class="col-span-4">
                <n-form-item :label="$t(`documentPage.form.position`)" path="position_id">
                  <n-select
                      v-model:value="store.payload.position_id"
                      filterable
                      :placeholder="$t(`content.choose`)"
                      :options="componentStore.positionList"
                      label-field="name"
                      value-field="id"
                      :loading="componentStore.positionLoading"
                  />
                </n-form-item>
              </div>
            </template>
            <template v-else>
              <div class="col-span-6">
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
                      :placeholder="$t(`content.choose`)"
                      :options="componentStore.departmentPositionList"
                      label-field="name"
                      value-field="id"
                      :loading="componentStore.departmentPositionLoading"
                  />
                </n-form-item>
              </div>
            </template>

            <div class="col-span-4">
              <n-form-item :label="$t(`documentPage.form.group`)" path="group">
                <n-select
                    v-model:value="store.payload.group"
                    filterable
                    :placeholder="$t(`content.choose`)"
                    :options="componentStore.groupList"
                    label-field="name"
                    value-field="id"
                    :loading="componentStore.enumLoading"
                    clearable
                />
              </n-form-item>
            </div>
            <div class="col-span-4">
              <n-form-item :label="$t(`documentPage.form.rank`)" path="rank">
                <n-select
                    v-model:value="store.payload.rank"
                    filterable
                    :placeholder="$t(`content.choose`)"
                    :options="componentStore.rankList"
                    label-field="name"
                    value-field="id"
                    :loading="componentStore.enumLoading"
                    clearable
                />
              </n-form-item>
            </div>
            <div class="col-span-2">
              <n-form-item :label="$t(`documentPage.form.salary`)" path="salary">
                <n-input
                    class="w-full"
                    type="text"
                    :placeholder="$t(`content.enterField`)"
                    :allow-input="Utils.onlyAllowNumber"
                    v-model:value="store.payload.salary"
                >
                  <template #suffix>
                    {{$t('content.sum')}}
                  </template>
                </n-input>
              </n-form-item>
            </div>
            <div class="col-span-12">
              <n-form-item :label="$t(`documentPage.form.postName`)" path="post_name">
                <n-input
                    class="w-full"
                    type="text"
                    :placeholder="$t(`content.enterField`)"
                    v-model:value="store.payload.post_name"
                />
              </n-form-item>
            </div>

          </div>
        </div>

        <div class="col-span-12 mt-10 pb-10">
          <n-form-item :label="$t(`documentPage.form.director`)" path="director_id">
            <n-select
                @focus="onFocusConf"
                size="large"
                value-field="id"
                label-field="last_name"
                v-model:value="store.payload.director_id"
                :placeholder="$t(`content.choose`)"
                :options="componentStore.confirmationList"
                :loading="componentStore.confirmationLoading"
                :render-label="renderLabel"
                :render-tag="renderValue"
            />
          </n-form-item>
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

<style scoped>

</style>