<script setup>
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useTicketStore, useComponentStore} from "@/store/modules/index.js"
import {useAppSetting} from "@/utils/index.js"

const store = useTicketStore()
const componentStore = useComponentStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      store._confirm()
    }
  })
}

onMounted(()=>{
  if(componentStore.medStatus.length === 0){
    componentStore._enums()
  }
})


</script>

<template>
  <div class="overflow-y-auto">
    <n-form
        ref="formRef"
        :rules="validationRules.common"
        :model="store.confirmPayload"
    >
      <n-form-item
          :label="$t(`content.status`)"
          path="med_status"
          :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-select
            v-model:value="store.confirmPayload.med_status"
            :options="componentStore.medStatus"
            :loading="componentStore.enumLoading"
            label-field="name"
            value-field="id"
        />
      </n-form-item>
      <n-form-item
          :label="$t(`ticket.confirm.med_date`)"
          :rule-path="validationRules.rulesNames.requiredNumberField"
          path="med_date">
        <n-date-picker
            class="w-full"
            v-model:value="store.confirmPayload.med_date"
            type="date"

            :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
      <n-form-item
          :label="$t(`ticket.confirm.to`)"
          :rule-path="validationRules.rulesNames.requiredNumberField"
          path="to">
        <n-date-picker
            class="w-full"
            v-model:value="store.confirmPayload.to"
            type="date"
            :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>

      <n-form-item
          :label="$t(`medPage.form.comment`)"
          path="comment">
        <n-input
            rows="2"
            type="textarea"
            v-model:value="store.confirmPayload.comment"
        />
      </n-form-item>
    </n-form>
  </div>
  <div class="grid grid-cols-2 gap-2">
    <n-button :loading="store.confirmLoading" @click="store.confirmVisible=false" type="error" ghost>
      {{ $t('content.cancel') }}
    </n-button>
    <n-button
        @click="onSubmit"
        :loading="store.confirmLoading"
        type="primary">
      {{ $t('content.save') }}
    </n-button>
  </div>


</template>

<style scoped>

</style>