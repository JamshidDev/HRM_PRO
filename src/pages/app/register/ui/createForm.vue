
<script setup>

import validationRules from "@/utils/validationRules.js";
import {
  Call28Regular,
  Eye24Regular,
  EyeOff20Filled,
  LockClosed16Regular,
  Password20Regular,
  Person24Regular
} from "@vicons/fluent";
import {AppPaths} from "@/utils/index.js";
import {useRegisterStore} from "@/store/modules/app/registrStore.js";
import {useRouter} from "vue-router";

const store = useRegisterStore()
const formRef = ref(null)
const router = useRouter()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store._registerOtp()
    }
  })
}
</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.register"
      :model="store.payload"
      class="xl:w-[400px] w-[360px] p-[20px] flex flex-col"
  >
    <div class="w-full">
      <span class="text-2xl font-bold text-center block uppercase">{{ $t(`registerPage.title`) }}</span>
    </div>
    <n-form-item :label="$t(`registerPage.firstName`)" path="first_name">
      <n-input
          size="large"
          name="firstName"
          id="firstName"
          type="text"
          :placeholder="$t(`registerPage.firstName`)"
          v-model:value="store.payload.first_name"
      >
        <template #prefix>
          <n-icon size="24" :component="Person24Regular" />
        </template>
      </n-input>
    </n-form-item>
    <n-form-item :label="$t(`registerPage.lastName`)" path="last_name">
      <n-input
          size="large"
          name="lastName"
          id="lastName"
          type="text"
          :placeholder="$t(`registerPage.lastName`)"
          v-model:value="store.payload.last_name"
      >
        <template #prefix>
          <n-icon size="24" :component="Person24Regular" />
        </template>
      </n-input>
    </n-form-item>
    <n-form-item :label="$t(`registerPage.middleName`)" path="middle_name">
      <n-input
          size="large"
          name="middleName"
          id="middleName"
          type="text"
          :placeholder="$t(`registerPage.middleName`)"
          v-model:value="store.payload.middle_name"
      >
        <template #prefix>
          <n-icon  size="24" :component="Person24Regular" />
        </template>
      </n-input>
    </n-form-item>
    <n-form-item :label="$t(`loginPage.phone`)" path="phone">
      <n-input
          size="large"
          name="phone"
          id="phone"
          type="text"
          v-mask="'+998(##)########'"
          :placeholder="'+998'"
          maxlength="15"
          v-model:value="store.payload.phone"
      >
        <template #prefix>
          <n-icon size="24" :component="Call28Regular" />
        </template>
      </n-input>
    </n-form-item>
    <n-form-item :label="$t(`registerPage.pin`)" path="pin">
      <n-input
          size="large"
          type="text"
          :maxlength="17"
          :placeholder="$t(`registerPage.pin`)"
          v-model:value="store.payload.pin"
          v-mask="'####-####-####-##'"
      >
        <template #prefix>
          <n-icon size="24" :component="Password20Regular" />
        </template>
      </n-input>
    </n-form-item>
    <n-form-item :label="$t(`loginPage.password`)" path="password">
      <n-input
          size="large"
          name="password"
          id="password"
          type="password"
          show-password-on="click"
          :maxlength="16"
          :placeholder="$t(`loginPage.password`)"
          v-model:value="store.payload.password"
      >
        <template #prefix>
          <n-icon size="24" :component="LockClosed16Regular" />
        </template>

        <template #password-visible-icon>
          <n-icon :size="24" :component="EyeOff20Filled" />
        </template>
        <template #password-invisible-icon>
          <n-icon :size="24" :component="Eye24Regular" />
        </template>
      </n-input>
    </n-form-item>
    <n-form-item
        :show-feedback="false"
    >
      <n-button
          class="mt-4 flex w-full!"
          size="large"
          type="primary"
          :loading="store.loading"
          @click="onSubmit"
      >{{$t(`registerPage.title`)}}</n-button>
    </n-form-item>
    <span class="text-xs mt-3">{{$t('registerPage.doYouHaveAccount')}} <span class="text-primary" @click="router.push(AppPaths.Login)" >{{$t('registerPage.loginToSystem')}}</span> </span>
  </n-form>
</template>

<style scoped>

</style>