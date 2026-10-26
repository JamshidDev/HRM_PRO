<script setup>
  import { useAccountStore, useScheduleGroupWorkerStore } from '@/store/modules/index.js'
  import { UIModal } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import { CalendarLtr16Regular, People16Regular, Warning16Regular } from '@vicons/fluent'
  import { cycleDays, navbatOf, patternOf } from './navbat.js'

  // Butun guruh grafigini joriy oyda tanlangan sanadan oy oxirigacha navbat bo'yicha qayta yozish.
  const store = useScheduleGroupWorkerStore()
  const accStore = useAccountStore()

  const saving = ref(false)
  const date = ref(null)

  const today = Utils.timeToZone(Date.now())
  const monthDays = computed(() => store.list[0]?.days ?? [])
  const firstDay = computed(() => monthDays.value[0]?.date ?? null)

  // Joriy oy ∩ guruh davri.
  const minDay = computed(() => {
    const start = store.params.startDate ? String(store.params.startDate).slice(0, 10) : null
    const from = store.monthRange.from
    return start && start > from ? start : from
  })
  const endDate = computed(() => {
    const end = store.params.endDate ? String(store.params.endDate).slice(0, 10) : null
    const to = store.monthRange.to
    return end && end < to ? end : to
  })
  const todayAllowed = computed(() => today >= minDay.value && today <= endDate.value)

  // Guruh xodimlari va ularning navbati (sahifadagi jadval bilan bir xil hisob).
  const workers = computed(() => {
    const pat = patternOf(store.shiftType)
    const seen = new Set()
    return store.list
      .filter((v) => v.worker_position_id && !seen.has(v.worker_position_id) && seen.add(v.worker_position_id))
      .map((v) => ({ wp: v.worker_position_id, navbat: navbatOf(v.days, pat) }))
  })
  const ready = computed(() => workers.value.filter((w) => w.navbat))
  const skipped = computed(() => workers.value.length - ready.value.length)

  const startStr = computed(() => (date.value ? Utils.timeToZone(date.value) : null))
  const setDate = (d) => (date.value = d ? new Date(`${d}T00:00:00`).getTime() : null)

  watch(
    () => store.groupRegen.visible,
    (v) => v && setDate(todayAllowed.value ? today : minDay.value)
  )

  // Backend birinchi kunda (day+1)%n naqshini oladi; navbat oyning birinchi kuniga nisbatan.
  const dayOffset = (navbat) => {
    const n = cycleDays(store.shiftType).length
    const diff = Math.round((new Date(`${startStr.value}T00:00:00`) - new Date(`${firstDay.value}T00:00:00`)) / 86400000)
    const index = (((navbat - 1 + diff) % n) + n) % n
    return (index - 1 + n) % n
  }

  const canSave = computed(() => !!startStr.value && !!firstDay.value && ready.value.length > 0)

  const onSave = () => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsGroupsWrite)) return
    if (!canSave.value) return
    saving.value = true
    $ApiService.shiftTypeService
      ._generateWorkerSchedule({
        data: {
          schedule_type: store.shiftType.id,
          group_id: store.params.group,
          start_date: startStr.value,
          end_date: endDate.value,
          schedule_workers: ready.value.map((w) => ({ worker_position_id: w.wp, day: dayOffset(w.navbat) }))
        }
      })
      .then(() => {
        store.groupRegen.visible = false
        store._index()
      })
      .finally(() => {
        saving.value = false
      })
  }

  const disabledDate = (ts) => {
    const d = Utils.timeToZone(ts)
    return d < minDay.value || d > endDate.value
  }
  const fmt = (d) => (d ? `${d.slice(8, 10)}.${d.slice(5, 7)}` : '')
  const monthName = computed(() => {
    const [y, m] = String(store.selectedDate || '').split('-').map(Number)
    return m ? `${Utils.monthList.find((x) => x.id === m)?.name ?? ''} ${y}` : ''
  })
</script>

<template>
  <UIModal v-model:visible="store.groupRegen.visible" :width="480" :title="$t('shiftType.groupView.groupRegenTitle')">
    <div class="flex flex-col gap-5 text-sm">
      <div class="flex items-center gap-3 rounded-xl border border-surface-line p-3">
        <div class="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-primary/10 text-primary">
          <n-icon size="20"><People16Regular /></n-icon>
        </div>
        <div class="min-w-0 flex-1">
          <div class="font-medium leading-[1.3] line-clamp-1" :title="store.shiftType?.name">
            {{ store.shiftType?.name }}
          </div>
          <div class="mt-0.5 flex items-center gap-1 text-xs text-secondary">
            <n-icon size="13"><CalendarLtr16Regular /></n-icon>{{ monthName }}
          </div>
        </div>
        <span class="shrink-0 px-2 py-1 rounded-md bg-surface-ground text-[11px] leading-none font-medium">
          {{ $t('shiftType.groupView.groupRegenWorkers', { n: ready.length }) }}
        </span>
      </div>

      <div class="flex flex-col gap-1.5">
        <div class="h-6 flex items-center justify-between gap-2">
          <span class="text-xs text-secondary">{{ $t('shiftType.groupView.regenFrom') }}</span>
          <div class="flex gap-1.5">
            <n-button
              v-if="todayAllowed"
              size="tiny"
              secondary
              :type="startStr === today ? 'primary' : 'default'"
              @click="setDate(today)"
            >
              {{ $t('shiftType.groupView.regenToday') }}
            </n-button>
            <n-button size="tiny" secondary :type="startStr === minDay ? 'primary' : 'default'" @click="setDate(minDay)">
              {{ $t('shiftType.groupView.regenMonthStart') }}
            </n-button>
          </div>
        </div>
        <n-date-picker
          v-model:value="date"
          type="date"
          class="w-full"
          format="dd.MM.yyyy"
          :clearable="false"
          :is-date-disabled="disabledDate"
        />
        <div class="text-xs text-secondary">
          {{ $t('shiftType.groupView.groupRegenRange', { from: fmt(startStr), to: fmt(endDate) }) }}
        </div>
      </div>

      <div v-if="skipped" class="flex items-start gap-2 px-3 py-2 rounded-lg bg-warning/10 text-warning text-xs">
        <n-icon size="14" class="mt-px shrink-0"><Warning16Regular /></n-icon>
        {{ $t('shiftType.groupView.groupRegenSkipped', { n: skipped }) }}
      </div>

      <div class="-mx-6 px-6 pt-4 border-t border-surface-line flex justify-end gap-3">
        <n-button type="error" secondary @click="store.groupRegen.visible = false">
          {{ $t('content.cancel') }}
        </n-button>
        <n-button type="primary" :loading="saving" :disabled="!canSave" @click="onSave">
          {{ $t('shiftType.groupView.groupRegen') }}
        </n-button>
      </div>
    </div>
  </UIModal>
</template>
