<script setup>
import {UIUpload} from "@/components/index.js"
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import { useUploadReportStore, useComponentStore} from "@/store/modules/index.js"
import ValidationRules from "@/utils/validationRules.js"
import Utils from "@/utils/Utils.js"
import i18n from "@/i18n/index.js"
const {t} = i18n.global

const store = useUploadReportStore()
const componentStore = useComponentStore()


const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      if(store.payload.file.length===0){
        $Toast.warning(t('rules.requiredFileField'))
        return
      }
      store.saveLoading = true
      if(store.visibleType){
        store._create()
      }else{
        store._update()
      }

    }
  })
}

onMounted(()=>{
  componentStore._enumAccountant()
})

</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.payload"
  >
    <div class="grid grid-cols-12 gap-x-2">
      <n-form-item
          class="col-span-12"
          :label="$t(`uploadReport.form.type`)"
          path="type"
          :rule-path="ValidationRules.rulesNames.requiredNumberField"
      >
        <n-select
            v-model:value="store.payload.type"
            :options="componentStore.uploadTypes"
            label-field="name"
            value-field="id"
            :loading="componentStore.accountantEnumLoading"
        />

      </n-form-item>
      <n-form-item
          class="col-span-6"
          :label="$t(`uploadReport.form.year`)"
          path="year"
          :rule-path="ValidationRules.rulesNames.requiredNumberField"
      >

        <n-select
            v-model:value="store.payload.year"
            :options="Utils.yearList"
            label-field="name"
            value-field="id"
        />

      </n-form-item>
      <n-form-item
          class="col-span-6"
          :label="$t(`uploadReport.form.month`)"
          path="month"
          :rule-path="ValidationRules.rulesNames.requiredNumberField"
      >
        <n-select
            v-model:value="store.payload.month"
            :options="Utils.monthList"
            label-field="name"
            value-field="id"
        />
      </n-form-item>
      <UIUpload
          class="col-span-12 mb-[40px]"
          v-model:files="store.payload.file"
          :multiple="false"
      >
      </UIUpload>


    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.openVisible(false)" type="error" ghost>
        {{$t('content.cancel')}}
      </n-button>
      <n-button
          @click="onSubmit"
          :loading="store.saveLoading"
          type="primary">
        {{$t('content.save')}}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped>

</style>