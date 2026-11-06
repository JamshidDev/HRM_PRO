<script setup>
  import { useLoginNewStore } from '@/store/modules/index.js'
  import validationRules from '@/utils/validationRules.js'
  import ReCaptcha from '@/components/general/ReCaptcha.vue'
  // Figma «Input and dropdown» ikonkalari (phone-alt, lock-alt, eye-slash / eye)
  import PhoneIcon from '@/assets/icons/figPhoneAlt.svg'
  import LockIcon from '@/assets/icons/lockAlt.svg'
  import EyeSlashIcon from '@/assets/icons/figEyeSlash.svg'
  import EyeIcon from '@/assets/icons/eyeAlt.svg'

  const emit = defineEmits(['forgot'])

  const store = useLoginNewStore()

  const formRef = ref(null)
  const captchaRef = ref(null)
  const captchaError = ref(false)
  const captchaEnabled = ref(true)

  const onCaptchaAnswer = (val) => {
    store.captchaAnswer = val
    if (val) captchaError.value = false
  }
  const onCaptchaKey = (val) => {
    store.captchaKey = val
  }

  // Captcha maydonida Enter bosilganda native <form> submit HAM, ReCaptcha'ning
  // o'z @keyup.enter emiti HAM onSubmit'ni chaqiradi — natijada bitta Enter
  // bosishda login so'rovi 2 marta ketib, ikkinchisi captcha allaqachon
  // ishlatilgani uchun xato bilan qaytardi. `store.loading` validate() hali
  // asinxron hal bo'lmagani uchun bu yerda kech — shuning uchun sinxron flag.
  // `store.loading` esa alohida tekshiriladi — u so'rov tarmoqdan javob
  // qaytarmaguncha true turadi, shu bilan ketma-ket Enter/tugma bosishlarda ham
  // birinchi so'rov tugamaguncha ikkinchisi yuborilmaydi.
  let submitInFlight = false
  const onSubmit = () => {
    if (submitInFlight || store.loading) return
    submitInFlight = true
    formRef.value?.validate((_error) => {
      submitInFlight = false
      const captchaOk = !captchaEnabled.value || !!store.captchaAnswer
      if (!captchaOk) captchaError.value = true
      if (!_error && captchaOk) {
        captchaError.value = false
        store._auth(() => captchaRef.value?.reset())
      }
    })
  }

  // native <form> submit orqali chaqiriladi (Chrome parolni saqlash uchun haqiqiy submit eventini kutadi)
  const onFormSubmit = (e) => {
    e.preventDefault()
    onSubmit()
  }

  const onForgot = () => {
    emit('forgot', store.phone)
  }

  onMounted(() => {
    const inputElement = document.querySelector('input[type="password"].n-input__input-el')
    inputElement?.addEventListener(
      'animationstart',
      function (e) {
        if (e.animationName === 'autofill-detected') {
          onSubmit()
        }
      },
      { once: true }
    )
  })
</script>

<template>
  <div class="w-full">
    <n-form
      ref="formRef"
      :rules="validationRules.login"
      :model="store"
      :show-require-mark="false"
      class="flex flex-col"
      @submit="onFormSubmit"
    >
      <n-form-item :label="$t(`loginPage.phone`)" path="phone">
        <n-input
          size="large"
          class="login-new__input"
          type="text"
          :input-props="{ name: 'phone', id: 'phone', autocomplete: 'username' }"
          v-mask="'+998(##)#######'"
          @paste="
            (e) => {
              let a = e.clipboardData.getData('text').replaceAll(' ', '')
              if (a.length > 9) store.phone = ''
            }
          "
          v-model:value="store.phone"
        >
          <template #prefix>
            <n-icon class="login-form__icon" :size="20"><PhoneIcon /></n-icon>
          </template>
        </n-input>
      </n-form-item>
      <n-form-item :label="$t(`loginPage.passwordLabel`)" path="password">
        <n-input
          size="large"
          class="login-new__input"
          type="password"
          :input-props="{ name: 'password', id: 'password', autocomplete: 'current-password' }"
          show-password-on="click"
          :maxlength="60"
          v-model:value="store.password"
        >
          <template #prefix>
            <n-icon class="login-form__icon" :size="20"><LockIcon /></n-icon>
          </template>

          <!-- Figma: parol yashirin turganda — «eye-slash» -->
          <template #password-invisible-icon>
            <n-icon :size="20"><EyeSlashIcon /></n-icon>
          </template>
          <template #password-visible-icon>
            <n-icon :size="20"><EyeIcon /></n-icon>
          </template>
        </n-input>
      </n-form-item>

      <!-- Inputdan 8px pastda (24px feedback joyi − 16px) -->
      <div class="flex justify-end -mt-4">
        <n-button
          text
          class="text-login-link! text-sm! leading-[18px]! font-medium! hover:opacity-80!"
          @click="onForgot"
        >
          {{ $t('loginPage.forgotPassword') }}
        </n-button>
      </div>

      <n-form-item
        v-show="captchaEnabled"
        class="mt-6"
        :validation-status="captchaError ? 'error' : undefined"
        :feedback="captchaError ? $t('rules.captchaRequired') : undefined"
        style="--n-blank-height: 0px; --n-item-padding-bottom: 4px"
      >
        <ReCaptcha
          ref="captchaRef"
          @update:answer="onCaptchaAnswer"
          @update:key="onCaptchaKey"
          @update:enabled="(v) => (captchaEnabled = v)"
          @submit="onSubmit"
        />
      </n-form-item>

      <!-- Figma «Button»: 48px, 10px radius, 16px medium -->
      <div class="grid mt-6">
        <n-button
          attr-type="submit"
          class="login-new__submit h-12! rounded-[10px]! overflow-hidden! text-base! font-medium!"
          size="large"
          :loading="store.loading"
          :disabled="store.loading"
        >
          {{ $t(`loginPage.login`) }}
        </n-button>

        <!-- E-IMZO tugmasi "ERI" tabiga ko'chirildi (EriForm.vue).
             Mobil ilova havolalari endi kartaning pastida (page.vue). -->
      </div>
    </n-form>
  </div>
</template>

<style scoped>
  .login-form__icon {
    color: var(--login-icon);
  }
</style>
