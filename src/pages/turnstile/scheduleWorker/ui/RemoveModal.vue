<script setup>
  import { useAccountStore, useScheduleGroupWorkerStore } from '@/store/modules/index.js'
  import { UIModal } from '@/components/index.js'
  import { Warning16Regular } from '@vicons/fluent'

  // Xodimni guruhdan chiqarish: shu oydagi butun grafigi o'chadi, o'rni bo'sh qoladi.
  const store = useScheduleGroupWorkerStore()
  const accStore = useAccountStore()
  const worker = computed(() => store.remove.worker)
  const monthFrom = computed(() => store.monthRange.from)
  const monthTo = computed(() => store.monthRange.to)

  // Butun oy o'chadi: reja bo'lgan ish kunlari va almashtirishlar soni.
  const affected = computed(() => {
    const days = (worker.value?.days ?? []).filter((d) => !d.isEmpty)
    return {
      work: days.filter((d) => d.isWorkDay).length,
      subs: days.filter((d) => d.substitution).length
    }
  })

  const initials = (name) =>
    String(name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0])
      .join('')
      .toUpperCase()
  const fmt = (d) => (d ? `${d.slice(8, 10)}.${d.slice(5, 7)}` : '')

  const onSave = () => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsGroupsWrite)) return
    store._removeWorker({
      worker_position_id: worker.value.workerPositionId,
      group_id: store.params.group,
      from: monthFrom.value
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

      <div class="rounded-xl bg-fig-red-50 px-3 py-2.5 flex items-center justify-between gap-3">
        <div>
          <div class="text-[11px] text-fig-text-red">{{ $t('shiftType.groupView.removeGone', { from: fmt(monthFrom), to: fmt(monthTo) }) }}</div>
          <div class="font-medium text-fig-text-red">{{ $t('shiftType.groupView.removeWorkDays', { n: affected.work }) }}</div>
        </div>
        <span class="text-xs text-fig-text-red font-medium">{{ $t('shiftType.groupView.removeWholeMonth') }}</span>
      </div>

      <div class="flex flex-col gap-1.5 text-xs text-secondary">
        <div class="flex items-start gap-1.5">
          <n-icon size="14" class="mt-px shrink-0 text-warning"><Warning16Regular /></n-icon>
          {{ $t('shiftType.groupView.removeHintMonth') }}
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
        <n-button @click="onSave" :loading="store.remove.loading" type="error">
          {{ $t('content.delete') }}
        </n-button>
      </div>
    </div>
  </UIModal>
</template>
