<script setup>
import validationRules from "@/utils/validationRules.js";
import {useTelegramUserStore} from "@/store/modules/index.js"
import UIHelper from "@/utils/UIHelper.js"

const formRef = ref(null)

const store = useTelegramUserStore()
const noSelectedCount = ref(0)

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      store._create()
    }
  })
}

const onUpdateShow = (v)=>{
  if(!v || store.userList.length>0) return
  store.onOpenUserEv(v)
}

const onSearchEv = ()=>{
  let query =store.inputParam.search?.toString()?.trim()?.toLowerCase()
  if(!Boolean(query)){
    store.deviceList = store.originDeviceList
    noSelectedCount.value = 0
  }else{
    const selected = store.originDeviceList.filter(v=>store.payload.devices.includes(v.id))
    const filtered = store.originDeviceList.filter(v=>v?.name?.toString()?.toLowerCase()?.includes(query))
    store.deviceList = [...new Set([...filtered,...selected])]
  }
}
const onCheck = (v)=>{
   store.payload.devices = v? store.deviceList.map((x)=>x.id) : []
}


watchEffect(()=>{
  store.inputParam.selectAll =store.deviceList.length>0? store.deviceList.length === store.payload.devices.length : false
})
onMounted(()=>{
  if(store.userList.length === 0) store._users()
  if(store.deviceList.length === 0) store._alLDevice()
  store.inputParam.search = null
  store.deviceList = store.originDeviceList
  if(store.visibleType){
    store.inputParam.selectAll = false
    }
})
</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.payload"
  >
    <div>
      <template v-if="store.visibleType">
        <n-form-item
            :label="$t(`notification.form.user_id`)"
            path="user_id"
            :rule-path="validationRules.rulesNames.requiredNumberField">
          <n-select
              filterable
              clearable
              :filter="()=>true"
              v-model:value="store.payload.user_id"
              :options="store.userList"
              :loading="store.userLoading"
              label-field="name"
              :render-label="UIHelper.selectRender.label"
              :render-tag="UIHelper.selectRender.value"
              value-field="id"
              @search="store._onSearchUser"
              @scroll="store._onScrollUser"
              @update:show="onUpdateShow"
          />
        </n-form-item>
      </template>
      <n-form-item
          :label="$t(`notification.form.devices`)"
          path="devices"
          :rule-path="validationRules.rulesNames.requiredMultiSelectField">
        <n-select
            multiple
            clearable
            v-model:value="store.payload.devices"
            :options="store.deviceList"
            :loading="store.deviceLoading || store.editLoading"
            :render-label="UIHelper.selectRender.label"
            :render-tag="UIHelper.selectRender.value"
            value-field="id"
            label-field="name"
            :max-tag-count="6"
            :reset-menu-on-options-change="true"
        >
          <template #header>
            <div class="w-full flex">
              <n-input
                  clearable
                  v-model:value="store.inputParam.search"
                  class="w-full skip-format"
                  :placeholder="$t('content.search')"
                  :on-keyup="onSearchEv"
                  @clear="onSearchEv"
              />
            </div>
          </template>
          <template #action>
            <n-checkbox @update:checked="onCheck" v-model:checked="store.inputParam.selectAll">
              <span class="text-secondary text-xs">{{$t('content.selectAll')}} - ({{store.deviceList.length}})</span>
            </n-checkbox>
          </template>
        </n-select>
      </n-form-item>

    </div>

    <div class="grid grid-cols-2 gap-2 mt-8">
      <n-button @click="store.visible=false" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button
          @click="onSubmit"
          :loading="store.saveLoading"
          type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>
