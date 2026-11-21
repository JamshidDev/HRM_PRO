<script setup>
  /**
   * Grafik legendasi — HRM dashboard «Ishga qabul / bo'shatish» kartasidagi kabi:
   * bitta qatorda nuqta + nom + qalin son. Bosiladigan bo'lsa hover'da ko'z belgisi.
   */
  import { Eye20Filled } from '@vicons/fluent'
  import { Utils } from '@/utils/index.js'
  import { UICountUp } from '@/components/index.js'

  const props = defineProps({
    label: String,
    count: {
      type: [Number, String],
      default: 0
    },
    // Legenda nuqtasi rangi (CSS o'zgaruvchi nomi)
    dotColor: {
      type: String,
      default: '--fig-icon-indigo'
    },
    clickable: Boolean
  })

  const formatted = computed(() => Utils.formatNumberToMoney(props.count) || '0')
</script>

<template>
  <div
    class="relative group flex items-center gap-2 rounded-lg px-3 py-1 transition-colors duration-200"
    :class="clickable ? 'cursor-pointer hover:bg-fig-bg-secondary' : ''"
  >
    <span
      class="h-2.5 w-2.5 shrink-0 rounded-full"
      :style="{ backgroundColor: `var(${dotColor})` }"
    ></span>
    <p class="text-[14px] leading-5 whitespace-nowrap text-fig-text-muted">
      {{ label }}
    </p>
    <p class="text-[18px] leading-6 font-bold whitespace-nowrap text-fig-text-primary">
      <UICountUp :value="formatted" />
    </p>
    <n-icon
      v-if="clickable"
      size="16"
      class="shrink-0 text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100"
    >
      <Eye20Filled />
    </n-icon>
  </div>
</template>
