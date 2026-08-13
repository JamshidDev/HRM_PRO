<script setup>
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
    if (isGood.value === null) return 'text-fig-text-muted'
    return isGood.value ? 'text-fig-success' : 'text-fig-red'
  })

  const percentText = computed(() => {
    if (!props.delta || props.delta.percent === null) return null
    return `${Math.abs(props.delta.percent).toFixed(1).replace('.', ',')} %`
  })

  // Maketda ikki variant bor: qisqa "▼ −6,1 %" — 12px, to'liq "▲ +180 (8,5 %)" — 10px.
  const text = computed(() => {
    if (!props.delta) return ''
    const arrow = props.delta.dir === 'down' ? '▼' : props.delta.dir === 'up' ? '▲' : '—'
    const abs = Math.abs(props.delta.diff)
    const sign = props.delta.dir === 'down' ? '−' : props.delta.dir === 'up' ? '+' : ''
    const value = `${sign}${Utils.formatNumberToMoney(abs) || '0'}`
    return percentText.value ? `${arrow} ${value} (${percentText.value})` : `${arrow} ${value}`
  })
</script>

<template>
  <div v-if="loading" class="flex items-center gap-2">
    <n-skeleton v-if="!hideLabel" text style="width: 90px" size="small" />
    <n-skeleton text style="width: 70px" size="small" />
  </div>

  <div v-else-if="delta" class="flex items-center gap-2 flex-wrap">
    <span
      v-if="!hideLabel"
      class="text-[12px] leading-[16px] text-fig-text-muted whitespace-nowrap"
    >
      {{ $t(label) }}
    </span>
    <span class="text-[10px] leading-[16px] font-semibold whitespace-nowrap" :class="colorClass">
      {{ text }}
    </span>
  </div>
</template>
