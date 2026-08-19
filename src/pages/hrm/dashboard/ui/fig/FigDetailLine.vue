<script setup>
  /**
   * Figma v3 "Details Line" (node 2959:59268) — 2px rangli chiziq + ostma-ost
   * "nom / qiymat" juftligi. Nogironlik va kasallik varaqalari kartalarida
   * donut yonidagi ro'yxat shu elementdan yig'iladi.
   */
  import Utils from '@/utils/Utils.js'

  const props = defineProps({
    label: String,
    value: {
      type: [Number, String],
      default: null
    },
    // `--fig-*` token nomi, masalan `--fig-icon-green`
    token: {
      type: String,
      default: '--fig-icon-brand'
    }
  })

  const formatted = computed(() =>
    props.value === null || props.value === undefined
      ? '—'
      : Utils.formatNumberToMoney(props.value) || String(props.value)
  )
</script>

<template>
  <div class="flex min-w-0 flex-1 items-center gap-2 py-1.5 pl-1">
    <span
      class="h-6 w-0.5 shrink-0 rounded-[2px]"
      :style="{ backgroundColor: `var(${token})` }"
    ></span>
    <div class="flex min-w-0 flex-1 flex-col justify-center gap-1">
      <p class="truncate text-[12px] leading-4 text-fig-text-secondary">{{ label }}</p>
      <p class="text-[14px] leading-[18px] font-semibold whitespace-nowrap text-fig-text-primary">
        {{ formatted }}
      </p>
    </div>
  </div>
</template>
