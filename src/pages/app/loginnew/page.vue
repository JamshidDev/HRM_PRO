<script setup>
  import LangDropdown from '@/components/general/LangDropdown.vue'
  import { useAppSetting } from '@/utils/index.js'
  import { useLoginStore, useResetPasswordStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import LoginForm from './ui/LoginForm.vue'
  import TwoFactorForm from './ui/TwoFactorForm.vue'
  import ResetForm from './ui/ResetForm.vue'

  const loginStore = useLoginStore()
  const resetStore = useResetPasswordStore()

  const steps = { login: 'login', twofa: 'twofa', reset: 'reset' }
  const step = ref(steps.login)

  // o'tish yo'nalishi: oldinga (slide-next) yoki orqaga (slide-prev)
  const transitionName = ref('slide-next')

  // backend 2FA talab qilsa kod qadamiga, bekor qilinsa loginga qaytamiz
  watch(
    () => loginStore.twoFactorRequired,
    (required) => {
      transitionName.value = required ? 'slide-next' : 'slide-prev'
      step.value = required ? steps.twofa : steps.login
    }
  )

  // LoginForm'dagi "Parolni unutdingizmi?" — telefonni olib reset qadamiga o'tamiz
  const onForgot = (phone) => {
    resetStore.start(phone)
    transitionName.value = 'slide-next'
    step.value = steps.reset
  }

  const toLogin = () => {
    transitionName.value = 'slide-prev'
    step.value = steps.login
  }

  // Parol yangilangach login qadamiga qaytamiz
  const onDone = () => {
    transitionName.value = 'slide-prev'
    step.value = steps.login
    window.$message?.success(i18n.global.t('loginPage.resetPassword.success'))
  }
</script>

<template>
  <div class="login-new min-h-screen w-full flex text-textColor0">
    <!-- Left brand / hero panel -->
    <div class="login-new__hero relative hidden lg:flex flex-col justify-between overflow-hidden">
      <div class="login-new__glow login-new__glow-1"></div>
      <div class="login-new__glow login-new__glow-2"></div>
      <div class="login-new__grid"></div>

      <div class="relative z-10 flex items-center gap-3 p-10">
        <img :src="useAppSetting.appLogoUrl" alt=" " class="h-12 object-center animation-logo" />
        <span class="text-white text-2xl font-bold uppercase tracking-wide">
          {{ $t('loginPage.description.title') }}
        </span>
      </div>

      <div class="relative z-10 px-10 pb-16 max-w-[560px]">
        <h1 class="text-white text-4xl xl:text-5xl font-bold uppercase leading-[1.15]">
          {{ $t('loginPage.description.subtitle') }}
        </h1>
        <p class="text-white/80 text-base font-medium mt-6 leading-7">
          {{ $t('loginPage.description.text') }}
        </p>
      </div>
    </div>

    <!-- Right form panel -->
    <div
      class="login-new__form-side relative flex-1 flex flex-col items-center justify-center px-6 py-10"
    >
      <div class="absolute top-6 right-6 z-10">
        <LangDropdown />
      </div>

      <div class="w-full max-w-[420px]">
        <!-- Mobile logo -->
        <div class="flex lg:hidden items-center gap-3 mb-10 justify-center">
          <img :src="useAppSetting.appLogoUrl" alt=" " class="h-10 object-center" />
          <span class="form-title text-xl font-bold uppercase">
            {{ $t('loginPage.description.title') }}
          </span>
        </div>

        <!-- qadamlar yo'nalishli slide bilan almashadi -->
        <div class="login-new__viewport overflow-hidden">
          <Transition :name="transitionName" mode="out-in">
            <LoginForm v-if="step === steps.login" @forgot="onForgot" />
            <TwoFactorForm v-else-if="step === steps.twofa" @back="toLogin" />
            <ResetForm v-else @back="toLogin" @done="onDone" />
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .login-new__hero {
    width: 48%;
    background: linear-gradient(135deg, #0177d7 0%, #042440 100%);
  }

  .login-new__form-side {
    background-color: var(--color-surface-section);
  }

  /* yo'nalishli slide o'tishlari (tez) */
  .slide-next-enter-active,
  .slide-next-leave-active,
  .slide-prev-enter-active,
  .slide-prev-leave-active {
    transition:
      transform 0.18s ease,
      opacity 0.18s ease;
  }

  /* oldinga: eski chapga chiqadi, yangi o'ngdan kiradi */
  .slide-next-enter-from {
    transform: translateX(40px);
    opacity: 0;
  }

  .slide-next-leave-to {
    transform: translateX(-40px);
    opacity: 0;
  }

  /* orqaga: eski o'ngga chiqadi, yangi chapdan kiradi */
  .slide-prev-enter-from {
    transform: translateX(-40px);
    opacity: 0;
  }

  .slide-prev-leave-to {
    transform: translateX(40px);
    opacity: 0;
  }

  .login-new__glow {
    position: absolute;
    border-radius: 9999px;
    filter: blur(80px);
    opacity: 0.55;
  }

  .login-new__glow-1 {
    width: 460px;
    height: 460px;
    top: -160px;
    right: -120px;
    background: radial-gradient(circle, #2ca8ff 0%, transparent 70%);
  }

  .login-new__glow-2 {
    width: 520px;
    height: 520px;
    bottom: -200px;
    left: -160px;
    background: radial-gradient(circle, #0177d7 0%, transparent 70%);
  }

  .login-new__grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(circle at 50% 40%, black, transparent 75%);
  }
</style>

<style>
  .login-new__submit {
    background-color: var(--dark-color) !important;
    color: var(--white-color) !important;
  }

  [data-theme='dark'] .login-new__submit {
    background-color: var(--color-primary, #0177d7) !important;
  }

  .login-new__submit .n-button__border {
    border: unset !important;
  }

  .login-new .dark-border-button .n-button__border {
    border: unset !important;
  }

  .login-new .dark-border-button {
    border: 1px solid var(--color-surface-line) !important;
  }

  .login-new .dark-border-button .n-base-wave {
    display: none !important;
  }

  .login-new .dark-border-button:not(.n-button--disabled):hover {
    color: var(--color-textColor0) !important;
  }

  .login-new .dark-border-button:not(.n-button--disabled):hover .n-button__border {
    border: unset !important;
  }

  .login-new .dark-border-button .n-button__state-border {
    border: unset !important;
  }

  .login-new__store-card {
    transition:
      border-color 0.2s ease,
      transform 0.2s ease;
  }

  .login-new__store-card:hover {
    border-color: var(--color-primary, #0177d7) !important;
    transform: translateY(-1px);
  }

  .login-new input:-webkit-autofill,
  .login-new input:-webkit-autofill:hover,
  .login-new input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0px 1000px var(--color-surface-section) inset !important;
    -webkit-text-fill-color: var(--color-textColor2) !important;
  }
</style>
