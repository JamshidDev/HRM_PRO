<script setup>
import {useAccountStore} from "@/store/modules/app/accountStore.js";
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
const store = useAccountStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store.saveLoading = true
      store._update()
    }
  })
}
</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.payload"
  >
    <div class="grid grid-cols-12 gap-x-4">
      <div class="col-span-12 mb-10">
        <p class="text-sm text-textColor3">{{$t('profilePage.account.title')}}</p>
        <p class="text-lg text-primary">{{store.account?.worker?.last_name + ' ' + store.account?.worker.first_name + ' '+store.account?.worker.middle_name}}</p>
        <n-alert type="warning" :title="$t('content.warning')" class="mt-4">
          {{$t('profilePage.account.warningText')}}
        </n-alert>
      </div>
      <n-form-item
          class="col-span-6"
          :label="$t(`profilePage.form.password`)"
          path="password"
          :rule-path="validationRules.rulesNames.requiredStringField"
      >
        <n-input
            type="text"
            v-model:value="store.payload.password"
            :rule-path="validationRules.rulesNames.requiredStringField"
        />
      </n-form-item>
      <n-form-item
          class="col-span-6"
          :label="$t(`profilePage.form.confirmPassword`)"
      >
        <n-input
            type="text"
            v-model:value="store.payload.password"
        />
      </n-form-item>
    </div>
    <div class="flex justify-end">
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