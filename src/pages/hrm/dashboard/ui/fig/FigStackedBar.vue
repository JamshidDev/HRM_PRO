<script setup>
  /**
   * Figma v3 100 % stacked bar — "Xodimlarning ma'lumoti bo'yicha"
   * (node 2959:58481) va "Vakansiya yoshi" (node 2959:59211) kartalarida
   * bir xil ishlatiladi.
   *
   * Har bir segment eni o'z ulushiga teng, ichida oq foiz yozuvi turadi.
   * Tor segmentda yozuv sig'maydi — maketda ham ular bo'sh qoladi.
   */
  import { toPercent } from '../../format.js'

  const props = defineProps({
    // [{ percent, token, text? }] — `text` berilmasa foiz o'zi yoziladi
    items: {
      type: Array,
      default: () => []
    },
    height: {
      type: Number,
      default: 34
    },
    // Shu foizdan tor segmentda yozuv chizilmaydi
    minLabelPercent: {
      type: Number,
      default: 8
    }
  })

  const segments = computed(() =>
    props.items.map((item) => ({
      ...item,
      text: item.text ?? toPercent(item.percent)
    }))
  )
</script>

<template>
  <div class="flex w-full items-start gap-0.5 overflow-hidden" :style="{ height: `${height}px` }">
    <div
      v-for="(item, idx) in segments"
      :key="idx"
      class="flex h-full items-center justify-center overflow-hidden rounded-[10px]"
      :style="{ width: `${item.percent}%`, backgroundColor: `var(${item.token})` }"
    >
      <p
        v-if="item.percent >= minLabelPercent"
        class="text-[12px] leading-4 font-semibold whitespace-nowrap text-white"
      >
        {{ item.text }}
      </p>
    </div>
  </div>
</template>
