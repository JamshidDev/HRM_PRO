<script setup>

import validationRules from "@/utils/validationRules.js";
import {ChevronLeft20Filled,QrCode20Filled,ErrorCircle12Filled} from "@vicons/fluent";
import {useRegisterStore} from "@/store/modules/app/registrStore.js";
import Utils from "../../../../utils/Utils.js"

const store = useRegisterStore()
const formRef = ref(null)

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store.registerUser()
    }
  })
}
</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.verificationEmail"
      :model="store.create"
      class="xl:w-[400px] w-[360px] p-[20px] flex flex-col"
  >
    <div>
      <n-button @click="store.activeTab=1" quaternary class="px-0!">
        <span class="text-gray-400">{{$t('content.back')}}</span>
        <template #icon>
          <n-icon class="font-bold" size="24"><ChevronLeft20Filled /></n-icon>
        </template>
      </n-button>
    </div>
    <div class="w-full my-5">
      <span class="text-2xl font-bold text-center block uppercase text-primary">{{ $t(`registerPage.subtitle`) }}</span>
      <span class="text-xs text-center block text-gray-500">{{ $t(`registerPage.verification`,{n:Utils.maskText(store.payload.phone || '', 0, 4)}) }}</span>
    </div>
    <div
        v-if="store.otpErrorMessage"
        class="border border-red-200 bg-red-50 text-sm p-2 rounded-[6px] text-red-500 flex items-center gap-2 mb-4">
      <n-icon size="20">
        <ErrorCircle12Filled/>
      </n-icon>
      {{store.otpErrorMessage}}
    </div>
    <n-form-item :label="$t(`registerPage.otp`)" path="otp">
      <n-input
          type="text"
          maxlength="6"
          size="large"
          name="password"
          id="password"
          v-mask="'######'"
          :placeholder="$t(`registerPage.otp`)"
          v-model:value="store.create.otp"
      >
        <template #prefix>
          <n-icon size="24" :component="QrCode20Filled" />
        </template>
      </n-input>
    </n-form-item>
    <n-form-item
        :show-feedback="false"
    >
      <n-button
          size="large"
          class="mt-4 flex w-full!"
          type="primary"
          :loading="store.otpLoading"
          @click="onSubmit"
      >{{$t(`registerPage.subtitle`)}}</n-button>
    </n-form-item>
    <div class="flex justify-between w-full text-xs text-gray-500 mt-10">
      <span class="text-xs ">{{$t('registerPage.reSendOtp')}}</span>
      <n-countdown
          v-if="!store.showReSendButton"
          :duration="Number(store.otpExpireTime)"
          :active="!store.showReSendButton"
          @finish="store.onFinish"
      />
      <n-button
          @click="store.reSendOtp()"
          v-if="store.showReSendButton"
          size="tiny"
          type="success"
      >{{$t(`registerPage.getOtp`)}}</n-button>

    </div>
  </n-form>
</template>
