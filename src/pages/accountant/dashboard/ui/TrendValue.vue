<script setup>
  import TriangleRed from '@/assets/icons/accDashboard/triangle-red.svg'
  import TriangleGreen from '@/assets/icons/accDashboard/triangle-green.svg'
  import { toPercent } from '../format.js'

  const props = defineProps({
    // `Utils.compareDelta` natijasi: {diff, percent, dir} yoki null
    delta: {
      type: Object,
      default: null
    }
  })

  // Maketdagi uchburchak yuqoriga qaragan holda eksport qilingan — pasayishda
  // qizil nusxasi 180° buriladi.
  const dir = computed(() => (props.delta?.percent ? props.delta.dir : 'flat'))

  const hasPercent = computed(
    () => props.delta && props.delta.percent !== null && props.delta.percent !== undefined
  )

  const colorClass = computed(
    () =>
      ({
        up: 'text-fig-text-green',
        down: 'text-fig-text-red'
      })[dir.value] || 'text-fig-text-tertiary'
  )
</script>

<template>
  <div v-if="hasPercent" class="flex shrink-0 items-center gap-1">
    <span
      v-if="dir !== 'flat'"
      class="flex h-3 w-3 items-center justify-center"
      :class="dir === 'down' && 'rotate-180'"
    >
      <component :is="dir === 'up' ? TriangleGreen : TriangleRed" />
    </span>
    <p class="whitespace-nowrap text-right text-[12px] leading-4 font-semibold" :class="colorClass">
      {{ toPercent(delta.percent) }}%
    </p>
  </div>
  <p v-else class="shrink-0 text-[12px] leading-4 text-fig-text-tertiary">—</p>
</template>
