<script setup>
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {usePositionStore} from "@/store/modules/index.js";

const store = usePositionStore()

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
      :rules="validationRules.positionPage"
      :model="store.payload"
  >
    <div style="min-height:calc(100vh - 120px)">
      <n-form-item :label="$t(`positionPage.form.name`)" path="name">
        <n-input
            type="text"

            v-model:value="store.payload.name"
        />
      </n-form-item>
      <n-form-item :label="$t(`positionPage.form.name_ru`)" path="name_ru">
        <n-input
            type="text"

            v-model:value="store.payload.name_ru"
        />
      </n-form-item>
      <n-form-item :label="$t(`positionPage.form.classification_index`)" path="classification_index">
        <n-input
            type="text"

            v-model:value="store.payload.classification_index"
        />
      </n-form-item>
      <n-form-item :label="$t(`positionPage.form.classification_code`)" path="classification_code">
        <n-input
            type="text"

            v-model:value="store.payload.classification_code"
        />
      </n-form-item>
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