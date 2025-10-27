<script setup>
import validationRules from "@/utils/validationRules.js";
import {
  useTurnstileHikCentralStore,
} from "@/store/modules/index.js"

const formRef = ref(null)
const store = useTurnstileHikCentralStore()

const onSubmit = () => {
  formRef.value?.validate((error) => {
    if (!error) {
      store._update()
    }
  })
}

onMounted(()=>{
  store._department()
})



</script>


<template>
  <n-spin :show="false">
    <div class="overflow-y-auto">
      <n-form
          ref="formRef"
          :model="store.depPayload"
          :rules="validationRules.common"
          class="flex flex-col"
      >


        <n-form-item
            :label="$t(`turnstile.hcWorkersPage.department`)"
            path="hik_central_department_id"
            rule-path="requiredNumberField">
          <n-select
              v-model:value="store.depPayload.hik_central_department_id"
              filterable
              :options="store.departmentList"
              label-field="name"
              value-field="id"
              :loading="store.deviceLoading"
          >
          </n-select>
        </n-form-item>
        <n-form-item
            :label="$t(`turnstile.hcWorkersPage.device`)"
            path="devices"
            :rule-path="validationRules.rulesNames.requiredMultiSelectField">
          <n-select
              v-model:value="store.depPayload.devices"
              multiple
              filterable
              :max-tag-count="1"
              :options="store.deviceList"
              label-field="name"
              value-field="id"
              :loading="store.deviceLoading"
          >
          </n-select>
        </n-form-item>
      </n-form>


    </div>
    <div class="grid grid-cols-2 gap-2 mt-4">
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
