<script setup>
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useCategoryStore} from "@/store/modules/index.js";


const store = useCategoryStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store.saveLoading = true
      if(store.visibleType){
        store._create()
      //   ok
      }else{
        store._update()
      }
    }
  })
}
</script>


<template>
  <div style="height:calc(100vh - 120px)" class="overflow-y-auto">
    <n-form
        ref="formRef"
        :model="store.payload"
        :rules="validationRules.common"
        class="h-full flex flex-col"
    >
      <n-form-item :label="$t(`content.name`)" path="name" rule-path="requiredStringField">
        <n-input
            type="text"

            v-model:value="store.payload.name"
        />
      </n-form-item>
      
    </n-form>
  </div>
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
</template>

<style scoped>

</style>