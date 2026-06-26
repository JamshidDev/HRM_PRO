<script setup>
  import { useRoute, useRouter } from 'vue-router'
  import {
    useAccountStore,
    useAppStore,
    useLoginStore,
    useSignatureStore
  } from '@/store/modules/index.js'
  import validationRules from '@/utils/validationRules.js'
  import {
    AppStore24Filled,
    Call16Filled,
    Eye24Regular,
    EyeOff20Filled,
    KeyMultiple20Filled,
    LockClosed16Filled
  } from '@vicons/fluent'
  import { AppPaths, useAppSetting } from '@/utils/index.js'
  import ReCaptcha from '@/components/general/ReCaptcha.vue'
  import i18n from '@/i18n/index.js'

  const emit = defineEmits(['forgot'])

  const store = useLoginStore()
  const accountStore = useAccountStore()
  const appStore = useAppStore()
  const signatureStore = useSignatureStore()
  const router = useRouter()
  const route = useRoute()

  const playMarketUrl = 'https://play.google.com/store/apps/details?id=hrms.railway.uz'
  const appStoreUrl = 'https://apps.apple.com/us/app/hr-rail/id6759365016'

  const formRef = ref(null)
  const captchaRef = ref(null)

  const onCaptchaVerify = (token) => {
    store.captchaToken = token
  }
  const onCaptchaExpire = () => {
    store.captchaToken = null
  }

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (error) return
      if (!store.captchaToken) {
        window.$message?.warning(i18n.global.t('loginPage.captchaRequired'))
        return
      }
      store._auth()
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
    <div class="mb-8">
      <h3 class="text-3xl font-bold uppercase leading-tight">
        {{ $t(`loginPage.title`) }}
      </h3>
      <p class="text-textColor2 mt-2 leading-snug">
        {{ $t(`loginPage.subtitle`) }}
      </p>
    </div>

    <n-form ref="formRef" :rules="validationRules.login" :model="store" class="flex flex-col">
      <n-form-item class="text-textColor2!" :label="$t(`loginPage.phone`)" path="phone">
        <n-input
          size="large"
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
            <n-icon class="text-textColor3!" size="24" :component="Call16Filled" />
          </template>
        </n-input>
      </n-form-item>
      <n-form-item :label="$t(`loginPage.password`)" path="password" class="text-textColor2!">
        <n-input
          size="large"
          name="password"
          id="password"
          type="password"
          show-password-on="click"
          :maxlength="60"
          v-model:value="store.password"
          @keyup.enter="onSubmit"
        >
          <template #prefix>
            <n-icon class="text-textColor3!" size="24" :component="LockClosed16Filled" />
          </template>

          <template #password-visible-icon>
            <n-icon :size="20" :component="EyeOff20Filled" />
          </template>
          <template #password-invisible-icon>
            <n-icon :size="20" :component="Eye24Regular" />
          </template>
        </n-input>
      </n-form-item>

      <div class="flex justify-end -mt-1 mb-2">
        <n-button text class="text-textColor3! hover:text-primary!" @click="onForgot">
          {{ $t('loginPage.forgotPassword') }}
        </n-button>
      </div>

      <div class="flex justify-center mb-4">
        <ReCaptcha ref="captchaRef" @verify="onCaptchaVerify" @expire="onCaptchaExpire" />
      </div>

      <div class="grid">
        <n-button
          class="login-new__submit h-[52px]! rounded-2xl! overflow-hidden! font-semibold!"
          size="large"
          :loading="store.loading"
          @click="onSubmit"
        >
          {{ $t(`loginPage.login`) }}
        </n-button>

        <template v-if="appStore.appConfig.signatureLogin">
          <n-divider class="my-3!" title-placement="center">{{ $t('content.or') }}</n-divider>
          <n-button
            @click="onSignatureLogin"
            size="large"
            class="h-[52px]! rounded-2xl! font-semibold! dark-border-button text-textColor1"
          >
            {{ $t(`content.signatureLogin`) }}
            <template #icon>
              <n-icon class="text-textColor3!" size="24" :component="KeyMultiple20Filled" />
            </template>
          </n-button>

          <div class="mt-6">
            <p class="text-textColor2 text-sm font-medium text-center mb-3">
              {{ $t('content.downloadApp') }}
            </p>
            <div class="grid grid-cols-2 gap-3">
              <a
                :href="appStoreUrl"
                target="_blank"
                class="login-new__store-card flex items-center justify-center gap-2 px-3 h-[52px] rounded-2xl border border-surface-line bg-surface-ground"
              >
                <n-icon size="30" color="#019ff9">
                  <AppStore24Filled />
                </n-icon>
                <div class="leading-[1.15]">
                  <p class="text-[11px] text-textColor3">Download on the</p>
                  <p class="text-sm font-semibold text-textColor0">App Store</p>
                </div>
              </a>
              <a
                target="_blank"
                :href="playMarketUrl"
                class="login-new__store-card flex items-center justify-center gap-2 px-3 h-[52px] rounded-2xl border border-surface-line bg-surface-ground"
              >
                <img class="h-[28px]" src="@/assets/images/svg/playMarket.svg" alt="" />
                <div class="leading-[1.15]">
                  <p class="text-[11px] text-textColor3">Get it on</p>
                  <p class="text-sm font-semibold text-textColor0">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </template>
      </div>
    </n-form>
  </div>
</template>
