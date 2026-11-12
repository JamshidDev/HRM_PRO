<script setup>
  /**
   * Figma "HRM Dashboard — chart variantlari (v3)" (node 2959:58213) panel qobig'i.
   *
   * Maketda har bir grafik kartasi bir xil: 16px radiusli oq blok, ustida
   * 12px vertikal padding'li sarlavha qatori (tint chip + 20px ikonka + matn +
   * o'ngda "Batafsil ↗"), pastida esa 12px radiusli `bg-secondary` ichki qatlam.
   * Ichki qatlam `inner` prop bilan o'chiriladi — ba'zi kartalarda (nogironlik,
   * tug'ilgan kunlar) kontent to'g'ridan-to'g'ri kartaga chiziladi.
   */
  defineProps({
    icon: {
      type: [Object, Function],
      default: null
    },
    // Chip foni — maketdagi tint tokenlari
    tint: {
      type: String,
      default: 'indigo'
    },
    // `currentColor` bilan eksport qilingan ikonkalarga rang beradi
    iconClass: {
      type: String,
      default: ''
    },
    title: String,
    // Maketda sarlavha ranglari kartadan kartaga farq qiladi: grafikli
    // panellarda `text-secondary`, ro'yxatli panellarda `text-tertiary`.
    muted: Boolean,
    // O'ng tarafdagi "Batafsil ↗" havolasi — berilmasa chizilmaydi
    actionText: {
      type: String,
      default: null
    },
    // `false` — kontent `bg-secondary` qatlamsiz, kartaga to'g'ridan-to'g'ri
    inner: {
      type: Boolean,
      default: true
    },
    // Ichki qatlam padding'i (maketda kartaga qarab 4px/8px farq qiladi)
    innerClass: {
      type: String,
      default: 'px-4 pt-2 pb-1'
    },
    // Ma'lumot `mock.js` dan olinganini bildiruvchi chip. Backend tegishli
    // maydonni bergan zahoti `store.isMock(...)` `false` qaytaradi va chip
    // o'zi yo'qoladi — qo'lda olib tashlash kerak emas.
    mock: Boolean
  })

  defineEmits(['action'])

  const tintClass = {
    blue: 'bg-fig-blue-100',
    green: 'bg-fig-green-100',
    indigo: 'bg-fig-indigo-100',
    amber: 'bg-fig-amber-100',
    red: 'bg-fig-red-100',
    pink: 'bg-fig-pink-100',
    // chipsiz sarlavha (maketda "Tug'ilgan kunlar" kartasi)
    none: ''
  }
</script>

<template>
  <!-- `mock` — backend bu kesimni hali bermayapti. Soxta (mock.js) raqamlar umuman
       chizilmaydi: sarlavha qoladi, kontent o'rnida oddiy «Tez orada» bloki (DAS-14231;
       avval blur ostida namunaviy sonlar ko'rinib turardi). Backend maydonni bergan
       zahoti `store.isMock(...)` `false` qaytaradi va karta o'zi haqiqiy holatiga o'tadi. -->
  <div class="fig-soon">
    <!-- Chegara yo'q — kartani `shadow-card` soyasi ajratib turadi. -->
    <div class="fig-soon__card flex flex-col rounded-2xl bg-fig-block shadow-card px-1 pb-1">
      <div class="flex w-full items-center gap-1 py-3 pr-1 pl-2">
        <span
          v-if="icon"
          class="shrink-0 rounded-lg"
          :class="[tintClass[tint], tint !== 'none' && 'p-1']"
        >
          <span class="flex h-5 w-5 items-center justify-center" :class="iconClass">
            <component :is="icon" />
          </span>
        </span>

        <p
          class="min-w-0 flex-1 truncate text-[14px] leading-[18px] font-medium"
          :class="muted ? 'text-fig-text-tertiary' : 'text-fig-text-secondary'"
        >
          {{ title }}
        </p>

        <!-- Sarlavha o'ng tomonidagi qo'shimcha boshqaruv (masalan, davr tanlovi). -->
        <div v-if="$slots['header-extra'] && !mock" class="shrink-0">
          <slot name="header-extra" />
        </div>

        <button
          v-if="actionText && !mock"
          type="button"
          class="shrink-0 cursor-pointer pr-1 pl-2 text-[12px] leading-4 whitespace-nowrap text-fig-text-brand transition-opacity hover:opacity-80"
          @click="$emit('action')"
        >
          {{ actionText }} ↗
        </button>
      </div>

      <div
        v-if="mock"
        class="fig-soon__empty flex flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-fig-bg-secondary px-4 py-6 text-center"
      >
        <span class="text-[14px] leading-5 font-semibold text-fig-text-secondary">
          {{ $t('dashboardPage.comingSoon') }}
        </span>
        <span class="text-[12px] leading-4 text-fig-text-tertiary">
          {{ $t('dashboardPage.comingSoonHint') }}
        </span>
      </div>
      <div
        v-else-if="inner"
        class="flex min-h-px flex-1 flex-col rounded-xl bg-fig-bg-secondary"
        :class="innerClass"
      >
        <slot />
      </div>
      <template v-else>
        <slot />
      </template>
    </div>

  </div>
</template>
