<script setup>
  // «Qurilmalar tahlili» — umumiy `DonutCard` qolipida: onlayn / oflayn. Ostida holat pill'i
  // (≥95% onlayn — barqaror, 80–95% — e'tibor talab qiladi, <80% — ko'p qurilma aloqasiz).
  import DonutCard from './DonutCard.vue'
  import { PALETTE, TINT, CHIP_CLASS } from './palette.js'
  import { percentOf } from './format.js'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import { Utils } from '@/utils/index.js'
  import i18n from '@/i18n/index.js'
  import { DesktopPulse20Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useTurnstileDashboardStore()
  const emits = defineEmits(['onPreview'])

  const total = computed(() => store.deviceData?.all || 0)
  const online = computed(() => store.deviceData?.online || 0)
  const offline = computed(() => store.deviceData?.offline || 0)
  const health = computed(() => {
    const p = percentOf(online.value, total.value)
    if (p >= 95) return { key: 'devGood', tone: 'main' }
    if (p >= 80) return { key: 'devWarn', tone: 'warn' }
    return { key: 'devBad', tone: 'bad' }
  })

  const items = computed(() => [
    { label: 'content.online', count: online.value, token: PALETTE.main, previewType: 'online_devices' },
    { label: 'content.offline', count: offline.value, token: PALETTE.bad, previewType: 'offline_devices' }
  ])
</script>

<template>
  <DonutCard
    :icon="DesktopPulse20Regular"
    :tint="TINT.second"
    :title="$t('turnStileDashboard.cards.deviceAnalytic')"
    :subtitle="$t('turnStileDashboard.compare.totalDevices')"
    :loading="store.devicesLoading"
    :items="items"
    :center-label="t('turnStileDashboard.month.total')"
    :total="total"
    @on-preview="emits('onPreview', $event)"
  >
    <template v-if="total" #footer>
      <div class="mt-1 flex flex-wrap items-center gap-2 pl-2">
        <span class="rounded-full px-2 py-0.5 text-[11px] leading-4 font-semibold" :class="CHIP_CLASS[health.tone]">
          {{ $t(`turnStileDashboard.kpi.${health.key}`) }}
        </span>
        <span v-if="offline" class="text-[12px] leading-4 font-medium text-fig-text-red">
          {{ $t('turnStileDashboard.kpi.devOffline', { n: Utils.formatNumberToMoney(offline) }) }}
        </span>
      </div>
    </template>
  </DonutCard>
</template>
