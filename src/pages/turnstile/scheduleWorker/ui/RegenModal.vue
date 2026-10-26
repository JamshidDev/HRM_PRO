<script setup>
  import { useAccountStore, useScheduleGroupWorkerStore } from '@/store/modules/index.js'
  import { UIModal } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import { cycleDays } from './navbat.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  // Xodim grafigini o'z navbati naqshi bo'yicha qayta yozish (qo'lda o'zgartirilgan kunlar tiklanadi).
  const store = useScheduleGroupWorkerStore()
  const accStore = useAccountStore()

  const saving = ref(false)
  const date = ref(null)
  // Navbat aniqlanmagan bo'lsa — tanlangan sanada naqshning qaysi kuni.
  const startIndex = ref(null)

  const worker = computed(() => store.regen.worker)
  const navbat = computed(() => worker.value?.navbat ?? null)
  const changedCount = computed(() => (worker.value?.days ?? []).filter((d) => d.changed).length)
  const patternOptions = computed(() => {
    const rest = t('shiftType.groupView.rest')
    return cycleDays(store.shiftType).map((d, i) => ({
      value: i + 1,
      label: `${i + 1}-kun · ${d.work_status ? `${d.start_time ?? ''}–${d.end_time ?? ''}` : rest}`
    }))
  })

  const monthDays = computed(() => store.list[0]?.days ?? [])
  const firstDay = computed(() => monthDays.value[0]?.date ?? null)
  const lastDay = computed(() => monthDays.value[monthDays.value.length - 1]?.date ?? null)
  const minDay = computed(() => {
    const start = store.params.startDate ? String(store.params.startDate).slice(0, 10) : null
    return start && firstDay.value && start > firstDay.value ? start : firstDay.value
  })
  // Smena oxiri yoki oy oxiri (qaysi oldin bo'lsa).
  const endDate = computed(() => {
    const end = store.params.endDate ? String(store.params.endDate).slice(0, 10) : null
    const monthEnd = store.monthRange.to || lastDay.value
    return end && end < monthEnd ? end : monthEnd
  })

  watch(
    () => store.regen.visible,
    (v) => {
      if (!v) return
      startIndex.value = null
      // Standart — bugun (oy/smena davri ichida bo'lsa), aks holda davr boshi.
      setDate(todayAllowed.value ? today : minDay.value)
    }
  )

  // Backend birinchi kunda (day+1)%n naqshini oladi; navbat oyning birinchi kuniga nisbatan.
  const dayOffset = () => {
    const n = cycleDays(store.shiftType).length
    let index
    if (navbat.value) {
      const start = Utils.timeToZone(date.value)
      const diff = Math.round((new Date(`${start}T00:00:00`) - new Date(`${firstDay.value}T00:00:00`)) / 86400000)
      index = (((navbat.value - 1 + diff) % n) + n) % n
    } else {
      index = (startIndex.value - 1) % n
    }
    return (index - 1 + n) % n
  }

  const canSave = computed(() => !!worker.value && !!date.value && (!!navbat.value || !!startIndex.value))

  const onSave = () => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsGroupsWrite)) return
    if (!canSave.value) return
    saving.value = true
    $ApiService.shiftTypeService
      ._generateWorkerSchedule({
        data: {
          schedule_type: store.shiftType.id,
          group_id: store.params.group,
          start_date: Utils.timeToZone(date.value),
          end_date: endDate.value,
          schedule_workers: [{ worker_position_id: worker.value.workerPositionId, day: dayOffset() }]
        }
      })
      .then(() => {
        store.regen.visible = false
        store._index()
      })
      .finally(() => {
        saving.value = false
      })
  }

  const disabledDate = (ts) => {
    const d = Utils.timeToZone(ts)
    return !minDay.value || d < minDay.value || d > endDate.value
  }

  const initials = (name) =>
    String(name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0])
      .join('')
      .toUpperCase()
  const today = Utils.timeToZone(Date.now())
  const todayAllowed = computed(() => !!minDay.value && today >= minDay.value && today <= endDate.value)
  const setDate = (d) => (date.value = d ? new Date(`${d}T00:00:00`).getTime() : null)
  const startStr = computed(() => (date.value ? Utils.timeToZone(date.value) : null))

</script>

<template>
  <UIModal v-model:visible="store.regen.visible" :width="480" :title="$t('shiftType.groupView.regenTitle')">
    <div v-if="worker" class="flex flex-col gap-5 text-sm">
      <div class="flex items-center gap-3 rounded-xl border border-surface-line p-3">
        <div
          class="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold bg-primary/10 text-primary"
        >
          {{ initials(worker.fullName) }}
        </div>
        <div class="min-w-0 flex-1">
          <div class="font-medium leading-[1.3] line-clamp-1" :title="worker.fullName">{{ worker.fullName }}</div>
          <div class="mt-0.5 text-xs text-secondary line-clamp-1">{{ worker.position }}</div>
        </div>
        <div class="shrink-0 flex flex-col items-end gap-1 text-[11px] leading-none">
          <span class="px-2 py-1 rounded-md bg-surface-ground font-medium">
            {{ navbat ? $t('shiftType.groupView.regenNavbat', { n: navbat }) : $t('shiftType.groupView.regenUnknown') }}
          </span>
          <span v-if="changedCount" class="px-2 py-1 rounded-md bg-warning/10 text-warning font-medium">
            {{ $t('shiftType.groupView.regenChanged', { n: changedCount }) }}
          </span>
        </div>
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
      </div>

      <div v-if="!navbat" class="flex flex-col gap-1.5">
        <div class="h-6 flex items-center text-xs text-secondary">{{ $t('shiftType.groupView.patternStart') }}</div>
        <n-select v-model:value="startIndex" :options="patternOptions" />
      </div>

      <div class="-mx-6 px-6 pt-4 border-t border-surface-line flex justify-end gap-3">
        <n-button type="error" secondary @click="store.regen.visible = false">
          {{ $t('content.cancel') }}
        </n-button>
        <n-button type="primary" :loading="saving" :disabled="!canSave" @click="onSave">
          {{ $t('content.save') }}
        </n-button>
      </div>
    </div>
  </UIModal>
</template>
