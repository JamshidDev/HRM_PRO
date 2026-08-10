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
import OfferModal from '@/components/OfferModal.vue'
import loginPatternUrl from '@/assets/images/svg/login-pattern.png?url'
import loginPatternBottomUrl from '@/assets/images/svg/pattern-bottom.png?url'
import bannerRailwaysDayUrl from '@/assets/images/content/banner-railways-day.png?url'


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
  <div class="login-new min-h-screen w-full flex items-stretch text-login-ink bg-login-page gap-4 lg:gap-8">
    <!-- Left brand / hero panel -->
    <div class="login-new__hero relative hidden lg:flex flex-col overflow-hidden p-12 xl:px-14">
      <div
        class="login-new__hero-pattern absolute inset-0 pointer-events-none"
        :style="{ '--login-hero-pattern': `url(${loginPatternUrl})` }" aria-hidden="true"
      ></div>
      <SeasonEffect :season="useAppSetting.loginSeason" />

      <div class="relative z-10 flex-1 flex flex-col items-center justify-center text-center max-w-[560px] mx-auto">
        <img src="/logo-new.png" alt=" " class="h-20 w-auto mb-6 login-new__fade-in animation-logo" />
        <h1
          class="login-new__shiny-text login-new__fade-in login-new__fade-in-delay-1 font-grotesk text-4xl xl:text-[46px] font-bold text-login-ink leading-[1.15]"
        >
          {{ $t('loginPage.description.subtitle') }}
        </h1>
        <p
          class="login-new__fade-in login-new__fade-in-delay-2 text-login-body text-[15px] leading-[1.65] mt-4 max-w-[480px]"
        >
          {{ $t('loginPage.description.text') }}
        </p>
        <img
          :src="bannerRailwaysDayUrl"
          alt=""
          class="login-new__fade-in login-new__fade-in-delay-2 w-full max-w-[1020px] rounded-2xl mt-6 shadow-md"
        />
      </div>

      <!-- Mobil ilovani yuklab olish — hero pastida (faqat desktop) -->
      <div v-if="appStore.appConfig.signatureLogin" class="relative z-10 flex flex-col items-center text-center">
        <p class="text-login-body text-xs font-medium mb-2.5">
          {{ $t('content.downloadApp') }}
        </p>
        <div class="max-w-[340px]">
          <StoreLinks />
        </div>
      </div>
    </div>

    <!-- Right form panel -->
    <div class="login-new__form-side relative flex-1 flex items-center justify-center px-4 py-6">
      <div
        class="login-new__card relative w-full max-w-[520px] flex flex-col items-center px-6 sm:px-9 pt-20 lg:pt-7 pb-9 overflow-hidden"
      >
        <div
          class="login-new__card-pattern absolute inset-0 pointer-events-none"
          :style="{ '--login-hero-pattern': `url(${loginPatternBottomUrl})` }" aria-hidden="true"
        ></div>

        <!-- Mobile logo — lang-select bilan bir qatorda (faqat mobile) -->
        <div class="absolute top-6 left-6 z-20 flex lg:hidden items-center gap-3">
          <img :src="useAppSetting.appLogoUrl" alt=" " class="h-10 object-center" />
          <span class="form-title text-xl font-bold uppercase">
            {{ $t('loginPage.description.title') }}
          </span>
        </div>

        <div class="absolute top-6 right-6 z-20 flex items-center gap-2">
          <UIThemeSwitch />
          <LangDropdown />
        </div>

        <div class="relative z-10 w-full login-new__fade-in login-new__fade-in-delay-1">
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
        <p class="relative z-10 w-full mt-8 px-2 text-center text-xs text-login-foot">
          {{ $t('loginPage.copyright') }}
        </p>
      </div>
    </div>

    <!-- Offerta modali — login javobida `offer:true` kelsa ochiladi (teleport) -->
    <OfferModal />
  </div>
</template>

<style scoped>
.login-new__hero {
  width: 52%;
  /* background: radial-gradient(800px 600px at 30% 40%, var(--login-glow), transparent); */
  transition: background 0.25s;
}

/* h1 sarlavhaga sirpanib o'tuvchi yaltiroq (shiny) effekt — main branchdagi bilan bir xil texnika, light/dark ranglarga moslashtirilgan */
.login-new__shiny-text {
  background-image: linear-gradient(
    100deg,
    var(--login-ink) 0%,
    var(--login-ink) 35%,
    var(--login-link) 47%,
    var(--login-link) 53%,
    var(--login-ink) 65%,
    var(--login-ink) 100%
  );
  background-size: 200% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: login-new-shiny 4s linear infinite;
}

[data-theme='dark'] .login-new__shiny-text {
  background-image: linear-gradient(
    100deg,
    rgba(255, 255, 255, 0.35) 0%,
    rgba(255, 255, 255, 0.35) 35%,
    #ffffff 47%,
    #ffffff 53%,
    rgba(255, 255, 255, 0.35) 65%,
    rgba(255, 255, 255, 0.35) 100%
  );
}

@keyframes login-new-shiny {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

/* h1'da fade-in va shiny animatsiyalari bir vaqtda ishlashi uchun — .login-new__fade-in'ning */
/* animation shorthand'i shiny'nikini bekor qilib qo'ymasligi kerak, shu sabab ikkalasini birga birlashtiramiz */
.login-new__shiny-text.login-new__fade-in {
  animation:
    login-new-fade-in 0.7s ease-out both,
    login-new-shiny 4s linear infinite;
}

/* Hero fonidagi mandala naqshi — chap chetga tiqilgan, kattalashtirilgan, o'ngga qarab so'nadi */
.login-new__hero-pattern {
  background-image: var(--login-hero-pattern);
  background-repeat: no-repeat;
  background-position: left center;
  background-size: auto 105%;
  opacity: 1;
  -webkit-mask-image: linear-gradient(to right, #000 45%, transparent 85%);
  mask-image: linear-gradient(to right, #000 45%, transparent 85%);
  transition: opacity 0.25s;
}

[data-theme='dark'] .login-new__hero-pattern {
  opacity: 1;
}

/* Karta pastki qismidagi mandala naqshi — pastga tiqilgan, tepaga qarab so'nadi */
.login-new__card-pattern {
  background-image: var(--login-hero-pattern);
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: 100% auto;
  opacity: 1;
  -webkit-mask-image: linear-gradient(to top, #000 22%, transparent 50%);
  mask-image: linear-gradient(to top, #000 22%, transparent 50%);
  transition: opacity 0.25s;
  transform: rotate(0deg);
}

[data-theme='dark'] .login-new__card-pattern {
  opacity: 1;
}

.login-new__card {
  background-color: var(--login-form-bg);
  border: 1px solid var(--login-form-border);
  box-shadow: var(--shadow-sm);
  border-radius: 1.25rem;
  transition:
    background-color 0.25s,
    box-shadow 0.25s;
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
