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
      :rules="validationRules.profilePage"
      :model="store.payload"
  >
    <div class="grid xl:grid-cols-3 lg:grid-cols-3 grid-cols-1 gap-x-4">
      <n-form-item :label="$t(`profilePage.form.lastName`)" path="last_name">
        <n-input
            type="text"
            :placeholder="$t(`profilePage.form.lastName`)"
            v-model:value="store.payload.last_name"
        />
      </n-form-item>
      <n-form-item :label="$t(`profilePage.form.fistName`)" path="first_name">
        <n-input
            type="text"
            :placeholder="$t(`profilePage.form.fistName`)"
            v-model:value="store.payload.first_name"
        />
      </n-form-item>
      <n-form-item :label="$t(`profilePage.form.middleName`)" path="middle_name">
        <n-input
            type="text"
            :placeholder="$t(`profilePage.form.middleName`)"
            v-model:value="store.payload.middle_name"
        />
      </n-form-item>
      <n-form-item :label="$t(`profilePage.form.password`)" path="password">
        <n-input
            type="text"
            :placeholder="$t(`profilePage.form.password`)"
            v-model:value="store.payload.password"
        />
      </n-form-item>
      <n-form-item :label="$t(`profilePage.form.confirmPassword`)">
        <n-input
            type="text"
            :placeholder="$t(`profilePage.form.confirmPassword`)"
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