<script setup>
  import validationRules from '@/utils/validationRules.js'
  import {
    ChevronLeft20Filled,
    Call24Regular,
    LockClosed24Regular,
    Eye24Regular,
    EyeOff24Regular,
    ErrorCircle12Filled
  } from '@vicons/fluent'
  import { useResetPasswordStore, resetSteps } from '@/store/modules/index.js'
  import OtpBoxInput from './OtpBoxInput.vue'

  // ?start= parametri Telegram deep-link: bot ochilganda "START" darhol yuboriladi
  const isProdMode = import.meta.env.MODE === 'production'
  const resetBotHandle = isProdMode ? '@hrmpro_robot' : '@developer_jr_bot'
  const resetBotUrl = isProdMode
    ? 'https://t.me/hrmpro_robot?start=web-test123'
    : 'https://t.me/developer_jr_bot?start=web-test123'

  const emit = defineEmits(['back', 'done'])

  const store = useResetPasswordStore()
  const formRef = ref(null)

  // +998(##)####### to'liq kiritilganda 15 ta belgi bo'ladi
  const phoneFilled = computed(() => (store.phone || '').length === 15)

  // faqat kerakli qadam maydonlarini validatsiya qilish uchun
  const validateKey = (key, onValid) => {
    formRef.value?.validate(
      (error) => {
        if (!error) onValid()
      },
      (rule) => rule?.key === key
    )
  }

  const onSendCode = () => {
    store._sendCode()
  }

  const onVerify = () => {
    validateKey('code', () => store._verifyCode())
  }

  const onCodeComplete = () => {
    onVerify()
  }

  const onSubmit = () => {
    validateKey('password', () => store._resetPassword(() => emit('done')))
  }

  const onBack = () => {
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

    <div class="mb-8 text-center">
      <h3 class="text-3xl font-bold uppercase leading-tight">
        {{ $t('loginPage.resetPassword.title') }}
      </h3>
      <p class="text-textColor2 mt-2 leading-snug">
        <template v-if="store.step === resetSteps.request">
          {{ $t('loginPage.resetPassword.requestSubtitlePrefix') }}
          <a
            :href="resetBotUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium hover:underline"
            style="color: #1677ff"
          >{{ resetBotHandle }}</a>
          {{ $t('loginPage.resetPassword.requestSubtitleSuffix') }}
        </template>
        <template v-else-if="store.step === resetSteps.code">
          {{ $t('loginPage.resetPassword.codeSubtitlePrefix') }}
          <a
            :href="resetBotUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium hover:underline"
            style="color: #1677ff"
          >{{ resetBotHandle }}</a>
          {{ $t('loginPage.resetPassword.codeSubtitleSuffix') }}
        </template>
        <template v-else>
          {{ $t('loginPage.resetPassword.passwordSubtitle') }}
        </template>
      </p>
    </div>

    <div
      v-if="store.errorMessage"
      class="border border-red-200 bg-red-50 text-sm p-2 rounded-[6px] text-red-500 flex items-center gap-2 mb-4"
    >
      <n-icon size="20">
        <ErrorCircle12Filled />
      </n-icon>
      {{ store.errorMessage }}
    </div>

    <n-form ref="formRef" :rules="validationRules.resetPassword" :model="store" class="flex flex-col">
      <!-- 1-qadam: telefon raqamni tasdiqlab kod yuborish -->
      <template v-if="store.step === resetSteps.request">
        <n-form-item class="text-textColor2!" :label="$t(`loginPage.phone`)" path="phone">
          <n-input
            size="large"
            class="login-new__input"
            type="text"
            v-mask="'+998(##)#######'"
            v-model:value="store.phone"
            @keyup.enter="onSendCode"
          >
            <template #prefix>
              <n-icon class="text-textColor3!" size="24" :component="Call24Regular" />
            </template>
          </n-input>
        </n-form-item>
        <n-button
          class="login-new__submit h-[52px]! rounded-2xl! overflow-hidden! font-semibold!"
          size="large"
          :loading="store.loading"
          :disabled="!phoneFilled"
          @click="onSendCode"
        >
          {{ $t('loginPage.resetPassword.sendCode') }}
        </n-button>
      </template>

      <!-- 2-qadam: tasdiqlash kodi -->
      <template v-else-if="store.step === resetSteps.code">
        <n-form-item
          class="text-textColor2! otp-form-item"
          :label="$t('loginPage.resetPassword.code')"
          path="code"
        >
          <OtpBoxInput v-model="store.code" :length="6" @complete="onCodeComplete" />
        </n-form-item>
        <n-button
          class="login-new__submit h-[52px]! rounded-2xl! overflow-hidden! font-semibold!"
          size="large"
          :loading="store.loading"
          @click="onVerify"
        >
          {{ $t('loginPage.resetPassword.verify') }}
        </n-button>
      </template>

      <!-- 3-qadam: yangi parol -->
      <template v-else>
        <n-form-item
          class="text-textColor2!"
          :label="$t('loginPage.resetPassword.newPassword')"
          path="password"
        >
          <n-input
            size="large"
            class="login-new__input"
            type="password"
            show-password-on="click"
            :maxlength="60"
            v-model:value="store.password"
          >
            <template #prefix>
              <n-icon class="text-textColor3!" size="24" :component="LockClosed24Regular" />
            </template>
            <template #password-visible-icon>
              <n-icon :size="20" :component="EyeOff24Regular" />
            </template>
            <template #password-invisible-icon>
              <n-icon :size="20" :component="Eye24Regular" />
            </template>
          </n-input>
        </n-form-item>
        <n-form-item
          class="text-textColor2!"
          :label="$t('loginPage.resetPassword.confirmPassword')"
          path="confirmPassword"
        >
          <n-input
            size="large"
            class="login-new__input"
            type="password"
            show-password-on="click"
            :maxlength="60"
            v-model:value="store.confirmPassword"
            @keyup.enter="onSubmit"
          >
            <template #prefix>
              <n-icon class="text-textColor3!" size="24" :component="LockClosed24Regular" />
            </template>
            <template #password-visible-icon>
              <n-icon :size="20" :component="EyeOff24Regular" />
            </template>
            <template #password-invisible-icon>
              <n-icon :size="20" :component="Eye24Regular" />
            </template>
          </n-input>
        </n-form-item>
        <n-button
          class="login-new__submit h-[52px]! rounded-2xl! overflow-hidden! font-semibold!"
          size="large"
          :loading="store.loading"
          @click="onSubmit"
        >
          {{ $t('loginPage.resetPassword.submit') }}
        </n-button>
      </template>
    </n-form>
  </div>
</template>

<style scoped>
  .otp-form-item :deep(.n-form-item-label) {
    width: 100%;
    justify-content: center;
    text-align: center;
  }

  .otp-form-item :deep(.n-form-item-blank) {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .otp-form-item :deep(.n-form-item-feedback-wrapper) {
    text-align: center;
  }
</style>
