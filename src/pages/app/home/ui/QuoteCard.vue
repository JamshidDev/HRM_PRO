<script setup>
  /**
   * Figma "Frame 2147226633" (node 3257:112490) — kunlik iqtibos kartasi.
   *
   * Manba o'zgarmadi: `useQuoteStore._randomText()` → `GET /v1/quote`,
   * javob `{ text: {uz,ru,en}, author: {uz,ru,en} }`. Oldingi `Quotes.vue`
   * ham shu ma'lumotni ko'rsatardi, faqat ko'rinishi boshqacha edi.
   */
  import { useQuoteStore } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import QuoteLeftIcon from '@/assets/icons/home/quote-left.svg'

  const store = useQuoteStore()

  const langKey = localStorage.getItem(useAppSetting.languageKey) || useAppSetting.defaultLanguage

  // `uz_kr` kabi tillar iqtibos jadvalida bo'lmasligi mumkin — birinchi
  // to'ldirilgan tarjimaga qaytamiz.
  const pick = (obj) => obj?.[langKey] || Object.values(obj ?? {}).find(Boolean) || ''

  const text = computed(() => pick(store.randomText?.text))
  const author = computed(() => pick(store.randomText?.author))
</script>

<template>
  <div class="flex h-full flex-col gap-6 rounded-2xl bg-fig-block p-4">
    <span class="flex h-8 w-8 shrink-0 items-center justify-center">
      <QuoteLeftIcon />
    </span>

    <div class="flex min-h-px flex-1 flex-col justify-between gap-4">
      <p class="text-[20px] leading-7 font-medium tracking-[0.2px] text-fig-text-primary italic">
        {{ text }}
      </p>
      <p class="truncate text-[16px] leading-5 font-semibold text-fig-text-secondary">
        <template v-if="author">- {{ author }}</template>
      </p>
    </div>
  </div>
</template>
