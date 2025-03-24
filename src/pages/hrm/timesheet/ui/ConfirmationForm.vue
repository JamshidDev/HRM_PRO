<script setup>
import {useComponentStore, useTimesheetConfirmStore} from "@/store/modules/index.js"
import validationRules from "@/utils/validationRules.js";
import {NAvatar} from "naive-ui";
import Utils from "@/utils/Utils.js";
import {VueDraggable} from 'vue-draggable-plus';
import {Delete20Filled, ArrowMoveInward20Filled, Star28Filled} from '@vicons/fluent'


const formRef = ref(null)
const store = useTimesheetConfirmStore()
const componentStore = useComponentStore()

onMounted(() => {
  componentStore._confirmations()
  store._index()
})

const renderLabel = (option) => {
  return [
    h(
        'div',
        {
          class: 'flex gap-2 my-1 items-center'
        }, `${option?.last_name} ${option?.first_name} ${option?.middle_name}`),
  ];
}


const renderMainVerifier = (option) => {
  return [
    h(
        'div',
        {
          class: 'flex gap-2 my-1 items-center'
        }, `${option.worker?.last_name} ${option.worker?.first_name} ${option.worker?.middle_name}`),
  ];
}

const renderValue = ({option}) => {
  return [
    h(
        'div',
        {
          class: 'flex gap-2 my-1 items-center'
        }, `${option?.last_name} ${option?.first_name} ${option?.middle_name}`),
  ];
}



const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      store._create()
      // console.log(store.payload)
    }
  })
}
</script>
<template>
  <n-spin :show="store.loading"  class="h-full">
    <n-form
        ref="formRef"
        :model="store.payload"
        :rules="validationRules.common"
        class="flex flex-col h-full"
    >
      <n-grid :cols="9" x-gap="10px">
        <n-form-item-gi :span="7" :label="$t('timesheetPage.verifiers')" path="confirmations">
          <n-select
              :loading="componentStore.confirmationLoading"
              :max-tag-count="1"
              :options="componentStore.confirmationList"
              :placeholder="$t(`content.choose`)"
              :render-label="renderLabel"
              :render-tag="renderValue"
              v-model:value="store.payload.confirmationObjects"
              filterable
              label-field="last_name"
              multiple
              value-field="id"
          />
        </n-form-item-gi>

        <n-form-item-gi :span="2">
          <n-button
              :loading="store.saveLoading"
              type="primary"
              @click="onSubmit"
          >
            {{ $t('content.save') }}
          </n-button>
        </n-form-item-gi>
        <n-form-item-gi :show-feedback="false" :span="9" :label="$t('timesheetPage.mainVerifier')">
          <n-select
              :options="store.list"
              :placeholder="$t(`content.choose`)"
              :render-label="renderMainVerifier"
              filterable
              v-model="store.payload.mainUser"
              label-field="last_name"
              value-field="id"
              @update-value="(_, v)=>{
                console.log(_, v)
                store._update({main:true, id: v.worker.id, attach: true, order: v.order})
              }"
          />

        </n-form-item-gi>
      </n-grid>
      <n-divider />
      <VueDraggable
          v-model="store.list"
          :animation="150"
          class="flex flex-col gap-2"
          handle=".handle"
          @end="(v)=>{
            console.log(v)
            if(v.newIndex!==v.oldIndex){
              store._update({order: v.newIndex+1, id: v.data.worker.id, attach: true, main: v.data.main})
            }
          }"
      >
        <div v-for="(item, idx) in store.list" :key="idx"
             class="flex gap-2 border border-surface-line rounded-md p-1 ">
          <n-button class="handle !cursor-move flex-shrink-0" size="small" text type="primary">
            <template #icon>
              <n-icon :component="ArrowMoveInward20Filled"/>
            </template>
          </n-button>
          <div class="flex flex-grow group justify-between">
            <div class="flex gap-2 items-center">
              <n-avatar
                  circle
                  :fallback-src="Utils.noAvailableImage"
                  :src="item.worker.photo"
              ></n-avatar>
              <div class='flex flex-col'>
                <div class="text-xs font-medium text-gray-500">
                  {{ `${item.worker.last_name}.${item.worker.last_name[0]}.${item.worker.middle_name[0]}` }}
                </div>
                <div class="text-xs text-gray-400">{{ item.position }}</div>
              </div>

                <n-button
                    circle
                    quaternary
                    type="success"
                    v-if="item.main"
                >
                  <template #icon>
                    <n-icon :component="Star28Filled"/>
                  </template>
                </n-button>
            </div>
            <n-tooltip trigger="hover">
              {{$t('content.delete')}}
              <template #trigger>
                <n-button
                    circle
                    quaternary
                    type="error"
                    @click="()=>store._update({attach: false, id: item.worker.id})"
                    class="transition-all duration-500 opacity-0 group-hover:opacity-100"
                >
                  <template #icon>
                    <n-icon :component="Delete20Filled"/>
                  </template>
                </n-button>
              </template>
            </n-tooltip>

          </div>

        </div>
      </VueDraggable>
    </n-form>
  </n-spin>

</template>

<style scoped>

</style>