<script setup>
import validationRules from "@/utils/validationRules.js"
import {useCommandStore, useComponentStore} from "@/store/modules/index.js"
import {NAvatar} from "naive-ui"
import Utils from "@/utils/Utils.js"
import VacationForm_41 from "@/pages/docFlow/document/command/ui/VacationForm_41.vue"
import {UIStructure} from "@/components/index.js"




const vacationForm = ref(null)

const store = useCommandStore()
const componentStore = useComponentStore()
const formRef = ref(null)
const confirmationList = ref([])

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
            h('div',{ class:'text-xs text-primary'},option.position),
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
const onChangeWorker = ()=>{
  if(store.payload.workers.length>0){
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
      }
    })
  }
}


const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      const validate = vacationForm.value?.onSubmit()
      if(validate?.isValid){
        store.saveLoading = true
        if(store.visibleType){
          store._create(validate.data)
        }else{
          store._update()
        }
      }
    }
  })
}

watchEffect(()=>{
  if(store.payload.director_id){
    store.payload.confirmations = store.payload.confirmations.filter(v=>v !==store.payload.director_id)
    confirmationList.value = componentStore.confirmationList.filter(v=>v.id !==store.payload.director_id)
  }


})



const onChangeStructure = (v)=>{
  store.payload.organization_id=v
  if(v.length>0){
    componentStore.workerList = []
    store.workers = []
    componentStore._workers(v[0].id)
  }
}
onMounted(()=>{
  componentStore._commandTypes()
  store.resetForm()
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
        <div class="grid grid-cols-12 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-gray-50">
          <div class="col-span-2">
            <n-form-item :label="$t(`documentPage.command.form.command_number`)" path="command_number">
              <n-input
                  class="w-full"
                  type="text"
                  :placeholder="$t(`content.enterField`)"
                  v-model:value="store.payload.command_number"
              />
            </n-form-item>

          </div>
          <div class="col-span-2">
            <n-form-item :label="$t(`documentPage.command.form.command_date`)" path="command_date">
              <n-date-picker
                  class="w-full"
                  v-model:value="store.payload.command_date"
                  type="date"
                  :placeholder="$t(`content.choose`)"
              />
            </n-form-item>
          </div>
          <div class="col-span-8">
            <n-form-item :label="$t(`documentPage.command.form.type`)" path="command_type">
              <n-select
                  v-model:value="store.payload.command_type"
                  filterable
                  :placeholder="$t(`content.choose`)"
                  :options="componentStore.commandTypeList"
                  label-field="name"
                  value-field="id"
                  :loading="componentStore.commandTypeLoading"
              />
            </n-form-item>
          </div>

        </div>
      </div>


      <div class="col-span-12">
        <div class="grid grid-cols-12 gap-x-4 mt-6">
          <div class="col-span-6 flex">
            <n-form-item class="w-full" :label="$t(`documentPage.form.organization`)" path="organization_id">
              <UIStructure
                  :modelV="store.payload.organization_id"
                  @updateModel="onChangeStructure"
                  :checkedVal="store.structureCheck"
                  @updateCheck="(v)=>store.structureCheck=v"
                  :multiple="false"
              />
            </n-form-item>
          </div>
          <div class="col-span-6 flex">
            <n-form-item class="w-full" :label="$t(`documentPage.form.worker`)" path="workers">
              <n-select
                  :disabled="store.payload.organization_id.length === 0"
                  multiple
                  v-model:value="store.payload.workers"
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
      </div>


      <div class="col-span-12 mt-4">

        <template v-if="store.payload.command_type === 41">
          <VacationForm_41 ref="vacationForm"/>
        </template>

      </div>


      <div class="col-span-12 mt-10">
        <div class="grid grid-cols-12 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-gray-50">


          <div class="col-span-12 mt-4">
            <n-form-item :label="$t(`documentPage.command.form.director_id`)" path="director_id">
              <n-select
                  @focus="onFocusConf"
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
          <div class="col-span-12 mt-4">
            <n-form-item :label="$t(`documentPage.command.form.confirm`)" path="confirmations">
              <n-select
                  :disabled="!store.payload.director_id"
                  value-field="id"
                  multiple
                  v-model:value="store.payload.confirmations"
                  :placeholder="$t(`content.choose`)"
                  :options="confirmationList"
                  :loading="componentStore.confirmationLoading"
                  :render-label="renderLabel" />
            </n-form-item>
          </div>
        </div>
      </div>
    </n-form>
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
</template>

<style scoped>

</style>