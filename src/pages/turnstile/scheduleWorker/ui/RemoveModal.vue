<script setup>
  import { useAccountStore, useScheduleGroupWorkerStore } from '@/store/modules/index.js'
  import { UIModal } from '@/components/index.js'
  import WorkerCard from './WorkerCard.vue'

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
    <div v-if="worker" class="flex flex-col gap-4 text-sm">
      <WorkerCard :name="worker.fullName" :position="worker.position" tone="danger">
        <div class="mt-1 text-xs text-fig-text-red">
          {{ $t('shiftType.groupView.removeGone', { from: fmt(monthFrom), to: fmt(monthTo) }) }} ·
          {{ $t('shiftType.groupView.removeWorkDays', { n: affected.work }) }}
        </div>
      </WorkerCard>

      <n-alert v-if="affected.subs" type="warning" :show-icon="false">
        {{ $t('shiftType.groupView.removeSubs', { n: affected.subs }) }}
      </n-alert>

      <div class="flex justify-end gap-3 pt-2">
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
