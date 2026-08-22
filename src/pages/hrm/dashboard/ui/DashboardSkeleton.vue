<script setup>
  import { useDashboardStore } from '@/store/modules/index.js'
  import { tabCards, tabKpiCount } from '@/pages/hrm/dashboard/constants.js'

  // Skeleton'ning maqsadi — yuklanish tugagach kontent "sakramasligi". Shu bois
  // grid sozlamalari (`cols`, gap'lar, `responsive`) va kartalarning `span` lari
  // `page.vue` dagi haqiqiy grid bilan bir xil bo'lishi shart.
  //
  // Kartalar ro'yxati faol bob bo'yicha `constants.js` dan olinadi: yangi karta
  // qo'shilsa yoki `span` o'zgarsa, skeleton o'zi moslashadi va qo'lda yangilash
  // kerak bo'lmaydi.
  const store = useDashboardStore()

  // KPI kartalari soni bobga bog'liq (`constants.js`), yuklanish paytida
  // ma'lumot hali bo'lmaydi — kutilayotgan sonni konfiguratsiya beradi.
  const kpiCount = computed(() => tabKpiCount[store.activeTab] || 0)
  // `page.vue` dagi `kpiSpan` bilan bir xil qoida.
  const kpiSpan = computed(() =>
    kpiCount.value === 3 ? '12 m:4' : kpiCount.value > 2 ? '12 m:6 xl:3' : '12 m:6'
  )
  const cards = computed(() => tabCards[store.activeTab] || [])
</script>

<template>
  <n-grid x-gap="8 m:12 l:16" y-gap="8 m:12 l:16" cols="12" responsive="screen" aria-hidden="true">
    <!-- KPI kartalari: sarlavha + katta raqam + ikkita kichik qiymat. -->
    <n-grid-item v-for="i in kpiCount" :key="`kpi-${i}`" :span="kpiSpan">
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
