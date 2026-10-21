<script setup>
  import { useAccountStore, useScheduleGroupWorkerStore } from '@/store/modules/index.js'
  import { UIModal } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import { Warning16Regular } from '@vicons/fluent'

  // Xodimni guruhdan chiqarish: tanlangan kundan oy oxirigacha grafigi o'chadi, o'rni bo'sh qoladi.
  const store = useScheduleGroupWorkerStore()
  const accStore = useAccountStore()
  const date = ref(null)

  const worker = computed(() => store.remove.worker)
  const today = Utils.timeToZone(Date.now())
  const monthFrom = computed(() => store.monthRange.from)
  const monthTo = computed(() => store.monthRange.to)
  const minDay = computed(() => (monthFrom.value && today > monthFrom.value ? today : monthFrom.value))
  const fromStr = computed(() => (date.value ? Utils.timeToZone(date.value) : null))
  const setDate = (d) => (date.value = d ? new Date(`${d}T00:00:00`).getTime() : null)

  // Standart — bugun (joriy oy), kelajak oyda — oy boshi.
  watch(
    () => store.remove.visible,
    (v) => v && setDate(minDay.value)
  )

  // O'chadigan kunlar: reja bo'lgan kunlar soni, almashtirishlar.
  const affected = computed(() => {
    const days = (worker.value?.days ?? []).filter((d) => !d.isEmpty && fromStr.value && d.date >= fromStr.value)
    return {
      work: days.filter((d) => d.isWorkDay).length,
      subs: days.filter((d) => d.substitution).length
    }
  })
  const keptDays = computed(() => (worker.value?.days ?? []).filter((d) => !d.isEmpty && fromStr.value && d.date < fromStr.value).length)

  const initials = (name) =>
    String(name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0])
      .join('')
      .toUpperCase()
  const fmt = (d) => (d ? `${d.slice(8, 10)}.${d.slice(5, 7)}` : '')
  const disabledDate = (ts) => {
    const d = Utils.timeToZone(ts)
    return !minDay.value || d < minDay.value || d > monthTo.value
  }

  const onSave = () => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsGroupsWrite)) return
    if (!fromStr.value) return
    store._removeWorker({
      worker_position_id: worker.value.workerPositionId,
      group_id: store.params.group,
      from: fromStr.value
    })
  }
</script>

<template>
  <UIModal v-model:visible="store.remove.visible" :width="480" :title="$t('shiftType.groupView.removeTitle')">
    <div v-if="worker" class="flex flex-col gap-3 text-sm">
      <div class="flex items-center gap-3 rounded-xl border border-surface-line px-3 py-2.5">
        <div class="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold bg-fig-red-50 text-fig-text-red">
          {{ initials(worker.fullName) }}
        </div>
        <div class="min-w-0 flex-1">
          <div class="font-medium leading-[1.25] line-clamp-2">{{ worker.fullName }}</div>
          <div class="text-xs text-secondary line-clamp-1">{{ worker.position }}</div>
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs text-secondary">{{ $t('shiftType.groupView.removeFrom') }}</span>
          <n-button
            v-if="minDay !== monthFrom"
            size="tiny"
            secondary
            :type="fromStr === minDay ? 'primary' : 'default'"
            @click="setDate(minDay)"
          >
            {{ $t('shiftType.groupView.regenToday') }}
          </n-button>
        </div>
        <n-date-picker v-model:value="date" type="date" class="w-full" format="dd.MM.yyyy" :is-date-disabled="disabledDate" />
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div class="rounded-xl bg-surface-ground px-3 py-2">
          <div class="text-[11px] text-secondary">{{ $t('shiftType.groupView.removeKept', { to: fmt(fromStr) }) }}</div>
          <div class="font-medium">{{ $t('shiftType.groupView.removeDays', { n: keptDays }) }}</div>
        </div>
        <div class="rounded-xl bg-fig-red-50 px-3 py-2">
          <div class="text-[11px] text-fig-text-red">{{ $t('shiftType.groupView.removeGone', { from: fmt(fromStr), to: fmt(monthTo) }) }}</div>
          <div class="font-medium text-fig-text-red">{{ $t('shiftType.groupView.removeWorkDays', { n: affected.work }) }}</div>
        </div>
      </div>

      <div class="flex flex-col gap-1.5 text-xs text-secondary">
        <div class="flex items-start gap-1.5">
          <n-icon size="14" class="mt-px shrink-0 text-warning"><Warning16Regular /></n-icon>
          {{ $t('shiftType.groupView.removeHint', { from: fmt(fromStr) }) }}
        </div>
        <div v-if="affected.subs" class="flex items-start gap-1.5">
          <n-icon size="14" class="mt-px shrink-0 text-warning"><Warning16Regular /></n-icon>
          {{ $t('shiftType.groupView.removeSubs', { n: affected.subs }) }}
        </div>
      </div>

      <div class="flex justify-end gap-4 mt-1">
        <n-button @click="store.remove.visible = false" secondary>
          {{ $t('content.cancel') }}
        </n-button>
        <n-button @click="onSave" :loading="store.remove.loading" :disabled="!fromStr" type="error">
          {{ $t('content.delete') }}
        </n-button>
      </div>
    </div>
  </UIModal>
</template>
