<script setup>
  import dayjs from 'dayjs'

  const props = defineProps({
    from: {
      type: String,
      default: null
    },
    to: {
      type: String,
      default: null
    }
  })

  // Fixed Mon-Sun short labels matching the design — this widget has no
  // locale-driven weekday-short i18n keys anywhere in the codebase.
  const WEEKDAY_LABELS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']

  const title = computed(() => (props.from ? dayjs(props.from).format('MMMM YYYY') : ''))

  const weeks = computed(() => {
    if (!props.from) return []
    const monthStart = dayjs(props.from).startOf('month')
    const leadingDays = (monthStart.day() + 6) % 7
    const gridStart = monthStart.subtract(leadingDays, 'day')
    const from = dayjs(props.from).startOf('day')
    const to = dayjs(props.to || props.from).startOf('day')

    const days = Array.from({ length: 42 }, (_, i) => {
      const date = gridStart.add(i, 'day')
      return {
        date,
        inMonth: date.month() === monthStart.month(),
        isEdge: date.isSame(from, 'day') || date.isSame(to, 'day'),
        inRange: !date.isBefore(from, 'day') && !date.isAfter(to, 'day')
      }
    })

    return Array.from({ length: 6 }, (_, i) => days.slice(i * 7, i * 7 + 7))
  })
</script>

<template>
  <div class="bg-surface-ground rounded-lg p-3">
    <div class="text-sm font-semibold text-textColor0 mb-1 capitalize">{{ title }}</div>
    <div class="text-xs text-textColor3 mb-2">{{ $t('workerView.vacation.calendarLabel') }}</div>
    <div class="grid grid-cols-7 gap-1 text-center text-xs text-textColor3 mb-1">
      <span v-for="label in WEEKDAY_LABELS" :key="label">{{ label }}</span>
    </div>
    <div class="flex flex-col gap-1">
      <div v-for="(week, wIdx) in weeks" :key="wIdx" class="grid grid-cols-7 gap-1">
        <span
          v-for="day in week"
          :key="day.date.toString()"
          class="h-7 flex items-center justify-center text-xs rounded-full"
          :class="[
            !day.inMonth && 'text-textColor3/40',
            day.inMonth && !day.inRange && 'text-textColor2',
            day.inRange && !day.isEdge && 'bg-orange-500/15 text-orange-600',
            day.isEdge && 'bg-orange-500 text-white font-semibold'
          ]"
        >
          {{ day.date.date() }}
        </span>
      </div>
    </div>
  </div>
</template>
