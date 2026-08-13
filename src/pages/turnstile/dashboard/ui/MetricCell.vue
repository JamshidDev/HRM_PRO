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
    // Maketdagi legenda nuqtasi rangi (CSS o'zgaruvchi nomi)
    dotColor: {
      type: String,
      default: '--fig-icon-indigo'
    },
    delta: {
      type: Object,
      default: null
    },
    invert: Boolean,
    deltaLabel: {
      type: String,
      default: 'turnStileDashboard.compare.vsYesterday'
    },
    deltaLoading: Boolean,
    clickable: Boolean
  })

  const formatted = computed(() => Utils.formatNumberToMoney(props.count) || '0')
</script>

<template>
  <div
    class="relative group flex-1 min-w-0 flex flex-col justify-center gap-1 px-4 transition-all duration-300"
    :class="clickable ? 'cursor-pointer' : ''"
  >
    <div
      v-if="clickable"
      class="z-10 transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100"
    >
      <n-icon size="28">
        <Eye20Filled />
      </n-icon>
    </div>

    <div class="transition-all duration-300" :class="clickable ? 'group-hover:opacity-[0.2]' : ''">
      <div class="flex items-center gap-2.5">
        <span
          class="w-2.5 h-2.5 rounded-full shrink-0"
          :style="{ backgroundColor: `var(${dotColor})` }"
        ></span>
        <span class="text-[14px] leading-[20px] text-fig-text-muted truncate">
          {{ label }}
        </span>
      </div>
      <p
        class="font-grotesk font-semibold text-[20px] leading-[24px] text-fig-text-primary whitespace-nowrap mt-1"
      >
        {{ formatted }}
      </p>
      <DeltaBadge
        class="mt-1"
        :delta="delta"
        :invert="invert"
        :label="deltaLabel"
        :loading="deltaLoading"
      />
    </div>
  </div>
</template>
