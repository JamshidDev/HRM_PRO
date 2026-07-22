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

  // Vacations can span more than one calendar month, so render one grid per
  // month covered by the range instead of only the month `from` falls in.
  const MAX_MONTHS = 12

  const buildMonth = (monthStart, from, to) => {
    const leadingDays = (monthStart.day() + 6) % 7
    const gridStart = monthStart.subtract(leadingDays, 'day')

    const days = Array.from({ length: 42 }, (_, i) => {
      const date = gridStart.add(i, 'day')
      return {
        date,
        inMonth: date.month() === monthStart.month(),
        isEdge: date.isSame(from, 'day') || date.isSame(to, 'day'),
        inRange: !date.isBefore(from, 'day') && !date.isAfter(to, 'day')
      }
    })

    const allWeeks = Array.from({ length: 6 }, (_, i) => days.slice(i * 7, i * 7 + 7))
    // Trim trailing weeks that fall entirely outside the month — a month
    // starting on Monday only ever needs 5 rows, not a fixed 6.
    while (allWeeks.length > 1 && allWeeks[allWeeks.length - 1].every((day) => !day.inMonth)) {
      allWeeks.pop()
    }

    return {
      key: monthStart.format('YYYY-MM'),
      title: monthStart.format('MMMM YYYY'),
      weeks: allWeeks
    }
  }

  const months = computed(() => {
    if (!props.from) return []
    const from = dayjs(props.from).startOf('day')
    const to = dayjs(props.to || props.from).startOf('day')

    const list = []
    let cursor = from.startOf('month')
    const lastMonth = to.isAfter(from) ? to.startOf('month') : cursor

    while ((cursor.isBefore(lastMonth) || cursor.isSame(lastMonth, 'month')) && list.length < MAX_MONTHS) {
      list.push(buildMonth(cursor, from, to))
      cursor = cursor.add(1, 'month')
    }

    return list
  })
</script>

<template>
  <n-modal :show="show" @update:show="emits('update:show', $event)">
    <div
      class="w-full max-w-[460px] mx-4 max-h-[92vh] overflow-y-auto bg-surface-section rounded-3xl shadow-2xl p-6"
    >
      <div class="flex items-center justify-between gap-2 mb-4">
        <span class="text-xl font-bold text-textColor0 capitalize">
          {{ months.length > 1 ? `${months[0]?.title} — ${months[months.length - 1]?.title}` : months[0]?.title }}
        </span>
        <span class="text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1.5 shrink-0">
          {{ $t('workerView.vacation.calendarLabel') }}
        </span>
      </div>

      <div v-for="(month, mIdx) in months" :key="month.key" :class="mIdx !== 0 ? 'mt-4' : ''">
        <div v-if="months.length > 1" class="text-sm font-semibold text-textColor0 mb-2 capitalize">
          {{ month.title }}
        </div>
        <div class="grid grid-cols-7 gap-1 text-center text-xs text-textColor3 mb-1">
          <span v-for="label in WEEKDAY_LABELS" :key="label">{{ label }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <div v-for="(week, wIdx) in month.weeks" :key="wIdx" class="grid grid-cols-7 gap-1">
            <span
              v-for="day in week"
              :key="day.date.toString()"
              class="h-9 flex items-center justify-center text-sm rounded-full"
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
    </div>
  </n-modal>
</template>
