<script setup>
import validationRules from "@/utils/validationRules.js";
import { useTurnstileBuildingStore } from "@/store/modules/index.js";


const formRef = ref(null)
const store = useTurnstileBuildingStore()

const onSubmit = () => {
  formRef.value?.validate((error) => {
    if (!error) {
      store.saveLoading = true
      if (store.visibleType) {
        store._create()
      } else {
        store._update()
      }
    }
  })
}

</script>


<template>
  <div style="height:calc(100vh - 120px)" class="overflow-y-auto">
    <n-form ref="formRef" :model="store.payload" :rules="validationRules.common">

      <n-form-item :label="$t(`turnstile.buildingPage.name`)" path="name" rule-path="requiredStringField">
        <n-input type="text"  v-model:value="store.payload.name" />
      </n-form-item>
      <n-form-item :label="$t(`turnstile.buildingPage.name_ru`)" path="name_ru" rule-path="requiredStringField">
        <n-input type="text"  v-model:value="store.payload.name_ru" />
      </n-form-item>
      <n-form-item :label="$t(`turnstile.buildingPage.name_en`)" path="name_en" rule-path="requiredStringField">
        <n-input type="text"  v-model:value="store.payload.name_en" />
      </n-form-item>
    </n-form>


  </div>
  <div class="grid grid-cols-2 gap-2">
    <n-button @click="store.openVisible(false)" type="error" ghost>
      {{ $t('content.cancel') }}
    </n-button>
    <n-button :loading="store.saveLoading" type="primary" @click="onSubmit">
      {{ $t('content.save') }}
    </n-button>
  </div>


</template>
