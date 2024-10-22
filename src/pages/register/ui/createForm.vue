<script setup>

import validationRules from "@/utils/validationRules.js";
import {Eye24Regular, EyeOff20Filled, ChevronLeft20Filled,QrCode20Filled, LockClosed16Regular} from "@vicons/fluent";
import {useRegisterStore} from "@/store/modules/registrStore.js";

const store = useRegisterStore()
const formRef = ref(null)

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store._register()
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
    <div>
      <n-button @click="store.activeTab=1" quaternary class="!px-0">
        <span class="text-gray-400">{{$t('content.back')}}</span>
        <template #icon>
          <n-icon class="font-bold" size="24"><ChevronLeft20Filled /></n-icon>
        </template>
      </n-button>
    </div>
    <div class="w-full">
      <span class="text-2xl font-bold text-center block uppercase text-primary">{{ $t(`registerPage.subtitle`) }}</span>
      <span class="text-xs text-center block text-gray-500">{{ $t(`registerPage.verification`) }}</span>
    </div>
    <n-form-item :label="$t(`registerPage.otp`)" path="otp">
      <n-input
          type="text"
          maxlength="6"
          v-mask="'######'"
          :placeholder="$t(`registerPage.otp`)"
          v-model:value="store.create.otp"
      >
        <template #prefix>
          <n-icon :component="QrCode20Filled" />
        </template>
      </n-input>
    </n-form-item>
    <n-form-item :label="$t(`loginPage.password`)" path="last_name">
      <n-input
          name="password"
          id="password"
          type="password"
          show-password-on="click"
          :maxlength="16"
          :placeholder="$t(`loginPage.password`)"
          v-model:value="store.create.password"
      >
        <template #prefix>
          <n-icon :component="LockClosed16Regular" />
        </template>

        <template #password-visible-icon>
          <n-icon :size="16" :component="EyeOff20Filled" />
        </template>
        <template #password-invisible-icon>
          <n-icon :size="16" :component="Eye24Regular" />
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
      >{{$t(`registerPage.subtitle`)}}</n-button>
    </n-form-item>
  </n-form>
</template>

<style scoped>

</style>