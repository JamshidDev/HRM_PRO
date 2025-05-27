<script setup>
import validationRules from "@/utils/validationRules.js";
import {useTeacherStore, useComponentStore} from "@/store/modules/index.js";
import { MaskInput } from "maska"
import {useDebounceFn} from "@vueuse/core"
import {UIUser} from "@/components/index.js"
import Utils from "@/utils/Utils.js"
import {options} from "marked"


const formRef = ref(null)
const store = useTeacherStore()
const componentStore = useComponentStore()

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

const workerSelectRef = ref(null)

const searchEvent = useDebounceFn((v) => {
  store.payload.worker_id = null
  v = v.replaceAll(" ", '')

  if(v.length === 14){
    componentStore._checkWorker(v)
  }
}, 300)

onMounted(()=>{
  store.subjectsParams.page = 1
  store.subjectsParams.search = null
  store._subjects()

  new MaskInput(workerSelectRef.value?.$el.querySelector('input'), { mask: "#### #### #### ####" })
})

const renderWorkerLabel = ({option})=>{
  return h('div', null, {
    default: ()=>Utils.combineFullName({
      first_name: option.firstName,
      last_name:option.lastName,
      middle_name:option.middleName
    })
  })
}

const renderWorkerOption = ({option})=>{
  return h(UIUser, {
    data:{
      photo:option?.photo,
      lastName:option?.lastName,
      firstName:option?.firstName,
      middleName:option?.middleName,
      position:option?.position
    },
    class:"pinfl-worker-option",
    hideTooltip: true,
    avatarClickable: false,
    onClick() {
      store.payload.worker_id = option?.pin
    }
  })
}

</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.payload"
  >
    <div style="min-height:calc(100vh - 120px)">
      <n-form-item :label="$t(`teacherPage.form.worker`)" path="worker_id" rule-path="requiredStringField">
        <n-select
            clearable
            clear-filter-after-select
            ref="workerSelectRef"
            v-model:value="store.payload.worker_id"
            :options="componentStore.worker ? [componentStore.worker] : []"
            :loading="componentStore.pinLoading"
            label-field="lastName"
            value-field="pin"
            filterable
            :render-option="renderWorkerOption"
            :render-tag="renderWorkerLabel"
            :filter="()=>true"
            @search="searchEvent"
        />
      </n-form-item>

      <n-form-item :label="$t(`teacherPage.form.subjects`)" path="subjects" rule-path="requiredMultiSelectField">
        <n-select
            v-model:value="store.payload.subjects"
            multiple
            @scroll="store.onScrollSubjects"
            :options="store.subjects"
            :loading="store.subjectsLoading"
            label-field="name"
            value-field="id"
            filterable
            :filter="()=>true"
            @search="store.onSearchSubjects"
        />
      </n-form-item>
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

<style>
.pinfl-worker-option{
  width: 100%;
  cursor: pointer;

}
</style>