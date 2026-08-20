<script setup>
  /**
   * Figma v3 ustunli grafik grammatikasi — "Ta'til holati" (node 2963:59427) va
   * "Ishga qabul — shartnoma turlari" (Tab 2) kartalarida bir xil ishlatiladi:
   * tepada qiymat, o'rtada 16px radiusli rangli ustun, pastda nom va ulush.
   *
   * Ustun balandligi eng katta qiymatga nisbatan hisoblanadi; nol qiymat ham
   * ko'rinib turishi uchun minimal balandlik qoldiriladi.
   */
  import Utils from '@/utils/Utils.js'

  const props = defineProps({
    // [{ name, value, token }]
    items: {
      type: Array,
      default: () => []
    },
    // Eng baland ustun balandligi (px)
    height: {
      type: Number,
      default: 120
    },
    // Nom ostida ulush foizini ko'rsatish
    showPercent: {
      type: Boolean,
      default: true
    }
  })

  const total = computed(() => props.items.reduce((sum, item) => sum + (item.value ?? 0), 0))

  const columns = computed(() => {
    const max = Math.max(...props.items.map((item) => item.value ?? 0), 0)
    return props.items.map((item) => ({
      ...item,
      barHeight: max ? Math.max(((item.value ?? 0) / max) * props.height, 6) : 6,
      percent: total.value ? Math.round(((item.value ?? 0) / total.value) * 100) : 0
    }))
  })

  const format = (value) => Utils.formatNumberToMoney(value) || String(value ?? 0)
</script>

<template>
  <div class="flex w-full items-end gap-4 overflow-hidden sm:gap-6">
    <div
      v-for="(column, idx) in columns"
      :key="idx"
      class="flex min-w-px flex-1 flex-col items-center gap-1.5"
    >
      <p class="text-[12px] leading-4 font-semibold whitespace-nowrap text-fig-text-primary">
        {{ format(column.value) }}
      </p>
      <span
        class="w-full max-w-[60px] rounded-2xl"
        :style="{ height: `${column.barHeight}px`, backgroundColor: `var(${column.token})` }"
      ></span>
      <p class="w-full text-center text-[12px] leading-4 break-words text-fig-text-secondary">
        {{ column.name }}
      </p>
      <p v-if="showPercent" class="text-[12px] leading-4 text-fig-text-tertiary">
        {{ column.percent }} %
      </p>
    </div>
  </div>
</template>
