<script setup>
  import { ChevronRight20Regular, Info16Regular } from '@vicons/fluent'
  import { UICountUp } from '@/components/index.js'
  import { Utils } from '@/utils/index.js'
  import { TINT, TINT_STYLE } from '@/pages/turnstile/dashboard/ui/palette.js'

  // Hodisalar sahifasi kartasi: sarlavha + qatorlar (katta son yo'q); qator bosilsa ro'yxat ochiladi.
  const props = defineProps({
    title: String,
    icon: Object,
    tint: { type: String, default: 'main' },
    hint: { type: String, default: null },
    // [{ label, value, previewType? }]
    rows: { type: Array, default: () => [] }
  })
  const emits = defineEmits(['rowPreview'])

  const tint = computed(() => TINT_STYLE[TINT[props.tint] || props.tint] || TINT_STYLE.blue)
  const formatCount = (v) => Utils.formatNumberToMoney(v) || '0'
</script>

<template>
  <div
    class="flex flex-col gap-1.5 overflow-hidden rounded-2xl bg-fig-block shadow-card px-1 pt-1.5 pb-1"
  >
    <div class="flex items-center gap-1 px-2 min-h-[28px]">
      <span class="shrink-0 rounded-lg p-1" :class="tint[0]">
        <span
          class="stat-icon flex h-5 w-5 items-center justify-center"
          :style="{ color: `var(${tint[1]})` }"
        >
          <component :is="icon" />
        </span>
      </span>
      <p
        class="min-w-0 flex-1 truncate text-[14px] leading-[18px] font-medium text-fig-text-tertiary"
      >
        {{ title }}
      </p>
      <n-tooltip v-if="hint" :style="{ maxWidth: '280px' }">
        <template #trigger>
          <n-icon size="16" class="shrink-0 cursor-help text-fig-text-tertiary">
            <Info16Regular />
          </n-icon>
        </template>
        {{ hint }}
      </n-tooltip>
      <slot name="action" />
    </div>
    <div class="flex flex-col rounded-xl bg-fig-bg-secondary p-1">
      <component
        :is="row.previewType ? 'button' : 'div'"
        v-for="(row, idx) in rows"
        :key="idx"
        type="button"
        class="group/row flex h-7 w-full items-center gap-2 rounded-lg px-2 text-left transition-colors duration-200"
        :class="row.previewType ? 'cursor-pointer hover:bg-fig-block' : 'cursor-default'"
        @click.stop="row.previewType && emits('rowPreview', row.previewType)"
      >
        <p
          class="min-w-0 flex-1 truncate text-[12px] leading-4 text-fig-text-tertiary"
          :title="row.label"
        >
          {{ row.label }}
        </p>
        <p
          class="shrink-0 text-right text-[13px] leading-4 font-semibold whitespace-nowrap text-fig-text-primary"
        >
          <UICountUp :value="formatCount(row.value)" />
        </p>
        <n-icon
          size="14"
          class="shrink-0 text-fig-text-tertiary transition-transform duration-200 group-hover/row:translate-x-0.5"
          :class="row.previewType ? '' : 'invisible'"
        >
          <ChevronRight20Regular />
        </n-icon>
      </component>
    </div>
    <slot name="footer" />
  </div>
</template>

<style scoped>
  .stat-icon :deep(svg:not([width])) {
    width: 20px;
    height: 20px;
  }
</style>
