<script setup>
import {useComponentStore, useAccountStore} from "@/store/modules/index.js"
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
const store = useAccountStore()
const componentStore = useComponentStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store.updateOrgInfo()
    }
  })
}

onMounted(()=>{
  componentStore._regions(1)
  store._getOrgInfo()
})
</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.orgPayload"
  >
    <div class="grid xl:grid-cols-3 lg:grid-cols-3 grid-cols-1 gap-x-4">
      <n-form-item :label="$t(`profilePage.org.command_name`)" path="command_address" :rule-path="validationRules.rulesNames.requiredStringField">
        <n-input
            type="text"
            v-model:value="store.orgPayload.command_address"
        />
      </n-form-item>
      <n-form-item :label="$t(`profilePage.org.address`)" path="address"
                   :rule-path="validationRules.rulesNames.requiredStringField"
      >
        <n-input
            type="text"
            v-model:value="store.orgPayload.address"
        />
      </n-form-item>
      <n-form-item
          :label="$t(`profilePage.org.region_id`)"
      >
        <n-select
            v-model:value="store.region_id"
            @update:value="store.changeRegion"
            filterable
            clearable
            :options="componentStore.regionList"
            label-field="name"
            value-field="id"
            :loading="componentStore.regionLoading"
        />
      </n-form-item>
      <n-form-item
          :label="$t(`profilePage.org.city_id`)"
          :rule-path="validationRules.rulesNames.requiredNumberField"
          path="city_id">
        <n-select
            v-model:value="store.orgPayload.city_id"
            filterable
            clearable
            :options="store.districtList"
            label-field="name"
            value-field="id"
            :loading="store.districtLoading"
        />
      </n-form-item>
    </div>
    <div class="flex justify-end">
      <n-button
          @click="onSubmit"
          :loading="store.saveLoading || store.orgLoading"
          type="primary">
        {{$t('content.save')}}
      </n-button>
    </div>

  </n-form>
</template>
