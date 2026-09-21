<script setup>
  /**
   * Parol muddati o'tgan — login sahifasidagi alohida ekran.
   *
   * Backend kirishga ruxsat bermaganda (`isPasswordExpiredError`) chiqadi.
   * Bu yerda parol o'zgartirilmaydi: yagona yo'l — Telegram bot orqali kod
   * olib, parolni TIKLASH. Shu sababli asosiy tugma foydalanuvchini
   * shu sahifadagi tiklash oqimiga (`ResetForm.vue`) olib o'tadi, botga
   * havola esa yonida turadi.
   */
  import { ChevronLeft20Filled, LockClosed24Regular } from '@vicons/fluent'
  import { resetBotHandle, resetBotUrl } from '@/utils/index.js'
  import { useLoginNewStore } from '@/store/modules/index.js'

  const emit = defineEmits(['back', 'reset'])
  const store = useLoginNewStore()
</script>

<template>
  <div class="w-full">
    <div class="mb-2">
      <n-button text class="text-textColor3!" @click="emit('back')">
        <template #icon>
          <n-icon size="22"><ChevronLeft20Filled /></n-icon>
        </template>
        {{ $t('content.back') }}
      </n-button>
    </div>

    <div class="mb-8">
      <div class="expired-mark mb-4">
        <n-icon size="26"><LockClosed24Regular /></n-icon>
      </div>

      <h3 class="font-grotesk text-[30px] font-bold leading-tight text-login-ink">
        {{ $t('loginPage.passwordExpired.title') }}
      </h3>

      <!-- Backend o'z matnini bergan bo'lsa o'sha ko'rsatiladi: u aniqroq
           bo'lishi mumkin (masalan necha kun o'tgani). Bermasa — o'zimizniki. -->
      <p class="text-login-body mt-2 leading-snug">
        {{ store.passwordExpiredMessage || $t('loginPage.passwordExpired.subtitle') }}
      </p>

      <p class="text-login-body mt-2 leading-snug">
        {{ $t('loginPage.passwordExpired.botPrefix') }}
        <a
          :href="resetBotUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-login-link font-medium hover:underline"
          >{{ resetBotHandle }}</a
        >
        {{ $t('loginPage.passwordExpired.botSuffix') }}
      </p>
    </div>

    <n-button
      class="login-new__submit h-[52px]! overflow-hidden! rounded-[10px]! font-semibold!"
      size="large"
      block
      type="primary"
      @click="emit('reset')"
    >
      {{ $t('loginPage.resetPassword.title') }}
    </n-button>
  </div>
</template>

<style scoped>
  /* Qulf belgisi — matndan oldin holatni bir qarashda bildiradi. */
  .expired-mark {
    display: flex;
    width: 52px;
    height: 52px;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    background: var(--fig-red-100);
    color: var(--fig-text-red);
  }
</style>
