<script setup>
import validationRules from "@/utils/validationRules.js";
import {useEventStore} from "@/store/modules/index.js"
import {useAppSetting} from "@/utils/index.js"
import UINSelect from "@/components/ui/UINSelect.vue";
  
const formRef = ref(null)

const store = useEventStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      store._syncEvent()
    }
  })
}




onMounted(()=>{
  store._levels()
})
</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.syncPayload"

  >
    <div>
      <n-form-item
          class="w-full"
          :label="$t(`content.date`)"
          path="from_date"
          :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-date-picker
            class="w-full"
            v-model:value="store.syncPayload.from_date"
            type="date"
            update-value-on-close
            :actions="null"
            :format="useAppSetting.datePicketFormat"
            clearable />
      </n-form-item>
      <n-form-item
          :label="$t(`hcServer.form.access_level_id`)"
          path="access_level_ids"
          :rule-path="validationRules.rulesNames.requiredMultiSelectField">
        <UINSelect
            :options="store.levelList"
            :loading="store.levelLoading"
            v-model:value="store.syncPayload.access_level_ids"
            value-field="id"
            label-field="name"
            :max-tag-count="2"
            multiple
        >
        </UINSelect>

      </n-form-item>

    </div>

    <div class="grid grid-cols-2 gap-2 mt-8">
      <n-button @click="store.visible=false" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button
          @click="onSubmit"
          :loading="store.syncLoading"
          type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped>

</style>