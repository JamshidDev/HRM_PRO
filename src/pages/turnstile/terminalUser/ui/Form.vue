<script setup>
import validationRules from "@/utils/validationRules.js";
import {useComponentStore, useTurnstileOrganizationStore, useTurnstileTerminalUserStore} from "@/store/modules/index.js";
import {UISelect, NoDataIllustration} from "@/components/index.js";
import {Checkmark16Filled, CheckmarkCircle20Filled} from "@vicons/fluent"

const formRef = ref(null)
const store = useTurnstileTerminalUserStore()
const componentStore = useComponentStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store.saveLoading = true
      if(store.visibleType){
        store._create()
      }else{
        // store._update()
      }
    }
  })
}


const changeOrg = (v) => {
  store.payload.organization_id = v
  store.payload.worker_position_id = null
  store.photos = []
  store.payload.photo_id = null
  componentStore.workerParams.organization_id = v[0].id
  componentStore._workers()
}

const onChangeWorker = (v) => {
  store.photos = []
  store.payload.photo_id = null
  if(v){
    store._worker_photos(v)
  }
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

const toggleImage = (v)=>{
  if(store.payload.photo_id === v.id){
    store.payload.photo_id = null
  }else{
    store.payload.photo_id = v.id
  }
}

const toggleDevice = (v)=>{
  const idx = store.payload.terminals.findIndex(i=>i===v.id);
  if(idx === -1){
    store.payload.terminals.push(v.id)
  }else{
    store.payload.terminals.splice(idx,1)
  }
}

onMounted(()=>{
  store._turnstile_devices();
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }
})

</script>


<template>
  <n-spin :show="store.devicesLoading">

    <div style="height:calc(100vh - 120px)" class="overflow-y-auto">
      <n-form
        ref="formRef"
        :model="store.payload"
        :rules="validationRules.common"
        class="flex flex-col"
      >
  
      <n-form-item v-if="store.visibleType" :label="$t(`content.organization`)" path="organization_id" rule-path="requiredMultiSelectField">
        <UISelect
            :options="componentStore.structureList"
            :modelV="store.payload.organization_id"
            @defaultValue="(v)=>store.payload.organization_id=v"
            @updateModel="changeOrg"
            :checkedVal="store.structureCheck"
            @updateCheck="(v)=>store.structureCheck=v"
            :loading="componentStore.structureLoading"
            
            :multiple="false"
        />
      </n-form-item>
      <n-form-item v-if="store.visibleType" :label="$t(`content.staff`)" path="worker_position_id" rule-path="requiredNumberField">
        <n-select
            :disabled="store.payload.organization_id.length === 0"
            v-model:value="store.payload.worker_position_id"
            filterable

            :options="componentStore.workerList"
            label-field="name"
            value-field="id"
            :render-label="workerRenderLabel"
            :render-tag="workerRenderValue"
            :loading="componentStore.workerLoading"
            @scroll="componentStore.onScrollWorker"
            @search="componentStore.onSearchWorker"
            :reset-menu-on-options-change="false"
            @update:value="onChangeWorker"
        />
      </n-form-item>
      <n-form-item :label="$t(`content.deadline`)" path="to" rule-path="requiredDateTimeField">
        <n-date-picker
            class="w-full"

            v-model:value="store.payload.to"
            type="date"
            update-value-on-close
            :actions="null"
            clearable />
      </n-form-item>
      <n-form-item :label="$t(`content.photo`)" path="photo_id" rule-path="requiredNumberField">
        <div class="h-[250px] max-h-[250px] p-2 border border-surface-line border-dashed w-full rounded-md">
          <n-spin class="h-full w-full" :show="store.photosLoading">
            <NoDataIllustration v-if="!store.photos.length" class="w-full h-full" />
            <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] grid-rows-[repeat(auto-fill,minmax(120px,1fr))] gap-[10px]">
              <div v-for="photo in store.photos" :key="photo.id" class="rounded-md overflow-hidden relative" @click="toggleImage(photo)" style="box-shadow: rgba(0, 0, 0, 0.1) 0 4px 12px;">
                <img class="w-full h-full object-cover transition-all hover:scale-[1.1] cursor-pointer" alt="worker-photo" :src="photo.photo"/>
                <n-icon-wrapper class="absolute top-1 right-1" v-if="store.payload.photo_id===photo.id" :size="24" :border-radius="10">
                  <n-icon :size="18" :component="Checkmark16Filled" />
                </n-icon-wrapper>
              </div>
            </div>
          </n-spin>
        </div>
      </n-form-item>
      <n-form-item :label="$t(`turnstile.terminals`)" path="terminals" rule-path="requiredMultiSelectField">
        <div class="flex gap-2 flex-wrap">
          <n-button
              v-for="device in store.devices"
              :key="device.id"
              size="small"
              round
              :type="store.payload.terminals.includes(device.id) ? 'primary' : 'tertiary'"
              @click="toggleDevice(device)"
          >
            <template #icon>
              <CheckmarkCircle20Filled/>
            </template>
            {{device.name}}
          </n-button>
        </div>
      </n-form-item>
      </n-form>
  
  
    </div>
    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.visible = false" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button
            :loading="store.saveLoading"
            type="primary"
            @click="onSubmit">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-spin>


</template>

