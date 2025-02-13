<script setup>
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useTopicCategoryStore} from "@/store/modules/index.js";


const store = useTopicCategoryStore()

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
    <n-form-item :label="$t(`content.name`)" path="name" rule-path="requiredStringField">
      <n-input
          type="text"
          :placeholder="$t(`content.enterField`)"
          v-model:value="store.payload.name"
      />
    </n-form-item>
    <div class="grid grid-cols-2 gap-2 mt-auto">
      <n-button ghost type="error" @click="store.openVisible(false)">
        {{ $t('content.cancel') }}
      </n-button>
      <n-button
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