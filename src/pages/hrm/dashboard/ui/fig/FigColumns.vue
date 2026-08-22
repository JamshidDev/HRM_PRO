<script setup>
  /**
   * Figma v3 ustunli grafik grammatikasi. Uch kartada ishlatiladi:
   *
   *   "Ta'til holati" (node 2959:59756) — uch qatlamli ustun (chiqqan / rejada /
   *   yig'ilib qolgan), tepada jami kun.
   *   "Ishga qabul — shartnoma turlari" (node 2959:59022) — bir qatlamli ustun,
   *   nom ostida `47 % · ▲ 16 %` izohi.
   *   "Intizomiy jazo turlari" (node 2959:59930) — xuddi shunday.
   *
   * Ustun balandligi eng katta qiymatga nisbatan hisoblanadi; nol qiymat ham
   * ko'rinib turishi uchun minimal balandlik qoldiriladi.
   */
  import FigTrend from './FigTrend.vue'
  import { toCount, toRoundPercent } from '../../format.js'

  const props = defineProps({
    /**
     * `[{ name, value, token }]` — bir qatlamli ustun, yoki
     * `[{ name, segments: [{value, token}] }]` — qatlamli ustun.
     * Ikkalasida ham ixtiyoriy `percent` va `metric` bo'lishi mumkin:
     * ular nom ostidagi izoh qatorini chizadi.
     */
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
    },
    // Izoh qatoridagi trendning birligi
    trendUnit: {
      type: String,
      default: 'percent'
    }
  })

  /** Bir qatlamli ustun ham ichki tuzilishda `segments` sifatida qaraladi. */
  const normalized = computed(() =>
    props.items.map((item) => {
      const segments = item.segments?.length
        ? item.segments
        : [{ value: item.value ?? 0, token: item.token }]
      return {
        ...item,
        segments,
        value: segments.reduce((sum, part) => sum + Number(part.value || 0), 0)
      }
    })
  )

  const total = computed(() => normalized.value.reduce((sum, item) => sum + item.value, 0))

  const columns = computed(() => {
    const max = Math.max(...normalized.value.map((item) => item.value), 0)
    return normalized.value.map((item) => ({
      ...item,
      barHeight: max ? Math.max((item.value / max) * props.height, 6) : 6,
      // `percent` berilmasa ulush yig'indiga nisbatan hisoblanadi
      percent: item.percent ?? (total.value ? (item.value / total.value) * 100 : 0),
      parts: item.segments.map((part) => ({
        token: part.token,
        // Qatlam balandligi ustun ichidagi ulushiga teng
        height: item.value ? (Number(part.value || 0) / item.value) * 100 : 0
      }))
    }))
  })
</script>

<template>
  <div class="flex w-full items-end gap-4 overflow-hidden sm:gap-6">
    <div
      v-for="(column, idx) in columns"
      :key="idx"
      class="flex min-w-px flex-1 flex-col items-center gap-1.5"
    >
      <p class="text-[12px] leading-4 font-semibold whitespace-nowrap text-fig-text-primary">
        {{ toCount(column.value) }}
      </p>

      <!-- Qatlamlar tepadan pastga chiziladi: maketda eng yuqorida
           "yig'ilib qolgan", pastda esa "chiqqan" turadi. -->
      <span
        class="flex w-full max-w-[60px] flex-col overflow-hidden rounded-2xl"
        :style="{ height: `${column.barHeight}px` }"
      >
        <span
          v-for="(part, partIdx) in column.parts"
          :key="partIdx"
          class="w-full"
          :style="{ height: `${part.height}%`, backgroundColor: `var(${part.token})` }"
        ></span>
      </span>

      <p class="w-full text-center text-[12px] leading-4 break-words text-fig-text-secondary">
        {{ column.name }}
      </p>

      <div
        v-if="showPercent || column.metric"
        class="flex items-center justify-center gap-1 whitespace-nowrap"
      >
        <p v-if="showPercent" class="text-[12px] leading-4 text-fig-text-tertiary">
          {{ toRoundPercent(column.percent) }}
        </p>
        <p v-if="showPercent && column.metric" class="text-[12px] leading-4 text-fig-text-tertiary">
          ·
        </p>
        <FigTrend v-if="column.metric" :metric="column.metric" :unit="trendUnit" :label-key="null" />
      </div>
    </div>
  </div>
</template>
