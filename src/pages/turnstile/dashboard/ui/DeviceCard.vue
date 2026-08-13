<script setup>
  import { Utils } from '@/utils/index.js'
  import CardHeader from './CardHeader.vue'
  import DeltaBadge from './DeltaBadge.vue'
  import DetailsLine from './DetailsLine.vue'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import HeadDesktopIcon from '@/assets/icons/dashboard/head-desktop.svg'

  const store = useTurnstileDashboardStore()
  const emits = defineEmits(['onPreview'])

  const percent = computed(() => {
    const all = store.deviceData?.all || 0
    if (!all) return 0
    return Math.min(Math.round(((store.deviceData?.online || 0) / all) * 100), 100)
  })

  const cells = computed(() => [
    {
      previewType: 'online_devices',
      label: 'turnStileDashboard.cards.onlineDevices',
      count: store.deviceData?.online || 0,
      color: '--fig-icon-green',
      delta: store.deltas.devicesOnline
    },
    {
      previewType: 'offline_devices',
      label: 'turnStileDashboard.cards.offlineDevices',
      count: store.deviceData?.offline || 0,
      color: '--fig-icon-brand',
      delta: store.deltas.devicesOffline,
      invert: true
    }
  ])

  const formattedAll = computed(() => Utils.formatNumberToMoney(store.deviceData?.all) || '0')
</script>

<template>
  <div
    class="stretch-card bg-surface-section rounded-2xl px-1 pb-1 relative overflow-hidden flex flex-col"
  >
    <n-spin :show="store.devicesLoading" class="flex-1 flex flex-col">
      <CardHeader
        :icon="HeadDesktopIcon"
        tint="indigo"
        small-subtitle
        :title="$t('turnStileDashboard.cards.deviceAnalytic')"
        :subtitle="$t('turnStileDashboard.cards.deviceAnalyticDescription')"
      />

      <div class="flex-1 flex flex-col justify-center gap-2.5 p-2">
        <div class="h-14 flex flex-col items-center justify-center">
          <div class="flex items-center justify-center gap-2.5 flex-wrap">
            <span
              class="font-grotesk font-semibold text-[20px] leading-[30px] text-fig-text-primary"
            >
              {{ formattedAll }}
            </span>
            <DeltaBadge
              hide-label
              :delta="store.deltas.devicesAll"
              :loading="store.compareLoading"
            />
          </div>
          <p class="text-[10px] leading-[12px] text-fig-text-tertiary text-center">
            {{ $t('turnStileDashboard.compare.totalDevices') }}
          </p>
        </div>

        <!-- onlayn ulushi -->
        <div class="py-3">
          <div class="h-14 w-full rounded-2xl bg-fig-neutral-300 overflow-hidden relative">
            <div
              class="h-full rounded-2xl relative overflow-hidden transition-all duration-500"
              :style="{
                width: Math.max(percent, 14) + '%',
                background: 'linear-gradient(to left, var(--fig-icon-green), var(--fig-green-400))'
              }"
            >
              <span
                class="absolute right-0 top-1/2 -translate-y-1/2 bg-surface-section rounded-l-full px-1.5 py-0.5 text-[12px] leading-[16px] font-semibold text-fig-text-green"
              >
                {{ percent }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-surface-ground-soft rounded-xl p-3 flex items-start gap-1">
        <DetailsLine
          v-for="(cell, idx) in cells"
          :key="idx"
          clickable
          class="flex-1"
          :label="$t(cell.label)"
          :count="cell.count"
          :bar-color="cell.color"
          :delta="cell.delta"
          :invert="cell.invert"
          :delta-loading="store.compareLoading"
          @click="emits('onPreview', cell.previewType)"
        />
      </div>
    </n-spin>
  </div>
</template>

<style scoped>
  /* n-spin ichki `.n-spin-content` ni ham cho'zamiz — aks holda karta qo'shni
     baland karta bo'yiga tenglashganda kontent tepada qolib, pastda bo'sh joy qoladi. */
  .stretch-card :deep(.n-spin-container),
  .stretch-card :deep(.n-spin-content) {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
</style>
