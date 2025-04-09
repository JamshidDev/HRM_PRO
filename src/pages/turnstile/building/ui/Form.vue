<script setup>
import validationRules from "@/utils/validationRules.js";
import {useTurnstileBuildingStore} from "@/store/modules/index.js";


const formRef = ref(null)
const store = useTurnstileBuildingStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store.saveLoading = true
      if(store.visibleType){
        store._create()
      }else{
        store._update()
      }
    }
  })
}

</script>

<template>
  <n-form
      ref="formRef"
      :model="store.payload"
      :rules="validationRules.common"
      class="h-full flex flex-col"
  >
    <n-form-item :label="$t(`turnstile.buildingPage.name`)" path="name" rule-path="requiredStringField">
      <n-input
          type="text"
          :placeholder="$t(`content.enterField`)"
          v-model:value="store.payload.name"
      />
    </n-form-item>
    <n-form-item :label="$t(`turnstile.buildingPage.name_ru`)" path="name_ru" rule-path="requiredStringField">
      <n-input
          type="text"
          :placeholder="$t(`content.enterField`)"
          v-model:value="store.payload.name_ru"
      />
    </n-form-item>
    <n-form-item :label="$t(`turnstile.buildingPage.name_en`)" path="name_en" rule-path="requiredStringField">
      <n-input
          type="text"
          :placeholder="$t(`content.enterField`)"
          v-model:value="store.payload.name_en"
      />
    </n-form-item>
    <div class="mt-auto">
      <n-button
          block
          :loading="store.saveLoading"
          type="primary"
          @click="onSubmit">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped>

</style>