<script setup>
  import validationRules from '@/utils/validationRules.js'
  import {
    ChevronLeft20Filled,
    QrCode20Filled,
    ErrorCircle12Filled
  } from '@vicons/fluent'
  import { useLoginStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'

  const emit = defineEmits(['back'])

  const store = useLoginStore()
  const formRef = ref(null)

  const maskedPhone = computed(() => Utils.maskText(store.phone || '', 0, 4))

  const onVerify = () => {
    formRef.value?.validate((error) => {
      if (!error) store._verifyTwoFactor()
    })
  }

  const onBack = () => {
    store.cancelTwoFactor()
    emit('back')
  }
</script>

<template>
  <div class="w-full">
    <div class="mb-2">
      <n-button text class="text-textColor3!" @click="onBack">
        <template #icon>
          <n-icon size="22"><ChevronLeft20Filled /></n-icon>
        </template>
        {{ $t('content.back') }}
      </n-button>
    </div>

    <div class="mb-8">
      <h3 class="text-3xl font-bold uppercase leading-tight">
        {{ $t('loginPage.twoFactor.title') }}
      </h3>
      <p class="text-textColor2 mt-2 leading-snug">
        {{ $t('loginPage.twoFactor.subtitle', { n: maskedPhone }) }}
      </p>
    </div>

    <div
      v-if="store.codeError"
      class="border border-red-200 bg-red-50 text-sm p-2 rounded-[6px] text-red-500 flex items-center gap-2 mb-4"
    >
      <n-icon size="20">
        <ErrorCircle12Filled />
      </n-icon>
      {{ store.codeError }}
    </div>

    <n-form ref="formRef" :rules="validationRules.twoFactor" :model="store" class="flex flex-col">
      <n-form-item class="text-textColor2!" :label="$t('loginPage.twoFactor.code')" path="code">
        <n-input
          size="large"
          type="text"
          maxlength="6"
          v-mask="'######'"
          v-model:value="store.code"
          @keyup.enter="onVerify"
        >
          <template #prefix>
            <n-icon class="text-textColor3!" size="24" :component="QrCode20Filled" />
          </template>
        </n-input>
      </n-form-item>
      <n-button
        class="login-new__submit h-[52px]! rounded-2xl! overflow-hidden! font-semibold!"
        size="large"
        :loading="store.loading"
        @click="onVerify"
      >
        {{ $t('loginPage.twoFactor.verify') }}
      </n-button>
      <div class="flex justify-between items-center w-full text-xs text-textColor3 mt-4">
        <span>{{ $t('loginPage.twoFactor.reSendCode') }}</span>
        <n-countdown
          v-if="!store.showReSendButton"
          :duration="Number(store.otpExpireTime)"
          :active="!store.showReSendButton"
          @finish="store.onFinish"
        />
        <n-button
          v-else
          size="tiny"
          type="primary"
          :loading="store.loading"
          @click="store._resendTwoFactor()"
        >
          {{ $t('loginPage.twoFactor.reSendCode') }}
        </n-button>
      </div>
    </n-form>
  </div>
</template>
