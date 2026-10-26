<script setup>
  import i18n from '@/i18n/index.js'
  import { WeatherMoon16Regular } from '@vicons/fluent'
  import { dayStrip } from './shiftPattern.js'

  const props = defineProps({
    shiftType: {
      type: Object,
      default: null
    },
    // strip — kartadagi ixcham chiziq, tiles — sarlavhadagi batafsil kunlar.
    variant: {
      type: String,
      default: 'strip'
    }
  })

  const { t } = i18n.global

  const days = computed(() => dayStrip(props.shiftType))

  const dayLabel = (d, i) => (d.weekKey ? t(`shortWeek.${d.weekKey}`) : String(i + 1))
  const dayTitle = (d, i) =>
    `${dayLabel(d, i)}: ${d.work ? `${d.start}–${d.end}` : t('shiftType.groupView.rest')}`

  const barClass = (d) => (d.night ? 'bg-fig-indigo' : d.work ? 'bg-primary' : 'bg-surface-line')
  const tileClass = (d) =>
    d.night
      ? 'bg-fig-chip-indigo text-fig-chip-indigo-text'
      : d.work
        ? 'bg-primary/10 text-primary'
        : 'bg-surface-ground/60 text-secondary border border-dashed border-surface-line'
</script>

<template>
  <div v-if="days.length && variant === 'strip'" class="flex items-center gap-[3px]">
    <span
      v-for="(d, i) in days"
      :key="i"
      :title="dayTitle(d, i)"
      class="h-1.5 flex-1 max-w-[18px] rounded-full"
      :class="barClass(d)"
    />
  </div>

  <div v-else-if="days.length" class="flex flex-wrap gap-1.5">
    <div
      v-for="(d, i) in days"
      :key="i"
      :title="dayTitle(d, i)"
      class="w-[58px] h-[48px] rounded-lg flex flex-col items-center justify-center gap-0.5 text-[11px] leading-[1.1]"
      :class="tileClass(d)"
    >
      <span class="flex items-center gap-0.5 opacity-75">
        {{ dayLabel(d, i) }}
        <n-icon v-if="d.night" size="11"><WeatherMoon16Regular /></n-icon>
      </span>
      <template v-if="d.work">
        <span class="font-semibold">{{ d.start }}</span>
        <span>{{ d.end }}</span>
      </template>
      <span v-else class="font-medium">{{ $t('shiftType.groupView.rest') }}</span>
    </div>
  </div>
</template>
