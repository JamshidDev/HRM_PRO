<script setup>
import {UIAutoComplete} from "@/components/index.js"
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useConfirmationStore} from "@/store/modules/index.js";

const store = useConfirmationStore()

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
      :rules="validationRules.confirmation"
      :model="store.payload"
  >
    <div style="min-height:calc(100vh - 120px)">
      <UIAutoComplete v-model:pin="store.payload.pin" />
      <n-form-item :label="$t(`confirmationPage.table.position`)" path="position">
        <n-input
            type="text"
            :placeholder="$t(`content.enterField`)"
            v-model:value="store.payload.position"
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