<script setup>
import validationRules from "@/utils/validationRules.js"
import {useCommandStore, useComponentStore} from "@/store/modules/index.js"
import {NAvatar} from "naive-ui"
import Utils from "@/utils/Utils.js"

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

  const worker = componentStore.workerList.filter((v)=>v.id === store.payload.workers?.[0])
  if(worker.length>0){
    const data = worker[0]
    store.payload.salary = data.salary
    store.payload.rank = data.rank
    store.payload.rate = data.rate
    store.payload.group = data.group
    console.log(data)
  }
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
            h('div',{ class:'text-xs text-primary'},`${ option.work_days[0].type.name}`),
            h('div',{ class:'text-xs text-primary'},`${option.work_days[0].start_time} - ${option.work_days[0].end_time}`),
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

const onChangeType = (v)=>{
  console.log(v)
  if(v === 25 && componentStore.groupList.length === 0){
    componentStore._enums()
    componentStore._scheduleList()
  }
}

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store.saveLoading = true
      if(store.visibleType){
        store._create()
      }else{
        store._update()
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

onMounted(()=>{
  componentStore._commandTypes()
  if(props.workers.length === 0){
    componentStore._workers()
  }else{
    store.resetForm()
    componentStore.workerList = props.workers
    store.payload.workers =props.workers.map(v=>v.id)
  }
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
      <div class="col-span-12 flex justify-center mb-6">
        <div class="w-[600px]">
          <n-form-item :label="$t(`documentPage.form.worker`)" path="workers">
            <n-select
                :disabled="workers.length>0"
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
                  @update:value="onChangeType"
              />
            </n-form-item>
          </div>
          <div class="col-span-2" v-if="store.payload.command_type !== 25">
            <n-form-item :label="$t(`documentPage.form.contract_to_date`)" path="contract_to_date">
              <n-date-picker
                  class="w-full"
                  v-model:value="store.payload.contract_to_date"
                  type="date"
                  :placeholder="$t(`content.choose`)"
              />
            </n-form-item>
          </div>

          <template v-if="store.payload.command_type === 25">
            <div class="col-span-2">
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
            <div class="col-span-2">
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
            <div class="col-span-2">
              <n-form-item
                  :label="$t(`documentPage.form.rate`)"
                  path="rate"
              >
                <n-input
                    class="w-full"
                    type="text"
                    :placeholder="$t(`content.enterField`)"
                    :allow-input="Utils.onlyAllowNumber"
                    v-model:value="store.payload.rate"
                />
              </n-form-item>
            </div>
            <div class="col-span-4">
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
          </template>
        </div>
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