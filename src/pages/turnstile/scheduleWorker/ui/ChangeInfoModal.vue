<script setup>
  import { useScheduleGroupWorkerStore } from '@/store/modules/index.js'
  import { UIModal } from '@/components/index.js'

  // O'zgartirilgan kun haqida: grafik bo'yicha reja, hozirgi holat, kim bilan almashgan.
  const store = useScheduleGroupWorkerStore()
  const info = computed(() => store.changeInfo)
  const fmt = (d) => (d ? `${d.slice(8, 10)}.${d.slice(5, 7)}.${d.slice(0, 4)}` : '')
</script>

<template>
  <UIModal v-model:visible="store.changeInfo.visible" :width="420" :title="$t('shiftType.groupView.changeTitle')">
    <div class="flex flex-col gap-3 text-sm">
      <div class="rounded-xl border border-surface-line bg-surface-ground/40 px-4 py-2">
        <div class="font-semibold leading-[1.3]">{{ info.worker }}</div>
        <div class="text-secondary text-xs">{{ [info.crew, fmt(info.date)].filter(Boolean).join(' · ') }}</div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-xl border border-surface-line px-3 py-2">
          <div class="text-xs text-secondary">{{ $t('shiftType.groupView.planned') }}</div>
          <div class="font-medium mt-1">{{ info.planned }}</div>
        </div>
        <div class="rounded-xl border border-primary/60 bg-primary/5 px-3 py-2">
          <div class="text-xs text-secondary">{{ $t('shiftType.groupView.actual') }}</div>
          <div class="font-medium mt-1 text-primary">{{ info.actual }}</div>
        </div>
      </div>

      <div v-if="info.sub" class="flex justify-between gap-3">
        <span class="text-secondary">{{ $t('shiftType.groupView.worksInstead') }}</span>
        <span class="font-medium text-right">{{ info.sub }}</span>
      </div>
      <div v-else class="flex justify-between gap-3">
        <span class="text-secondary">{{ $t('shiftType.groupView.swappedWith') }}</span>
        <span v-if="info.partner" class="font-medium text-right">
          {{ info.partner.name }}
          <span v-if="info.partner.crew" class="text-secondary font-normal">· {{ info.partner.crew }}</span>
        </span>
        <span v-else class="text-secondary text-right">{{ $t('shiftType.groupView.partnerUnknown') }}</span>
      </div>

      <div class="flex justify-end mt-2">
        <n-button @click="store.changeInfo.visible = false">{{ $t('content.close') }}</n-button>
      </div>
    </div>
  </UIModal>
</template>
