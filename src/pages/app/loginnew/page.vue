<script setup>
  import LangDropdown from '@/components/general/LangDropdown.vue'
  import { UIThemeSwitch } from '@/components/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import { useAppStore, useLoginNewStore, useResetPasswordStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import LoginForm from './ui/LoginForm.vue'
  import TwoFactorForm from './ui/TwoFactorForm.vue'
  import ResetForm from './ui/ResetForm.vue'
  import StoreLinks from './ui/StoreLinks.vue'
  import SeasonEffect from './ui/SeasonEffect.vue'

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
  <div class="login-new min-h-screen w-full flex text-login-ink bg-login-page">
    <!-- Left brand / hero panel -->
    <div class="login-new__hero relative hidden lg:flex flex-col overflow-hidden p-12 xl:px-14">
      <div class="login-new__watermark" aria-hidden="true"></div>
      <SeasonEffect :season="useAppSetting.loginSeason" />

      <!-- Logo + so'z belgisi -->
      <div class="relative z-10 flex items-center gap-3">
        <img :src="useAppSetting.appLogoUrl" alt=" " class="h-11 object-center animation-logo" />
        <span class="text-login-ink text-xl font-bold uppercase tracking-wide">
          {{ $t('loginPage.description.title') }}
        </span>
      </div>

      <div class="relative z-10 my-auto max-w-[560px]">
        <h1
          class="login-new__fade-in login-new__fade-in-delay-1 font-grotesk text-4xl xl:text-[46px] font-bold text-login-ink leading-[1.15]"
        >
          {{ $t('loginPage.description.subtitle') }}
        </h1>
        <p
          class="login-new__fade-in login-new__fade-in-delay-2 text-login-body text-[15px] leading-[1.65] mt-4 max-w-[480px]"
        >
          {{ $t('loginPage.description.text') }}
        </p>
      </div>

      <!-- Mobil ilovani yuklab olish — hero pastida (faqat desktop) -->
      <div v-if="appStore.appConfig.signatureLogin" class="relative z-10">
        <p class="text-login-body text-xs font-medium mb-2.5">
          {{ $t('content.downloadApp') }}
        </p>
        <div class="max-w-[340px]">
          <StoreLinks />
        </div>
      </div>
    </div>

    <!-- Right form panel -->
    <div
      class="login-new__form-side relative flex-1 flex flex-col items-center justify-center px-6 pb-6 pt-16 lg:py-10 overflow-hidden border-l border-login-border"
    >
      <div class="login-new__pattern absolute inset-0 pointer-events-none" aria-hidden="true"></div>
      <!-- Mobile logo — lang-select bilan bir qatorda (faqat mobile) -->
      <div class="absolute top-6 left-6 z-10 flex lg:hidden items-center gap-3">
        <img :src="useAppSetting.appLogoUrl" alt=" " class="h-10 object-center" />
        <span class="form-title text-xl font-bold uppercase">
          {{ $t('loginPage.description.title') }}
        </span>
      </div>

      <div class="absolute top-6 right-6 z-10 flex items-center gap-2">
        <UIThemeSwitch />
        <LangDropdown />
      </div>

      <div class="w-full max-w-[420px] login-new__fade-in login-new__fade-in-delay-1">
        <!-- qadamlar yo'nalishli slide bilan almashadi -->
        <div class="login-new__viewport overflow-hidden -mx-2 px-2">
          <Transition :name="transitionName" mode="out-in">
            <LoginForm v-if="step === steps.login" @forgot="onForgot" />
            <TwoFactorForm v-else-if="step === steps.twofa" @back="toLogin" />
            <ResetForm v-else @back="toLogin" @done="onDone" />
          </Transition>
        </div>
      </div>

      <!-- Mualliflik huquqi -->
      <p
        class="static lg:absolute mt-8 lg:mt-0 lg:bottom-4 lg:left-0 lg:right-0 px-6 text-center text-xs text-login-foot"
      >
        {{ $t('loginPage.copyright') }}
      </p>
    </div>
  </div>
</template>

<style scoped>
  .login-new__hero {
    width: 52%;
    background: radial-gradient(800px 600px at 30% 40%, var(--login-glow), transparent);
    transition: background 0.25s;
  }

  /* Hero fonidagi UTY logo watermark — light'da rangli-grayscale, dark'da oq varianti */
  .login-new__watermark {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: url(/effect/uty-logo.png);
    background-size: 700px;
    background-repeat: no-repeat;
    background-position: center 55%;
    opacity: 0.06;
    filter: grayscale(1);
  }

  [data-theme='dark'] .login-new__watermark {
    background-image: url(/effect/uty-logo-white.png);
    opacity: 0.07;
    filter: none;
  }

  .login-new__form-side {
    background-color: var(--login-form-bg);
    transition: background-color 0.25s;
  }

  /* Girih (sharq yulduzi) naqshi — forma panelining o'ng tomonida, chapga qarab so'nadi */
  .login-new__pattern {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='none' stroke='%230f1114' stroke-width='1.2'%3E%3Crect x='35' y='35' width='50' height='50'/%3E%3Crect x='35' y='35' width='50' height='50' transform='rotate(45 60 60)'/%3E%3Ccircle cx='60' cy='60' r='10'/%3E%3Cpath d='M0 60 H25 M95 60 H120 M60 0 V25 M60 95 V120'/%3E%3Ccircle cx='0' cy='0' r='8'/%3E%3Ccircle cx='120' cy='0' r='8'/%3E%3Ccircle cx='0' cy='120' r='8'/%3E%3Ccircle cx='120' cy='120' r='8'/%3E%3C/g%3E%3C/svg%3E");
    background-size: 120px 120px;
    -webkit-mask-image: linear-gradient(115deg, transparent 30%, rgba(0, 0, 0, 0.5) 60%, #000 100%);
    mask-image: linear-gradient(115deg, transparent 30%, rgba(0, 0, 0, 0.5) 60%, #000 100%);
    opacity: 0.06;
  }

  [data-theme='dark'] .login-new__pattern {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1.2'%3E%3Crect x='35' y='35' width='50' height='50'/%3E%3Crect x='35' y='35' width='50' height='50' transform='rotate(45 60 60)'/%3E%3Ccircle cx='60' cy='60' r='10'/%3E%3Cpath d='M0 60 H25 M95 60 H120 M60 0 V25 M60 95 V120'/%3E%3Ccircle cx='0' cy='0' r='8'/%3E%3Ccircle cx='120' cy='0' r='8'/%3E%3Ccircle cx='0' cy='120' r='8'/%3E%3Ccircle cx='120' cy='120' r='8'/%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.07;
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
</style>

<style>
  .login-new__submit {
    background: var(--primary-color) !important;
    color: #ffffff !important;
    transition:
      transform 0.15s ease,
      background-color 0.15s ease,
      filter 0.15s ease !important;
  }

  .login-new__submit:not(.n-button--disabled):hover {
    background: var(--login-link-hover) !important;
    transform: translateY(-1px);
  }

  .login-new__submit:not(.n-button--disabled):active {
    transform: scale(0.97);
  }

  .login-new__submit .n-button__border {
    border: unset !important;
  }

  .login-new .dark-border-button .n-button__border {
    border: unset !important;
  }

  .login-new .dark-border-button {
    border: 1px solid var(--login-field-border) !important;
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

  /* E-imzo orqali kirish tugmasi — dizayndagi aniq ranglar (--login-eimzo-*) */
  .login-new .login-new__signature-btn {
    background-color: var(--login-eimzo-bg) !important;
    color: var(--login-eimzo-ink) !important;
    border-color: var(--login-eimzo-border) !important;
  }

  .login-new .login-new__signature-btn:not(.n-button--disabled):hover {
    background-color: color-mix(in srgb, var(--login-link) 14%, var(--login-form-bg)) !important;
    border-color: var(--login-link) !important;
    color: var(--login-eimzo-ink) !important;
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
    -webkit-box-shadow: 0 0 0px 1000px var(--login-form-bg) inset !important;
    -webkit-text-fill-color: var(--login-field-ink) !important;
  }

  /* Forma label'lari va majburiylik yulduzchasi — dizayn ranglarida */
  .login-new .n-form-item .n-form-item-label {
    color: var(--login-label) !important;
    font-weight: 600;
  }

  .login-new .n-form-item .n-form-item-label__asterisk {
    color: var(--login-star) !important;
  }

  /* "Yoki" ajratkichi */
  .login-new .n-divider .n-divider__line {
    background-color: var(--login-divider) !important;
  }

  .login-new .n-divider .n-divider__title {
    color: var(--login-muted) !important;
    font-size: 12px;
    font-weight: 500;
  }

  /* === Login oqimidagi n-input'lar uchun yagona uslub — dizayn ranglarida === */
  .login-new__input {
    --n-border-radius: 10px !important;
    --n-height: 48px !important;
    --n-padding-left: 16px !important;
    --n-padding-right: 16px !important;
    --n-color: var(--login-field-bg) !important;
    --n-color-focus: var(--login-field-bg) !important;
    --n-text-color: var(--login-field-ink) !important;
    --n-placeholder-color: var(--login-ph) !important;
    --n-border: 1px solid var(--login-field-border) !important;
    --n-border-hover: 1px solid var(--login-link) !important;
    --n-border-focus: 1px solid var(--login-link) !important;
    --n-box-shadow-focus: 0 0 0 4px color-mix(in srgb, var(--login-link) 16%, transparent) !important;
    --n-caret-color: var(--login-link) !important;
  }

  @media (min-width: 1024px) {
    .login-new__input {
      --n-height: 52px !important;
    }
  }

  .login-new__input .n-input__input-el,
  .login-new__input .n-input__textarea-el {
    font-size: 15px;
  }
</style>
