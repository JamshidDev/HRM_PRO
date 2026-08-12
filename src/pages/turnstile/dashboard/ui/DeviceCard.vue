<script setup>
  import { Eye20Filled, Desktop20Filled } from '@vicons/fluent'
  import { Utils } from '@/utils/index.js'
  import CardHeader from './CardHeader.vue'
  import DeltaBadge from './DeltaBadge.vue'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'

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
      bar: 'bg-success',
      delta: store.deltas.devicesOnline
    },
    {
      previewType: 'offline_devices',
      label: 'turnStileDashboard.cards.offlineDevices',
      count: store.deviceData?.offline || 0,
      bar: 'bg-primary',
      delta: store.deltas.devicesOffline,
      invert: true
    }
  ])

  const formatCount = (v) => Utils.formatNumberToMoney(v) || '0'
</script>

<template>
  <div
    class="stretch-card p-4 bg-surface-section/75 border border-surface-line rounded-2xl relative overflow-hidden flex flex-col"
  >
    <n-spin :show="store.devicesLoading" class="flex-1 flex flex-col">
      <CardHeader
        :icon="Desktop20Filled"
        type="primary"
        :title="$t('turnStileDashboard.cards.deviceAnalytic')"
        :subtitle="$t('turnStileDashboard.cards.deviceAnalyticDescription')"
      />

      <div class="text-center mt-auto pt-6">
        <div class="flex items-center justify-center gap-2 flex-wrap">
          <span class="font-grotesk font-bold text-textColor0 text-[30px] leading-[1.1]">
            {{ formatCount(store.deviceData?.all) }}
          </span>
          <DeltaBadge hide-label :delta="store.deltas.devicesAll" :loading="store.compareLoading" />
        </div>
        <div class="text-xs text-secondary leading-[1.3] mt-1">
          {{ $t('turnStileDashboard.compare.totalDevices') }}
        </div>
      </div>

      <!-- onlayn ulushi -->
      <div class="mt-6 h-[56px] w-full rounded-2xl bg-surface-line/70 relative overflow-hidden">
        <div
          class="h-full rounded-2xl bg-success flex items-center justify-end pr-3 transition-all duration-500"
          :style="{ width: Math.max(percent, 12) + '%' }"
        >
          <span
            class="text-[11px] font-bold text-success bg-surface-section rounded-full px-2 py-0.5"
          >
            {{ percent }}%
          </span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 mt-4">
        <div
          v-for="(cell, idx) in cells"
          :key="idx"
          @click="emits('onPreview', cell.previewType)"
          class="relative group cursor-pointer border border-surface-line rounded-xl p-3 hover:bg-primary/6 transition-all duration-300"
        >
          <div
            class="z-10 transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100"
          >
            <n-icon size="26">
              <Eye20Filled />
            </n-icon>
          </div>

          <div class="flex gap-2 transition-all duration-300 group-hover:opacity-[0.2]">
            <span class="w-[3px] rounded-full shrink-0" :class="cell.bar"></span>
            <div class="min-w-0">
              <div class="text-xs text-secondary leading-[1.3] line-clamp-1">
                {{ $t(cell.label) }}
              </div>
              <div class="flex items-center gap-2 flex-wrap mt-1">
                <span class="font-grotesk font-bold text-textColor0 text-[18px] leading-[1.1]">
                  {{ formatCount(cell.count) }}
                </span>
                <DeltaBadge
                  hide-label
                  :delta="cell.delta"
                  :invert="cell.invert"
                  :loading="store.compareLoading"
                />
              </div>
            </div>
          </div>
        </div>
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
