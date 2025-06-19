<script setup>

import {useComponentStore} from "@/store/modules/index.js"
import {UIUser} from "@/components/index.js"
import {NIcon} from "naive-ui"
import {Checkmark16Filled} from "@vicons/fluent"
import {useDebounceFn} from "@vueuse/core"
import {MaskInput} from "maska"
import Utils from "@/utils/Utils.js"

const componentStore = useComponentStore()

const workerId = defineModel('value', {
  required: true,
})

const workerSelectRef = ref(null)

const searchEvent = useDebounceFn((v) => {
  workerId.value = null
  v = v.replaceAll(" ", '')

  if(v.length === 14){
    componentStore._checkWorker(v)
  }
}, 300)


const renderWorkerOption = ({option, selected})=>{
  const userOption = [h(UIUser, {
    data:{
      photo:option?.photo,
      lastName:option?.lastName,
      firstName:option?.firstName,
      middleName:option?.middleName,
      position:option?.position
    },
    hideTooltip: true,
    avatarClickable: false,
  })]
  if(selected){
    userOption.push(h(NIcon, {
      class: 'option-checkmark',
      component: Checkmark16Filled,
      size: '16px',
    }))
  }

  return h('div',{
    class:"pinfl-worker-option",
    onClick() {
      if(workerId.value == option?.pin){
        workerId.value = null
      }else{
        workerId.value = option?.pin
        workerSelectRef.value.blur()
      }
    }
  }, userOption)
}

const renderWorkerLabel = ({option})=>{
  return h('div', null, {
    default: ()=>Utils.combineFullName({
      first_name: option.firstName,
      last_name:option.lastName,
      middle_name:option.middleName
    })
  })
}

onMounted(()=>{
  new MaskInput(workerSelectRef.value?.$el.querySelector('input'), { mask: "#### #### #### ##" })
})

</script>
<template>
  <n-select
      :placeholder="$t('content.pin')"
      clearable
      clear-filter-after-select
      ref="workerSelectRef"
      :value="workerId ? String(workerId) : undefined"
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
</template>
<style>

.pinfl-worker-option{
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  align-items: center;
  padding: 0 10px;
}

.option-checkmark{
  color: var(--primary-color);
}
</style>