<script setup>
  import dayjs from 'dayjs'

  const props = defineProps({
    show: {
      type: Boolean,
      default: false
    },
    from: {
      type: String,
      default: null
    },
    to: {
      type: String,
      default: null
    }
  })

  const emits = defineEmits(['update:show'])

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
  <n-modal :show="show" @update:show="emits('update:show', $event)">
    <div class="w-full max-w-[420px] mx-4 bg-surface-section rounded-3xl shadow-2xl p-6">
      <div class="flex items-center justify-between gap-2 mb-4">
        <span class="text-xl font-bold text-textColor0 capitalize">{{ title }}</span>
        <span class="text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1.5 shrink-0">
          {{ $t('workerView.vacation.calendarLabel') }}
        </span>
      </div>

      <div class="grid grid-cols-7 gap-1 text-center text-xs text-textColor3 mb-2">
        <span v-for="label in WEEKDAY_LABELS" :key="label">{{ label }}</span>
      </div>
      <div class="flex flex-col gap-1">
        <div v-for="(week, wIdx) in weeks" :key="wIdx" class="grid grid-cols-7 gap-1">
          <span
            v-for="day in week"
            :key="day.date.toString()"
            class="h-10 flex items-center justify-center text-sm rounded-full"
            :class="[!day.inMonth && 'invisible', day.inMonth && !day.inRange && 'text-textColor0']"
            :style="
              day.isEdge
                ? { backgroundColor: '#f97316', color: '#ffffff', fontWeight: 700 }
                : day.inRange
                  ? { backgroundColor: 'rgba(249, 115, 22, 0.18)', color: '#ea580c', fontWeight: 600 }
                  : {}
            "
          >
            {{ day.date.date() }}
          </span>
        </div>
      </div>
    </div>
  </n-modal>
</template>
