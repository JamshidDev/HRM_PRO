<script setup>
  import LangDropdown from '@/components/general/LangDropdown.vue'
  import { useAppSetting } from '@/utils/index.js'
  import { useAppStore, useLoginNewStore, useResetPasswordStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import LoginForm from './ui/LoginForm.vue'
  import TwoFactorForm from './ui/TwoFactorForm.vue'
  import ResetForm from './ui/ResetForm.vue'
  import StoreLinks from './ui/StoreLinks.vue'

  const appStore = useAppStore()
  const loginStore = useLoginNewStore()
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
    <div
      class="login-new__hero relative hidden lg:flex flex-col items-center justify-center overflow-hidden"
    >
      <div class="login-new__glow login-new__glow-1"></div>
      <div class="login-new__glow login-new__glow-2"></div>
      <div class="login-new__grid"></div>

      <!-- Logo lang-select bilan bir qatorda (top-6) — orqasida blur'li glass card -->
      <div
        class="absolute top-6 left-6 z-10 flex items-center gap-3 rounded-2xl border border-white/30  px-4 py-1 shadow-lg backdrop-blur-md"
      >
        <img :src="useAppSetting.appLogoUrl" alt=" " class="h-12 object-center animation-logo" />
        <span class="text-white text-2xl font-bold uppercase tracking-wide">
          {{ $t('loginPage.description.title') }}
        </span>
      </div>

      <div class="relative z-10 px-10 max-w-[560px] text-center">
        <h1
          class="login-new__shiny-text login-new__fade-in login-new__fade-in-delay-1 text-4xl xl:text-5xl font-bold uppercase leading-[1.15]"
        >
          {{ $t('loginPage.description.subtitle') }}
        </h1>
        <p
          class="login-new__fade-in login-new__fade-in-delay-2 text-white/80 text-base font-medium mt-6 leading-7"
        >
          {{ $t('loginPage.description.text') }}
        </p>
      </div>

      <!-- Mobil ilovani yuklab olish — hero pastida (faqat desktop) -->
      <div
        v-if="appStore.appConfig.signatureLogin"
        class="absolute bottom-10 left-0 right-0 z-10 px-10"
      >
        <p class="text-white/80 text-sm font-medium mb-3 text-center">
          {{ $t('content.downloadApp') }}
        </p>
        <div class="max-w-[360px] mx-auto">
          <StoreLinks glass />
        </div>
      </div>
    </div>

    <!-- Right form panel -->
    <div
      class="login-new__form-side relative flex-1 flex flex-col items-center justify-center px-6 pb-6 pt-16 lg:py-10"
    >
      <!-- Mobile logo — lang-select bilan bir qatorda (faqat mobile) -->
      <div class="absolute top-6 left-6 z-10 flex lg:hidden items-center gap-3">
        <img :src="useAppSetting.appLogoUrl" alt=" " class="h-10 object-center" />
        <span class="form-title text-xl font-bold uppercase">
          {{ $t('loginPage.description.title') }}
        </span>
      </div>

      <div class="absolute top-6 right-6 z-10">
        <LangDropdown />
      </div>

      <div class="w-full max-w-[420px] login-new__fade-in login-new__fade-in-delay-1">
        <!-- qadamlar yo'nalishli slide bilan almashadi -->
        <div class="login-new__viewport overflow-hidden">
          <Transition :name="transitionName" mode="out-in">
            <LoginForm v-if="step === steps.login" @forgot="onForgot" />
            <TwoFactorForm v-else-if="step === steps.twofa" @back="toLogin" />
            <ResetForm v-else @back="toLogin" @done="onDone" />
          </Transition>
        </div>
      </div>

      <!-- Mualliflik huquqi -->
      <p class="absolute bottom-4 left-0 right-0 px-6 text-center text-xs text-textColor3">
        {{ $t('loginPage.copyright') }}
      </p>
    </div>
  </div>
</template>

<style scoped>
  .login-new__hero {
    width: 60%;
    background: linear-gradient(135deg, #01579e 0%, #042440 100%);
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
    animation: login-new-float 12s ease-in-out infinite;
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
    animation-delay: -6s;
  }

  @keyframes login-new-float {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
    }
    50% {
      transform: translate(-40px, 30px) scale(1.1);
    }
  }

  /* kirishda yumshoq paydo bo'lish (fade-in + slide-up), ketma-ket kechikish bilan */
  .login-new__fade-in {
    animation: login-new-fade-in 0.7s ease-out both;
  }

  .login-new__fade-in-delay-1 {
    animation-delay: 0.1s;
  }

  .login-new__fade-in-delay-2 {
    animation-delay: 0.25s;
  }

  @keyframes login-new-fade-in {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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

  /* h1 sarlavhaga sirpanib o'tuvchi yaltiroq (shiny) effekt */
  .login-new__shiny-text {
    background-image: linear-gradient(
      100deg,
      rgba(255, 255, 255, 0.35) 0%,
      rgba(255, 255, 255, 0.35) 35%,
      #ffffff 47%,
      #ffffff 53%,
      rgba(255, 255, 255, 0.35) 65%,
      rgba(255, 255, 255, 0.35) 100%
    );
    background-size: 200% 100%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: login-new-shiny 4s linear infinite;
  }

  @keyframes login-new-shiny {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }
</style>

<style>
  .login-new__submit {
    background-color: var(--dark-color) !important;
    color: var(--white-color) !important;
    transition: transform 0.15s ease !important;
  }

  .login-new__submit:not(.n-button--disabled):hover {
    transform: translateY(-1px);
  }

  .login-new__submit:not(.n-button--disabled):active {
    transform: scale(0.97);
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
