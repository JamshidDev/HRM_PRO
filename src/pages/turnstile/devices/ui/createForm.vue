<script setup>
  import { useDevicesStore, useComponentStore } from '@/store/modules/index.js'
  import validationRules from '@/utils/validationRules.js'
  import { UINSelect, UISelect } from '@/components/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import Utils from '@/utils/Utils.js'

  const formRef = ref(null)
  const store = useDevicesStore()
  const componentStore = useComponentStore()

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        const data = store.isAdmin
          ? {
              ...store.payload,
              contract_date: Utils.timeToZone(store.payload.contract_date),
              organization_id:
                store.payload.organization_id.map((v) => v.id).toString() || undefined,
              device_id: store.visibleType ? undefined : store.payload.device_id
            }
          : {
              ip_address: store.payload.ip_address,
              mac_address: store.payload.mac_address
            }
        if (store.visibleType) {
          store._create(data)
        } else {
          store._update(data)
        }
      }
    })
  }

  onMounted(() => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }

    if (store.deviceList.length === 0) {
      store._deviceList()
    }
  })
</script>

<template>
  <div>
    <div class="w-full h-[80vh] overflow-y-auto">
      <n-form
        ref="formRef"
        :model="store.payload"
        :rules="validationRules.common"
        class="grid grid-cols-12 gap-x-4"
      >
        <template v-if="store.isAdmin">
          <n-form-item
            class="col-span-12"
            :label="$t(`content.organization`)"
            path="organization_id"
            :rule-path="validationRules.rulesNames.requiredMultiSelectField"
          >
            <UISelect
              :options="componentStore.structureList"
              :modelV="store.payload.organization_id"
              @updateModel="(v) => (store.payload.organization_id = v)"
              :checkedVal="store.structureCheck2"
              @updateCheck="(v) => (store.structureCheck2 = v)"
              :loading="componentStore.structureLoading"
              v-model:search="componentStore.structureParams.search"
              @onSearch="componentStore._structures"
              :multiple="false"
            />
          </n-form-item>
          <n-form-item
            v-if="!store.visibleType"
            class="col-span-12"
            :label="$t(`devices.deviceName`)"
            path="device_id"
          >
            <UINSelect
              clearable
              v-model:value="store.payload.device_id"
              :options="store.deviceList"
              value-field="id"
              :loading="store.deviceLoading"
            />
          </n-form-item>
          <n-form-item class="col-span-12" :label="$t('content.name')" path="name">
            <n-input v-model:value="store.payload.name" />
          </n-form-item>
        </template>

        <n-form-item class="col-span-6" :label="$t('devices.ipAddress')" path="ip_address">
          <n-input v-model:value="store.payload.ip_address" />
        </n-form-item>
        <n-form-item class="col-span-6" :label="$t('devices.macAddress')" path="mac_address">
          <n-input v-model:value="store.payload.mac_address" />
        </n-form-item>

        <template v-if="store.isAdmin">
          <n-form-item class="col-span-6" :label="$t('devices.device_code')" path="device_code">
            <n-input v-model:value="store.payload.device_code" />
          </n-form-item>
          <n-form-item class="col-span-6" :label="$t('devices.config')" path="config">
            <n-switch
              v-model:value="store.payload.config"
              :checked-value="true"
              :unchecked-value="false"
            >
              <template #checked>
                {{ $t('content.active') }}
              </template>
              <template #unchecked>
                {{ $t('content.noActive') }}
              </template>
            </n-switch>
          </n-form-item>
          <n-form-item class="col-span-6" :label="$t('devices.log')" path="log">
            <n-switch
              v-model:value="store.payload.log"
              :checked-value="true"
              :unchecked-value="false"
            >
              <template #checked>
                {{ $t('content.active') }}
              </template>
              <template #unchecked>
                {{ $t('content.noActive') }}
              </template>
            </n-switch>
          </n-form-item>
          <n-form-item
            class="col-span-6"
            :label="$t('devices.upload_workers')"
            path="upload_workers"
          >
            <n-switch
              v-model:value="store.payload.upload_workers"
              :checked-value="true"
              :unchecked-value="false"
            >
              <template #checked>
                {{ $t('content.active') }}
              </template>
              <template #unchecked>
                {{ $t('content.noActive') }}
              </template>
            </n-switch>
          </n-form-item>

          <div class="col-span-12">
            <div
              class="grid grid-cols-12 gap-x-4 bg-surface-ground p-2 rounded-lg border border-surface-line"
            >
              <h3 class="col-span-12 text-center mb-4 text-secondary">
                {{ $t('devices.contractTitle') }}
              </h3>
              <n-form-item
                class="col-span-6"
                :label="$t('documentPage.form.contractNumber')"
                path="contract_number"
              >
                <n-input v-model:value="store.payload.contract_number" />
              </n-form-item>
              <n-form-item
                class="col-span-6"
                :label="$t('documentPage.form.contractDate')"
                path="contract_date"
              >
                <n-date-picker
                  class="w-full"
                  v-model:value="store.payload.contract_date"
                  type="date"
                  update-value-on-close
                  :actions="null"
                  clearable
                  :format="useAppSetting.datePicketFormat"
                />
              </n-form-item>
              <n-form-item class="col-span-12" :label="$t('content.price')" path="price">
                <n-input v-model:value="store.payload.price" />
              </n-form-item>
            </div>
          </div>
        </template>
      </n-form>
    </div>
    <div class="grid grid-cols-2 gap-2 mt-8 col-span-12">
      <n-button @click="store.visible = false" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </div>
</template>
