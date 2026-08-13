<script setup>
  import { Eye20Filled } from '@vicons/fluent'
  import { Utils } from '@/utils/index.js'
  import DeltaBadge from './DeltaBadge.vue'

  const props = defineProps({
    label: String,
    count: {
      type: [Number, String],
      default: 0
    },
    // Chap chiziqcha rangi (CSS o'zgaruvchi nomi)
    barColor: {
      type: String,
      default: '--fig-icon-green'
    },
    delta: {
      type: Object,
      default: null
    },
    invert: Boolean,
    deltaLoading: Boolean,
    clickable: Boolean
  })

  const formatted = computed(() => Utils.formatNumberToMoney(props.count) || '0')
</script>

<template>
  <div
    class="relative group flex items-center gap-2 pl-1 py-1.5 min-w-0"
    :class="clickable ? 'cursor-pointer' : ''"
  >
    <div
      v-if="clickable"
      class="z-10 transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100"
    >
      <n-icon size="24">
        <Eye20Filled />
      </n-icon>
    </div>

    <span
      class="w-[2px] h-6 rounded-[2px] shrink-0 transition-all duration-300"
      :class="clickable ? 'group-hover:opacity-[0.2]' : ''"
      :style="{ backgroundColor: `var(${barColor})` }"
    ></span>

    <div
      class="flex-1 min-w-0 flex flex-col gap-1 justify-center transition-all duration-300"
      :class="clickable ? 'group-hover:opacity-[0.2]' : ''"
    >
      <p class="text-[12px] leading-[16px] text-fig-text-secondary truncate">{{ label }}</p>
      <div class="flex items-center gap-1 flex-wrap">
        <span class="font-grotesk font-semibold text-[14px] leading-[18px] text-fig-text-primary">
          {{ formatted }}
        </span>
        <DeltaBadge hide-label :delta="delta" :invert="invert" :loading="deltaLoading" />
      </div>
    </div>
  </div>
</template>
