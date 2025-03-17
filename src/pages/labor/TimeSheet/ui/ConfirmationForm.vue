<script setup>
import {useComponentStore, useTimeSheetConfirmStore} from "@/store/modules/index.js"
import validationRules from "@/utils/validationRules.js";
import {NAvatar} from "naive-ui";
import Utils from "@/utils/Utils.js";
import {VueDraggable} from 'vue-draggable-plus';
import {CheckmarkCircle16Filled, CheckmarkCircle16Regular, LineHorizontal320Filled, Delete20Filled} from '@vicons/fluent'


const formRef = ref(null)
const store = useTimeSheetConfirmStore()
const componentStore = useComponentStore()

onMounted(() => {
  if (componentStore.confirmationList.length === 0) componentStore._confirmations()
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
      <n-form-item :label="$t('timeSheetPage.verifiers')" path="confirmations">
        <n-select
            :loading="componentStore.confirmationLoading"
            :max-tag-count="1"
            :options="componentStore.confirmationList"
            :placeholder="$t(`content.choose`)"
            :render-label="renderLabel"
            :render-tag="renderValue"
            :value="store.payload.confirmationObjects.map(i=>i.id)"
            filterable
            label-field="last_name"
            multiple
            value-field="id"
            @update-value="(_, objects)=>store.payload.confirmationObjects = objects"
        />
      </n-form-item>
      <VueDraggable
          v-model="store.payload.confirmationObjects"
          :animation="150"
          class="flex flex-col gap-2"
          handle=".handle"
      >
        <div v-for="(item, idx) in store.payload.confirmationObjects" :key="idx"
             class="flex gap-2 border border-surface-line rounded-md p-1 ">
          <n-button class="handle !cursor-move flex-shrink-0" size="small" text type="primary">
            <template #icon>
              <n-icon :component="LineHorizontal320Filled"/>
            </template>
          </n-button>
          <div class="flex flex-grow group justify-between">
            <div class="flex gap-2 items-center">
              <n-avatar
                  :fallback-src="Utils.noAvailableImage"
                  :src="item.photo"
              ></n-avatar>
              <div class='flex flex-col'>
                <div class="text-xs font-medium text-gray-500">
                  {{ `${item.last_name}.${item.last_name[0]}.${item.middle_name[0]} (${idx + 1})` }}
                </div>
                <div class="text-xs text-gray-400">{{ item.position }}</div>
              </div>
            </div>
            <div class="flex gap-1">
              <n-button
                  circle
                  quaternary
                  type="error"
                  @click="()=>store.payload.confirmationObjects = store.payload.confirmationObjects.filter(i=>i.id!==item.id)"
                  class="transition-all duration-500 opacity-0 group-hover:opacity-100"
              >
                <template #icon>
                  <n-icon :component="Delete20Filled"/>
                </template>
              </n-button>

              <n-button
                  v-if="store.payload.main === item.id"
                  circle
                  quaternary
                  type="primary"
                  @click="store.payload.main=null"
              >
                <template #icon>
                  <n-icon :component="CheckmarkCircle16Filled"/>
                </template>
              </n-button>

              <n-button
                  v-else
                  circle
                  class="transition-all duration-500 opacity-0 group-hover:opacity-100"
                  quaternary
                  type="primary"
                  @click="store.payload.main=item.id"
              >
                <template #icon>
                  <n-icon :component="CheckmarkCircle16Regular"/>
                </template>
              </n-button>
            </div>

          </div>

        </div>
      </VueDraggable>

        <n-button
            :loading="store.saveLoading"
            type="primary"
            @click="onSubmit"
            class="!mt-auto"
            block
        >
          {{ $t('content.save') }}
        </n-button>

    </n-form>
  </n-spin>

</template>

<style scoped>

</style>