<script setup>
  import { ArrowUp16Filled, ArrowDown16Filled } from '@vicons/fluent'
  import { Utils } from '@/utils/index.js'

  const props = defineProps({
    // Store'ning `deltas` getteridan keladi: {diff, percent, dir} yoki null
    delta: {
      type: Object,
      default: null
    },
    label: {
      type: String,
      default: 'turnStileDashboard.compare.vsYesterday'
    },
    // O'sish yomon bo'lgan metrikalar uchun (kelmaganlar, kech kelganlar, oflayn qurilmalar)
    invert: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    // Faqat farq ko'rsatkichi, "o'tgan kunga nisbatan" matnisiz
    hideLabel: {
      type: Boolean,
      default: false
    }
  })

  const isGood = computed(() => {
    if (!props.delta || props.delta.dir === 'flat') return null
    const grew = props.delta.dir === 'up'
    return props.invert ? !grew : grew
  })

  const colorClass = computed(() => {
    if (isGood.value === null) return 'text-secondary'
    return isGood.value ? 'text-success' : 'text-danger'
  })

  const diffText = computed(() => {
    if (!props.delta) return ''
    const abs = Math.abs(props.delta.diff)
    const sign = props.delta.dir === 'down' ? '−' : props.delta.dir === 'up' ? '+' : ''
    return `${sign}${Utils.formatNumberToMoney(abs) || '0'}`
  })

  const percentText = computed(() => {
    if (!props.delta || props.delta.percent === null) return null
    return `${Math.abs(props.delta.percent).toFixed(1).replace('.', ',')} %`
  })
</script>

<template>
  <div v-if="loading" class="flex items-center gap-2">
    <n-skeleton v-if="!hideLabel" text style="width: 90px" size="small" />
    <n-skeleton text style="width: 60px" size="small" />
  </div>

  <div v-else-if="delta" class="flex items-center gap-2 flex-wrap">
    <span v-if="!hideLabel" class="text-[11px] leading-[1.2] text-secondary">
      {{ $t(label) }}
    </span>
    <span class="flex items-center gap-1 text-xs font-semibold leading-[1.2]" :class="colorClass">
      <n-icon v-if="delta.dir !== 'flat'" size="12">
        <ArrowUp16Filled v-if="delta.dir === 'up'" />
        <ArrowDown16Filled v-else />
      </n-icon>
      <span>{{ diffText }}</span>
      <span v-if="percentText">({{ percentText }})</span>
    </span>
  </div>
</template>
