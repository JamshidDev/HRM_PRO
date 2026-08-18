<script setup>
  import { cards } from '@/pages/hrm/dashboard/constants.js'

  // Skeleton'ning maqsadi — yuklanish tugagach kontent "sakramasligi". Shu bois
  // grid sozlamalari (`cols`, gap'lar, `responsive`) va kartalarning `span` lari
  // `page.vue` dagi haqiqiy grid bilan bir xil bo'lishi shart.
  //
  // Chart kartalari ro'yxati `constants.js` dan olinadi: yangi karta qo'shilsa
  // yoki `span` o'zgarsa, skeleton o'zi moslashadi va qo'lda yangilash kerak
  // bo'lmaydi. Yuqoridagi 4 ta karta esa store'da qat'iy belgilangan
  // (`dashboardStore._dashboard()` → `dashboard.mainCard`), ya'ni soni doim 4 ta.
  const MAIN_CARD_COUNT = 4
</script>

<template>
  <n-grid x-gap="4 m:8 l:12" y-gap="4 m:8 l:12" cols="12" responsive="screen" aria-hidden="true">
    <!-- Yuqoridagi statistika kartalari: sarlavha + katta raqam + ikkita kichik qiymat. -->
    <n-grid-item v-for="i in MAIN_CARD_COUNT" :key="`main-${i}`" span="12 l:6 xl:3">
      <div class="w-full border border-surface-line p-4 rounded-lg bg-surface-section">
        <n-skeleton height="14px" width="55%" round />
        <div class="mt-2">
          <n-skeleton height="24px" width="40%" round />
        </div>
        <div class="w-full flex justify-between mt-4">
          <n-skeleton height="12px" width="80px" round />
          <n-skeleton height="12px" width="80px" round />
        </div>
      </div>
    </n-grid-item>

    <!-- Chart/karta bloklari: sarlavha qatori + kontent maydoni. -->
    <n-grid-item v-for="(card, idx) in cards" :key="`card-${idx}`" :span="card.span">
      <div
        class="w-full h-full min-h-[300px] flex flex-col border border-surface-line p-4 rounded-lg bg-surface-section"
      >
        <div class="flex justify-between items-center mb-4">
          <n-skeleton height="14px" width="45%" round />
          <n-skeleton height="12px" width="48px" round />
        </div>
        <!-- Kontent maydoni: kartalar ichida diagramma ham, ro'yxat ham bo'lishi
             mumkin, shuning uchun bitta neytral blok — aniq shaklni taqlid qilish
             noto'g'ri kutish uyg'otardi. -->
        <div class="flex-1">
          <n-skeleton height="100%" width="100%" :sharp="false" />
        </div>
      </div>
    </n-grid-item>
  </n-grid>
</template>
