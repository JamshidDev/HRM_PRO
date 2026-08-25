<script setup>
  /**
   * Figma "Asosiy" (node 3257:112462) — bosh sahifa sarlavhasi.
   * Chapda logotip + tashkilot nomi, o'ngda "Aloqa" va "Chiqish" tugmalari.
   *
   * Bu sarlavha layout'ning `AppHeader` iga qo'shimcha: maketda u sahifa
   * kontenti ichida, birinchi karta qatoridan yuqorida turadi.
   */
  import {
    useAccountStore,
    useAppStore,
    useSocketStore,
    usePageInstructionStore
  } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import { PageInstruction } from '@/components/index.js'
  import { Headphones20Filled } from '@vicons/fluent'
  import LogoutIcon from '@/assets/icons/logoutSystemIcon.svg'

  const accountStore = useAccountStore()
  const appStore = useAppStore()
  const socketStore = useSocketStore()
  const instructionStore = usePageInstructionStore()

  // "Aloqa" uchun alohida sahifa yo'q — mavjud yo'riqnoma drawer'i ochiladi.
  // `PageInstruction` shu yerda mount qilinadi: sidebar'dagi nusxasi izohga
  // olingani uchun ilovada boshqa hech qayerda mount qilinmagan.
  const onContact = () => {
    instructionStore._sections()
    instructionStore.resetForm()
    instructionStore.openVisible(true)
  }

  // `UIProfile.vue` dagi chiqish oqimi bilan bir xil.
  // `accountStore.loading` umumiy bayroq (profil, rollar, ruxsatlar ham uni
  // ko'taradi), shuning uchun tugma holati lokal ref bilan boshqariladi.
  const loggingOut = ref(false)
  const onLogout = () => {
    if (loggingOut.value) return
    loggingOut.value = true
    accountStore._logOut(() => {
      socketStore.disconnect()
      appStore._logOutApp()
    })
  }
</script>

<template>
  <div class="flex w-full shrink-0 items-center justify-between gap-4">
    <div class="flex min-w-0 items-center gap-2.5">
      <img :src="useAppSetting.appLogoUrl" alt="" class="h-11 w-12 shrink-0 object-contain" />
      <span class="truncate text-[18px] leading-6 font-semibold text-fig-text-brand">
        {{ $t('homePage.appName') }}
      </span>
    </div>

    <div class="flex shrink-0 items-center gap-2 sm:gap-4">
      <button
        type="button"
        class="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-fig-bg-brand px-2.5 sm:px-4 text-[14px] leading-[18px] font-medium text-white transition-opacity hover:opacity-90"
        @click="onContact"
      >
        <n-icon :size="18"><Headphones20Filled /></n-icon>
        <!-- Tor ekranda faqat ikonka: logotip nomiga joy qolsin -->
        <span class="hidden sm:inline">{{ $t('homePage.contact') }}</span>
      </button>

      <button
        type="button"
        :disabled="loggingOut"
        class="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-fig-bg-red px-2.5 sm:px-4 text-[14px] leading-[18px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        @click="onLogout"
      >
        <span class="flex h-[18px] w-[18px] shrink-0 items-center justify-center text-white">
          <LogoutIcon />
        </span>
        <span class="hidden sm:inline">{{ $t('homePage.logout') }}</span>
      </button>
    </div>
  </div>

  <!-- Yo'riqnoma drawer'i: "Aloqa" tugmasi shuni ochadi. Sidebar'dagi nusxasi
       izohga olingani uchun ilovada boshqa hech qayerda mount qilinmagan. -->
  <PageInstruction />
</template>
