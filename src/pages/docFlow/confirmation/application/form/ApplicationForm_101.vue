<script setup>
import {useComponentStore, useConfApplicationStore} from "@/store/modules/index.js"
import {NAvatar} from "naive-ui"
import {UIStructureV2, UIStructure} from "@/components/index.js"
import UIHelper from "@/utils/UIHelper.js"
import {useAppSetting} from "@/utils/index.js"

const store = useConfApplicationStore()
const componentStore = useComponentStore()

const isPosition = computed(()=>!([1,2].includes(store.payload.type)))


const onFocusDirector = ()=>{
  if(componentStore.directorList.length === 0){
    componentStore._directors(store.organization_id?.[0]?.id || undefined)
  }

}
const onFocusPosition = ()=>{
  if(store.myPositionList.length === 0){
    store._myPositions()
  }else if(store.myPositionList.length===1){
    store.payload.worker_position_id = store.myPositionList[0].id
    store.onChangePosition(store.payload.worker_position_id)
  }

}

const renderLabel2 = (option)=>{
  return [
    h(
        'div',
        {
          class:'flex gap-2 my-1 items-center'
        },[
            h('div', {
              class:'flex w-[40px]'
            },[
              h(NAvatar,
                  {
                    class:'w-[30px]',
                    src:option.worker.photo,
                  },),
            ]),
          h('div',{ class:'flex flex-col',}, [
            h('div',{ class:'text-xs font-medium text-gray-500'},`${option.worker.last_name}.${option.worker.first_name[0]}.${option.worker.middle_name[0]}`),
            h('div',{ class:'text-xs text-gray-400 truncate'},option.post_short_name),
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

  if(isPosition.value){
    onFocusPosition()
  }
}

const onChangeStructure = (v)=>{
  store.organization_id=v
  if(v.length>0){
    componentStore.directorList = []
    store.payload.director_id = null
    store.confirmParams.organization_id = v[0].id
    componentStore._directors(v[0].id)
  }
}

watchEffect(()=>{


})



const disabledDirector = computed(()=>{
  return store.typeList.includes(store.payload.type)?  !Boolean(store.organization_id.length>0) : !Boolean(store.payload.worker_position_id)
})









onMounted(()=>{
    if(componentStore.workerApplicationTypes.length === 0){
      componentStore._workerApplicationEnums()
    }
    // onFocusPosition()
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
    <div
        class="col-span-12"
        v-if="isPosition && store.payload.type"
    >
      <n-form-item :label="$t(`applicationPage.form.worker_position_id`)" path="worker_position_id">
        <n-select
            @focus="onFocusPosition"
            v-model:value="store.payload.worker_position_id"
            :placeholder="$t(`content.choose`)"
            :options="store.myPositionList"
            :loading="store.positionLoading"
            :render-label="renderLabel2"
            :render-tag="renderValue2"
            @update:value="store.onChangePosition"
            label-field="id"
            value-field="id"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 pr-3" v-if="!isPosition">
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
            :render-label="UIHelper.selectRender.label"
            :render-tag="UIHelper.selectRender.value"
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
            :render-label="UIHelper.selectRender.label"
            :render-tag="UIHelper.selectRender.value"
            label-field="id"
            value-field="id"
            :max-tag-count="1"
        />
      </n-form-item>
    </div>
    <div class="col-span-12">
      <n-form-item :label="$t(`applicationPage.form.application_date`)" path="application_date">
        <n-date-picker
            class="w-full"
            v-model:value="store.payload.application_date"
            type="date"
            :placeholder="$t(`content.choose`)"
            :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
  </div>
</template>

<style scoped>

</style>