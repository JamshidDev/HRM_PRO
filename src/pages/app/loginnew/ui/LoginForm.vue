<script setup>
  import { useRoute, useRouter } from 'vue-router'
  import {
    useAccountStore,
    useAppStore,
    useLoginNewStore,
    useSignatureStore
  } from '@/store/modules/index.js'
  import validationRules from '@/utils/validationRules.js'
  import { Call24Regular, Eye24Regular, EyeOff24Regular, LockClosed24Regular } from '@vicons/fluent'
  import { AppPaths, useAppSetting } from '@/utils/index.js'
  import ReCaptcha from '@/components/general/ReCaptcha.vue'
  import StoreLinks from './StoreLinks.vue'

  const emit = defineEmits(['forgot'])

  const store = useLoginNewStore()
  const accountStore = useAccountStore()
  const appStore = useAppStore()
  const signatureStore = useSignatureStore()
  const router = useRouter()
  const route = useRoute()

  const termsFiles = {
    uz: '/terms/HRM_PRO_Legal_Document_UZ.pdf',
    ru: '/terms/HRM_PRO_Legal_Document_RU.pdf',
    en: '/terms/HRM_PRO_Legal_Document_EN.pdf'
  }
  const termsUrl = computed(() => {
    const lang = localStorage.getItem(useAppSetting.languageKey) || 'uz'
    return termsFiles[lang] ?? termsFiles.uz
  })

  const formRef = ref(null)
  const captchaRef = ref(null)
  const captchaError = ref(false)

  const onCaptchaAnswer = (val) => {
    store.captchaAnswer = val
    if (val) captchaError.value = false
  }
  const onCaptchaKey = (val) => {
    store.captchaKey = val
  }

  const onSubmit = () => {
    formRef.value?.validate((_error) => {
      if (!store.captchaAnswer) captchaError.value = true
      if (!_error && store.captchaAnswer) {
        captchaError.value = false
        store._auth(() => captchaRef.value?.reset())
      }
    })
  }

  const onForgot = () => {
    emit('forgot', store.phone)
  }

  const onSignatureLogin = async () => {
    await signatureStore._initialSignature(signatureStore.signatureTypes.auth, onSuccess)
  }
  const onSuccess = (data) => {
    new Promise((resolve, reject) => {
      try {
        localStorage.setItem(useAppSetting.tokenKey, data?.access_token)
        accountStore._index(() => {
          router.push(AppPaths.Home)
        })
        resolve(true)
      } catch {
        reject(false)
      }
    }).then((data) => {
      if (data) {
        signatureStore.visible = false
      }
    })
  }

  onMounted(() => {
    const { client_id, state, scope } = route.query
    if (client_id && state && scope) {
      store.authPayload = {
        client_id,
        state,
        scope
      }
    } else {
      store.authPayload = null
    }

    const inputElement = document.querySelector('input[type="password"].n-input__input-el')
    inputElement?.addEventListener('animationstart', function (e) {
      if (e.animationName === 'autofill-detected') {
        onSubmit()
      }
    })
  })
</script>

<template>
  <div class="w-full">
    <div class="mb-4 lg:mb-8">
      <h3 class="text-2xl lg:text-3xl font-bold uppercase leading-tight text-center">
        {{ $t(`loginPage.title`) }}
      </h3>
    </div>

    <n-form
      ref="formRef"
      :rules="validationRules.login"
      :model="store"
      class="flex flex-col login-new__form-compact"
    >
      <n-form-item class="text-textColor2!" :label="$t(`loginPage.phone`)" path="phone">
        <n-input
          size="large"
          class="login-new__input"
          name="phone"
          id="phone"
          type="text"
          v-mask="'+998(##)#######'"
          @keyup.enter="onSubmit"
          @paste="
            (e) => {
              let a = e.clipboardData.getData('text').replaceAll(' ', '')
              if (a.length > 9) store.phone = ''
            }
          "
          v-model:value="store.phone"
        >
          <template #prefix>
            <n-icon class="text-textColor3!" size="24" :component="Call24Regular" />
          </template>
        </n-input>
      </n-form-item>
      <n-form-item :label="$t(`loginPage.password`)" path="password" class="text-textColor2!">
        <n-input
          size="large"
          class="login-new__input"
          name="password"
          id="password"
          type="password"
          show-password-on="click"
          :maxlength="60"
          v-model:value="store.password"
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

      <!-- <div class="flex justify-end -mt-4">
        <n-button text class="text-textColor3! hover:text-primary!" @click="onForgot">
          {{ $t('loginPage.forgotPassword') }}
        </n-button>
      </div> -->

      <n-form-item
        :validation-status="captchaError ? 'error' : undefined"
        :feedback="captchaError ? $t('rules.captchaRequired') : undefined"
        style="--n-blank-height: 0px; --n-item-padding-bottom: 4px"
      >
        <ReCaptcha
          ref="captchaRef"
          @update:answer="onCaptchaAnswer"
          @update:key="onCaptchaKey"
          @submit="onSubmit"
        />
      </n-form-item>

      <p class="text-xs text-center text-textColor2 mt-4 lg:mt-16 mb-4 lg:mb-3">
        {{ $t('loginPage.termsPrefix') }}
        <a
          :href="termsUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:underline cursor-pointer font-medium"
          style="color: #1677ff"
        >{{ $t('loginPage.termsLink') }}</a>
        {{ $t('loginPage.termsSuffix') }}
      </p>

      <div class="grid">
        <n-button
          class="login-new__submit h-[48px]! lg:h-[52px]! rounded-2xl! overflow-hidden! font-semibold!"
          size="large"
          :loading="store.loading"
          @click="onSubmit"
        >
          {{ $t(`loginPage.login`) }}
        </n-button>

        <template v-if="appStore.appConfig.signatureLogin">
          <n-divider class="my-2! lg:my-3!" title-placement="center">{{ $t('content.or') }}</n-divider>
          
          <n-button
            @click="onSignatureLogin"
            size="large"
            class="h-[48px]! lg:h-[52px]! rounded-2xl! font-semibold! dark-border-button login-new__signature-btn"
          >
            <img src="/logo-e-imzo.png" alt="E-IMZO" class="h-6 w-auto object-contain mr-2.5" />
            {{ $t(`content.signatureLogin`) }}
          </n-button>

          <!-- Mobil ilovani yuklab olish — faqat mobile'da (desktop'da hero panelda ko'rsatiladi) -->
          <div class="mt-3 lg:hidden">
            <p class="text-textColor2 text-sm font-medium text-center mb-2">
              {{ $t('content.downloadApp') }}
            </p>
            <StoreLinks />
          </div>
        </template>
      </div>
    </n-form>
  </div>
</template>

<style scoped>
  /* faqat mobilda input'lar orasini zichlashtiramiz; desktop Naive default'ida qoladi */
  @media (max-width: 1023px) {
    .login-new__form-compact {
      --n-item-padding-bottom: 8px;
    }
  }
</style>
