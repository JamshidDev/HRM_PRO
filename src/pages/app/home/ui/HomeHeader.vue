<script setup>
  /**
   * Figma "Asosiy" (node 3257:112462) — bosh sahifa sarlavhasi.
   * Chapda logotip + tashkilot nomi, o'ngda "Aloqa" va "Chiqish" tugmalari.
   *
   * Bu sarlavha layout'ning `AppHeader` iga qo'shimcha: maketda u sahifa
   * kontenti ichida, birinchi karta qatoridan yuqorida turadi.
   */
  import { useAppSetting, AppPaths } from '@/utils/index.js'
  import { LogoutButton } from '@/components/index.js'
  import { Headphones20Filled } from '@vicons/fluent'

  const router = useRouter()

  // "Aloqa" — alohida sahifa (Figma node 2042:173778)
  const onContact = () => router.push(AppPaths.Contact)
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
        class="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-fig-bg-brand px-2.5 text-[14px] leading-[18px] font-medium text-white transition-opacity hover:opacity-90 sm:px-4"
        @click="onContact"
      >
        <n-icon :size="18"><Headphones20Filled /></n-icon>
        <!-- Tor ekranda faqat ikonka: logotip nomiga joy qolsin -->
        <span class="hidden sm:inline">{{ $t('homePage.contact') }}</span>
      </button>

      <LogoutButton />
    </div>
  </div>
</template>
