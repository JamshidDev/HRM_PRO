<script setup>
  /**
   * Figma "Button" (node 3257:112469 / 2042:173789) — qizil "Chiqish" tugmasi.
   *
   * Chiqish oqimi `UIProfile.vue` dagi bilan aynan bir xil; alohida komponent
   * bo'lgani uchun bosh sahifa va "Bog'lanish" sahifasi uni takrorlamaydi.
   */
  import { useAccountStore, useAppStore, useSocketStore } from '@/store/modules/index.js'
  import LogoutIcon from '@/assets/icons/logoutSystemIcon.svg'

  const accountStore = useAccountStore()
  const appStore = useAppStore()
  const socketStore = useSocketStore()

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
  <button
    type="button"
    :disabled="loggingOut"
    class="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-fig-bg-red px-2.5 text-[14px] leading-[18px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
    @click="onLogout"
  >
    <span class="flex h-[18px] w-[18px] shrink-0 items-center justify-center text-white">
      <LogoutIcon />
    </span>
    <!-- Tor ekranda faqat ikonka: sarlavhaga joy qolsin -->
    <span class="hidden sm:inline">{{ $t('homePage.logout') }}</span>
  </button>
</template>
