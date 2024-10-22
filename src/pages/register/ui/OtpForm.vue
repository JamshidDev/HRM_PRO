<script setup>

import validationRules from "@/utils/validationRules.js";
import {Call28Regular, Password20Regular, Person24Regular} from "@vicons/fluent";
import {AppPaths} from "@/utils/index.js";
import {useRegisterStore} from "@/store/modules/registrStore.js";
import {useRouter} from "vue-router";

const store = useRegisterStore()
const formRef = ref(null)
const router = useRouter()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      // store._register()
      store.activeTab=2
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
          type="text"
          :placeholder="$t(`registerPage.firstName`)"
          v-model:value="store.payload.first_name"
      >
        <template #prefix>
          <n-icon :component="Person24Regular" />
        </template>
      </n-input>
    </n-form-item>
    <n-form-item :label="$t(`registerPage.lastName`)" path="last_name">
      <n-input
          type="text"
          :placeholder="$t(`registerPage.lastName`)"
          v-model:value="store.payload.last_name"
      >
        <template #prefix>
          <n-icon :component="Person24Regular" />
        </template>
      </n-input>
    </n-form-item>
    <n-form-item :label="$t(`registerPage.middleName`)" path="middle_name">
      <n-input
          type="text"
          :placeholder="$t(`registerPage.middleName`)"
          v-model:value="store.payload.middle_name"
      >
        <template #prefix>
          <n-icon :component="Person24Regular" />
        </template>
      </n-input>
    </n-form-item>
    <n-form-item :label="$t(`loginPage.phone`)" path="phone">
      <n-input
          name="login"
          id="login"
          type="text"
          v-mask="'+998(##)########'"
          :placeholder="'+998'"
          v-model:value="store.payload.phone"
      >
        <template #prefix>
          <n-icon :component="Call28Regular" />
        </template>
      </n-input>
    </n-form-item>
    <n-form-item :label="$t(`registerPage.pin`)" path="pin">
      <n-input
          type="text"
          :maxlength="17"
          :placeholder="$t(`registerPage.pin`)"
          v-model:value="store.payload.pin"
          v-mask="'####-####-####-##'"
      >
        <template #prefix>
          <n-icon :component="Password20Regular" />
        </template>
      </n-input>
    </n-form-item>
    <n-form-item
        :show-feedback="false"
    >
      <n-button
          class="mt-4 flex !w-full"
          type="info"
          :loading="store.loading"
          @click="onSubmit"
      >{{$t(`registerPage.title`)}}</n-button>
    </n-form-item>
    <span class="text-xs mt-3">{{$t('registerPage.doYouHaveAccount')}} <span class="text-primary" @click="router.push(AppPaths.Login)" >{{$t('registerPage.loginToSystem')}}</span> </span>
  </n-form>
</template>

<style scoped>

</style>