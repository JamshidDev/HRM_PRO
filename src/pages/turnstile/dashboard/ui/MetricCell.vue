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
    // token nomi: primary | success | warning | danger | dark | secondary
    color: {
      type: String,
      default: 'primary'
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
    clickable: Boolean,
    size: {
      type: String,
      default: 'md' // md | lg
    }
  })

  const dotClass = computed(
    () =>
      ({
        primary: 'bg-primary',
        success: 'bg-success',
        warning: 'bg-warning',
        danger: 'bg-danger',
        dark: 'bg-dark',
        secondary: 'bg-secondary'
      })[props.color] || 'bg-primary'
  )

  const countClass = computed(() =>
    props.size === 'lg' ? 'text-[28px] leading-[1.1]' : 'text-[22px] leading-[1.15]'
  )

  const formatted = computed(() => Utils.formatNumberToMoney(props.count) || '0')
</script>

<template>
  <div
    class="relative group p-2 rounded-xl transition-all duration-300"
    :class="clickable ? 'cursor-pointer hover:bg-primary/6' : ''"
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
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full shrink-0" :class="dotClass"></span>
        <span class="text-xs font-medium text-secondary leading-[1.2] line-clamp-1">
          {{ label }}
        </span>
      </div>
      <div class="font-grotesk font-bold text-textColor0 mt-2" :class="countClass">
        {{ formatted }}
      </div>
      <DeltaBadge
        class="mt-2"
        :delta="delta"
        :invert="invert"
        :label="deltaLabel"
        :loading="deltaLoading"
      />
    </div>
  </div>
</template>
