<script setup>
import {useComponentStore, useConfApplicationStore} from "@/store/modules/index.js"
import {NAvatar} from "naive-ui"
import {UISelect} from "@/components/index.js"
import UIHelper from "@/utils/UIHelper.js"
import {useAppSetting} from "@/utils/index.js"

const store = useConfApplicationStore()
const componentStore = useComponentStore()

const isPosition = computed(()=>!([1,2].includes(store.payload.type)))


const onFocusDirector = ()=>{
  if(componentStore.directorList.length === 0){x
    getDirectors(store.organization_id?.[0]?.id )
  }

}
const onFocusPosition = ()=>{
  if(store.myPositionList.length === 0){
    store._myPositions((list)=>{
      if(list.length===1){
        store.payload.worker_position_id = list[0].id
        changePosition(list[0].id)
      }
    })
  }else if(store.myPositionList.length===1){
    store.payload.worker_position_id = store.myPositionList[0].id
    changePosition(store.payload.worker_position_id)
  }

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
    getDirectors(v[0].id)
  }
}

const getDirectors = (id)=>{
  store.confirmParams.organization_id = id
  componentStore._directors(id,(list)=>{
    if(list.length===1){
      store.payload.director_id = list[0].id
      store.confirmParams.director_id = list[0].id
      store.confirmParams.search = null
      store.confirmationList = []
      store.payload.confirmations = []
      store._confirmation()
    }
  })
}

const changePosition = (id)=>{
  let index = store.myPositionList.findIndex(v=>v.id === id)
  if(index !== -1){
    let orgId = store.myPositionList[index]?.organization?.id
    getDirectors(orgId)
  }
}



const disabledDirector = computed(()=>{
  return store.typeList.includes(store.payload.type)?  !Boolean(store.organization_id.length>0) : !Boolean(store.payload.worker_position_id)
})

onMounted(()=>{
    if(componentStore.workerApplicationTypes.length === 0){
      componentStore._workerApplicationEnums()
    }
    if(componentStore.allStructureList.length===0){
      componentStore._allStructures()
    }
})


</script>

<template>
  <div class="grid grid-cols-12 gap-x-4">
    <div class="col-span-12">
      <n-form-item :label="$t(`applicationPage.form.type`)" path="type">
        <n-select
            v-model:value="store.payload.type"
            filterable

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

            :options="store.myPositionList"
            :loading="store.positionLoading"
            :render-label="UIHelper.selectRender.label"
            :render-tag="UIHelper.selectRender.value"
            @update:value="changePosition"

            label-field="name"
            value-field="id"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 pr-3" v-if="!isPosition">
      <n-form-item :label="$t(`documentPage.form.organization`)" path="organization_id">
        <UISelect
            :options="componentStore.allStructureList"

            :modelV="store.organization_id"
            @defaultValue="(v)=>store.organization_id=v"
            @updateModel="onChangeStructure"
            :checkedVal="store.structureCheck"
            @updateCheck="(v)=>store.structureCheck=v"
            :loading="componentStore.allStructureLoading"
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

            :options="store.confirmationList"
            :loading="store.confirmLoading"
            :render-label="UIHelper.selectRender.label"
            :render-tag="UIHelper.selectRender.value"
            label-field="id"
            value-field="id"
            :max-tag-count="1"
            filterable
            :filter="()=>true"
            @search="store.onSearchConfirmation"
        />
      </n-form-item>
    </div>
    <div class="col-span-12">
      <n-form-item :label="$t(`applicationPage.form.application_date`)" path="application_date">
        <n-date-picker
            class="w-full"
            v-model:value="store.payload.application_date"
            type="date"

            :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
  </div>
</template>

<style scoped>

</style>