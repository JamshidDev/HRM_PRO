<script setup>
import validationRules from "@/utils/validationRules.js";
import {useOrganizationLeaderStore, useComponentStore} from "@/store/modules/index.js";
import {UIStructure} from "@/components/index.js"
import PhoneInput from './PhoneInput.vue'

const formRef = ref(null)
const store = useOrganizationLeaderStore()
const componentStore = useComponentStore()

const onSubmit = () => {
  formRef.value?.validate((error) => {
    if (!error) {
      store.saveLoading = true
      if (store.visibleType) {
        store._create()
        //   ok
      } else {
        store._update()
      }
    }
  })
}

const changeOrg = (v) => {
  store.payload.organization_id = v
  store.payload.worker_position_id = null
  componentStore.workerParams.organization_id = v[0].id
  componentStore._workers()
}

const workerRenderLabel = (option) => {
  return [
    h('div', {class: 'flex flex-col'}, [
      h('div', {class: 'text-xs font-medium text-gray-500'}, option.name),
      h('div', {class: 'text-xs text-primary'}, option.position),
    ])
  ];
}
const workerRenderValue = ({option}) => {
  return [
    h('div', {class: 'flex flex-col'}, [
      h('div', {class: 'text-sm font-medium text-gray-500'}, option.name),
    ])
  ];
}

</script>

<template>
  <n-form
      ref="formRef"
      :model="store.payload"
      :rules="validationRules.common"
      class="h-full flex flex-col"
  >
    <n-form-item v-if="store.visibleType" :label="$t(`content.organization`)" path="organization_id" rule-path="requiredMultiSelectField">
      <UIStructure
          :modelV="store.payload.organization_id"
          :checkedVal="store.structureCheck"
          @updateCheck="(v)=>store.structureCheck=v"
          @updateModel="changeOrg"
          :multiple="false"
      />
    </n-form-item>
    <n-form-item v-if="store.visibleType" :label="$t(`content.staff`)" path="worker_position_id" rule-path="requiredNumberField">
      <n-select
          :disabled="store.payload.organization_id.length === 0"
          v-model:value="store.payload.worker_position_id"
          filterable
          :placeholder="$t(`content.choose`)"
          :options="componentStore.workerList"
          label-field="name"
          value-field="id"
          :render-label="workerRenderLabel"
          :render-tag="workerRenderValue"
          :loading="componentStore.workerLoading"
          @scroll="componentStore.onScrollWorker"
          @search="componentStore.onSearchWorker"
          :reset-menu-on-options-change="false"
      />
    </n-form-item>
    <n-form-item
        :label="$t('content.phone')"
        path="phones" :rule="[{
          trigger: [ 'blur'],
          validator() {
            console.log(store.payload.phones)
            if(store.payload.phones.find(i=>i.length!==5 && i.length!==9)!==undefined) return new Error($t('organizationLeaderPage.invalidPhone'))
            return true
          },
        }]">
      <div class="flex gap-2 flex-wrap">
        <template v-for="(item, idx) in store.payload.phones"
                  :key="idx">
          <div class="grow shrink-0 basis-[200px]">
            <PhoneInput
                :phone="store.payload.phones[idx]"
                @update:value="(v)=>store.payload.phones[idx] = v"
                :removable="store.payload.phones.length > 1"
                :addable="store.payload.phones.length < 5 && idx === store.payload.phones.length - 1"
                @add="store.payload.phones.push('')"
                @remove="store.payload.phones.splice(idx, 1)"
            />

          </div>

        </template>
      </div>
    </n-form-item>
    <div class="mt-auto">
      <n-button
          :loading="store.saveLoading"
          type="primary"
          @click="onSubmit">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped>

</style>