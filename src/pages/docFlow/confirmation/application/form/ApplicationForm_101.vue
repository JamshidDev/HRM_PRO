<script setup>
import {useComponentStore, useConfApplicationStore} from "@/store/modules/index.js"
import {NAvatar} from "naive-ui"
import Utils from "@/utils/Utils.js"
import {UIStructure} from "@/components/index.js"

const store = useConfApplicationStore()
const componentStore = useComponentStore()


const onFocusDirector = ()=>{
  if(componentStore.directorList.length === 0){
    componentStore._directors(store.organization_id?.[0] || undefined)
  }

}
const onFocusPosition = ()=>{
  if(store.myPositionList.length === 0){
    store._myPositions()
  }else if(store.myPositionList.length===1){
    store.payload.worker_position_id = store.myPositionList[0].id
  }

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
                src:option.worker.photo,
                'fallback-src':Utils.noAvailableImage,
              },),
          h('div',{ class:'flex flex-col'}, [
            h('div',{ class:'text-xs font-medium text-gray-500'},`${option.worker.last_name}.${option.worker.first_name[0]}.${option.worker.middle_name[0]}`),
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
        },`${option?.worker?.last_name} ${option?.worker?.first_name} ${option?.worker?.middle_name}`),
  ];
}

const renderLabel2 = (option)=>{
  return [
    h(
        'div',
        {
          class:'flex gap-2 my-1 items-center'
        },[
          h(NAvatar,
              {
                class:'',
                src:option.worker.photo,
                'fallback-src':Utils.noAvailableImage,
              },),
          h('div',{ class:'flex flex-col'}, [
            h('div',{ class:'text-xs font-medium text-gray-500'},`${option.worker.last_name}.${option.worker.first_name[0]}.${option.worker.middle_name[0]}`),
            h('div',{ class:'text-xs text-gray-400'},option.post_name),
          ])
        ]
    ),
  ];
}
const renderValue2 = ({option})=>{
  return [
    h(
        'div',
        {
          class:'flex gap-2 my-1 items-center'
        },`${option?.post_name}`),
  ];
}

const onSelectDirector = ()=>{
  store.confirmParams.director_id = store.payload.director_id
  store.confirmParams.search = null
  store.confirmationList = []
  store.payload.confirmations = []
  store._confirmation()
}
const onSelectApplication = (v)=>{

  componentStore.directorList = []
  store.payload.director_id = null
  store.confirmationList = []
  store.payload.confirmations = []
  store.organization_id = []
}

const onChangeStructure = (v)=>{
  store.organization_id=v
  if(v.length>0){
    componentStore.directorList = []
    store.payload.director_id = null
    componentStore._directors(v[0].id)
  }
}

const showOrganization = computed(()=>{
  return store.typeList.includes(store.payload.type)
})

const disabledDirector = computed(()=>{
  return store.typeList.includes(store.payload.type)?  !Boolean(store.organization_id.length>0) : !Boolean(store.payload.type)
})









onMounted(()=>{
    if(componentStore.workerApplicationTypes.length === 0){
      componentStore._workerApplicationEnums()
    }
    onFocusPosition()
})


</script>

<template>
  <div class="grid grid-cols-12 gap-x-4">
    <div class="col-span-12">
      <n-form-item :label="$t(`applicationPage.form.type`)" path="type">
        <n-select
            v-model:value="store.payload.type"
            filterable
            :placeholder="$t(`content.choose`)"
            :options="componentStore.workerApplicationTypes"
            label-field="name"
            value-field="id"
            :loading="componentStore.workerApplicationLoading"
            @update:value="onSelectApplication"
        />
      </n-form-item>
    </div>
    <div class="col-span-12">
      <n-form-item :label="$t(`applicationPage.form.worker_position_id`)" path="worker_position_id">
        <n-select
            @focus="onFocusPosition"
            v-model:value="store.payload.worker_position_id"
            :placeholder="$t(`content.choose`)"
            :options="store.myPositionList"
            :loading="store.positionLoading"
            :render-label="renderLabel2"
            :render-tag="renderValue2"
            label-field="id"
            value-field="id"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 pr-3" v-if="showOrganization">
      <n-form-item :label="$t(`documentPage.form.organization`)" path="organization_id">
        <UIStructure
            :modelV="store.organization_id"
            @updateModel="onChangeStructure"
            :checkedVal="store.structureCheck"
            @updateCheck="(v)=>store.structureCheck=v"
            :multiple="false"
        />
      </n-form-item>
    </div>
    <div class="col-span-12">
      <n-form-item :label="$t(`applicationPage.form.director_id`)" path="director_id">
        <n-select
            :disabled="disabledDirector"
            @focus="onFocusDirector"
            v-model:value="store.payload.director_id"
            :placeholder="$t(`content.choose`)"
            :options="componentStore.directorList"
            :loading="componentStore.directorLoading"
            @update:value="onSelectDirector"
            :render-label="renderLabel"
            :render-tag="renderValue"
            label-field="id"
            value-field="id"
        />
      </n-form-item>
    </div>
    <div class="col-span-12">
      <n-form-item :label="$t(`applicationPage.form.confirmations`)" path="confirmations">
        <n-select
            :disabled="!store.payload.director_id"
            multiple
            v-model:value="store.payload.confirmations"
            :placeholder="$t(`content.choose`)"
            :options="store.confirmationList"
            :loading="store.confirmLoading"
            :render-label="renderLabel2"
            :render-tag="renderValue"
            label-field="id"
            value-field="id"
        />
      </n-form-item>
    </div>
  </div>
</template>

<style scoped>

</style>