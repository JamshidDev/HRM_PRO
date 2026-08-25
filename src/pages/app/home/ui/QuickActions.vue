<script setup>
  /**
   * Figma "Frame 2147226646" (node 3257:112501) — 5 ta tezkor amal kartasi.
   *
   * Kartalar hozircha HAVOLASIZ: maketdagi beshta amaldan (ta'til, ma'lumotnoma,
   * hisobot, daromad, turniket) faqat "Daromad" uchun xodimga ochiq sahifa bor
   * (`/profile` → "Mening ish haqim"), qolganlari HR/admin ruxsatiga bog'langan
   * yoki umuman marshrutga ega emas. Marshrutlar aniqlangach shu ro'yxatga
   * `to` maydoni qo'shiladi va `<router-link>` ga o'raladi.
   */
  import PlaneDepartureIcon from '@/assets/icons/home/plane-departure.svg'
  import CertificateCheckIcon from '@/assets/icons/home/certificate-check.svg'
  import FileArrowDownIcon from '@/assets/icons/home/file-arrow-down.svg'
  import WalletAltIcon from '@/assets/icons/home/wallet-alt.svg'
  import DoorOpenIcon from '@/assets/icons/home/door-open.svg'

  const actions = [
    { key: 'vacation', icon: markRaw(PlaneDepartureIcon) },
    { key: 'reference', icon: markRaw(CertificateCheckIcon) },
    { key: 'report', icon: markRaw(FileArrowDownIcon) },
    { key: 'income', icon: markRaw(WalletAltIcon) },
    { key: 'turnstile', icon: markRaw(DoorOpenIcon) }
  ]
</script>

<template>
  <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
    <div
      v-for="action in actions"
      :key="action.key"
      class="flex cursor-default flex-col gap-3 overflow-hidden rounded-2xl bg-fig-block p-4"
    >
      <span class="flex h-9 w-9 shrink-0 items-center justify-center">
        <component :is="action.icon" />
      </span>
      <div class="flex flex-col gap-0.5">
        <p class="truncate text-[16px] leading-5 font-semibold text-fig-text-primary">
          {{ $t(`homePage.actions.${action.key}.title`) }}
        </p>
        <p class="truncate text-[14px] leading-5 text-fig-text-secondary">
          {{ $t(`homePage.actions.${action.key}.subtitle`) }}
        </p>
      </div>
    </div>
  </div>
</template>
