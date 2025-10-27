<script setup>
import {useDevicesStore} from "@/store/modules/index.js"
import validationRules from "@/utils/validationRules.js"

const formRef = ref(null)
const store = useDevicesStore()

const rules = {
  name: validationRules.required,
  serial_number: validationRules.required,
}

const onSubmit = () => {
  formRef.value?.validate((error) => {
    if (!error) {
      if(store.visibleType){
        store._create()
      } else {
        store._update()
      }
    }
  })
}

const onCancel = ()=>{
  store.resetForm()
}
</script>

<template>
<div class="w-full">
  <n-form
      ref="formRef"
      :model="store.payload"
      :rules="rules"
      label-placement="top"
      require-mark-placement="right-hanging"
      :style="{ maxWidth: '600px' }"
  >
    <n-form-item :label="$t('devices.name')" path="name">
      <n-input
          v-model:value="store.payload.name"
          :placeholder="$t('devices.namePlaceholder')"
      />
    </n-form-item>

    <n-form-item :label="$t('devices.ipAddress')" path="ip_address">
      <n-input
          v-model:value="store.payload.ip_address"
          :placeholder="$t('devices.ipAddressPlaceholder')"
      />
    </n-form-item>

    <n-form-item :label="$t('devices.macAddress')" path="mac_address">
      <n-input
          v-model:value="store.payload.mac_address"
          :placeholder="$t('devices.macAddressPlaceholder')"
      />
    </n-form-item>

    <n-form-item :label="$t('devices.serialNumber')" path="serial_number">
      <n-input
          v-model:value="store.payload.serial_number"
          :placeholder="$t('devices.serialNumberPlaceholder')"
      />
    </n-form-item>

    <n-form-item :label="$t('devices.status')" path="status">
      <n-switch
          v-model:value="store.payload.status"
          :checked-value="true"
          :unchecked-value="false"
      >
        <template #checked>
          {{ $t('devices.online') }}
        </template>
        <template #unchecked>
          {{ $t('devices.offline') }}
        </template>
      </n-switch>
    </n-form-item>

    <div class="flex justify-end gap-2 mt-6">
      <n-button @click="onCancel" :disabled="store.saveLoading">
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" type="primary" :loading="store.saveLoading">
        {{ store.visibleType ? $t('content.create') : $t('content.update') }}
      </n-button>
    </div>
  </n-form>
</div>
</template>
