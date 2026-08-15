<script setup>
  import { useRouter } from 'vue-router'
  import { useAccountStore, useSignatureStore } from '@/store/modules/index.js'
  import { AppPaths, useAppSetting } from '@/utils/index.js'

  const signatureStore = useSignatureStore()
  const accountStore = useAccountStore()
  const router = useRouter()

  // Matnlar OneID (id.egov.uz) bilan bir xil formulirovkada — foydalanuvchi
  // uchun tanish. Havolalar ham o'sha yerdagi rasmiy manzillar.
  const INSTRUCTIONS_URL = 'https://e-imzo.uz/#instructions'
  const HOST_URL = 'https://127.0.0.1:64443/'

  // Tarjimada havola o'rni `__LINK__` bilan belgilanadi — har tilda gap tuzilishi
  // boshqa (uz: "...host + ga", ru: "...к host в браузере"), shuning uchun matn
  // bo'linadi, qotirilgan tartib emas.
  // ⚠️ `{link}` ISHLATIB BO'LMAYDI — vue-i18n jingalak qavsni o'z interpolyatsiyasi
  // deb biladi va uni javobdan olib tashlaydi (havola matn oxiriga tushib qolardi).
  const LINK_TOKEN = '__LINK__'
  const before = (text) => text.split(LINK_TOKEN)[0]
  const after = (text) => text.split(LINK_TOKEN)[1] ?? ''

  const onSignatureLogin = async () => {
    await signatureStore._initialSignature(signatureStore.signatureTypes.auth, onSuccess)
  }

  // E-IMZO oqimi LoginForm'dan ko'chirildi — mantiq o'zgarmagan:
  // kalitlar ro'yxati modalda ochiladi, muvaffaqiyatda token localStorage'ga yoziladi.
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
    }).then((ok) => {
      if (ok) signatureStore.visible = false
    })
  }
</script>

<template>
  <div class="w-full">
    <div class="pt-2 space-y-3">
      <p class="text-login-body text-[13px] leading-relaxed">
        {{ $t('loginPage.eri.moduleRequired') }}
      </p>

      <!-- prettier-ignore -->
      <p class="text-login-body text-[13px] leading-relaxed">
        <span>{{ before($t('loginPage.eri.instructionsText')) }}</span><a :href="INSTRUCTIONS_URL" target="_blank" rel="noopener noreferrer" class="text-login-link font-medium hover:underline">{{ $t('loginPage.eri.instructionsLink') }}</a><span>{{ after($t('loginPage.eri.instructionsText')) }}</span>
      </p>

      <!-- prettier-ignore -->
      <p class="text-login-body text-[13px] leading-relaxed">
        <span>{{ before($t('loginPage.eri.hostText')) }}</span><a :href="HOST_URL" target="_blank" rel="noopener noreferrer" class="text-login-link font-medium hover:underline">{{ $t('loginPage.eri.hostLink') }}</a><span>{{ after($t('loginPage.eri.hostText')) }}</span>
      </p>
    </div>

    <div class="grid mt-6">
      <n-button
        size="large"
        class="h-[48px]! lg:h-[52px]! rounded-[10px]! font-semibold! dark-border-button login-new__signature-btn"
        :loading="signatureStore.loading"
        @click="onSignatureLogin"
      >
        <img src="/logo-e-imzo.png" alt="E-IMZO" class="h-6 w-auto object-contain mr-2.5" />
        {{ $t('content.signatureLogin') }}
      </n-button>
    </div>
  </div>
</template>
