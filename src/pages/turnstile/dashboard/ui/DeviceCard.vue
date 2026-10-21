<script setup>
  import { ChevronRight20Regular } from '@vicons/fluent'
  import { Utils } from '@/utils/index.js'
  import CardHeader from './CardHeader.vue'
  import { DeviceCardSkeleton } from './skeleton/index.js'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import HeadDesktopIcon from '@/assets/icons/dashboard/head-desktop.svg'

  const store = useTurnstileDashboardStore()
  const emits = defineEmits(['onPreview'])

  const formatCount = (v) => Utils.formatNumberToMoney(v) || '0'

  const total = computed(() => store.deviceData?.all || 0)
  const share = (v) => (total.value ? Math.round((v / total.value) * 100) : 0)

  const rows = computed(() => {
    const online = store.deviceData?.online || 0
    const offline = store.deviceData?.offline || 0
    return [
      {
        previewType: 'online_devices',
        label: 'content.online',
        count: online,
        percent: share(online),
        dotClass: 'bg-fig-green'
      },
      {
        previewType: 'offline_devices',
        label: 'content.offline',
        count: offline,
        percent: share(offline),
        dotClass: 'bg-fig-red'
      }
    ]
  })

  // Bar segmentlari: onlayn + oflayn ulushi (jami 0 bo'lsa bar bo'sh trek bo'lib qoladi).
  const onlineWidth = computed(() => (total.value ? (rows.value[0].count / total.value) * 100 : 0))
  const offlineWidth = computed(() => (total.value ? (rows.value[1].count / total.value) * 100 : 0))
</script>

<template>
  <div class="bg-surface-section shadow-card rounded-2xl px-1 pb-1 relative overflow-hidden flex flex-col">
    <DeviceCardSkeleton v-if="store.devicesLoading" />

    <template v-else>
      <CardHeader
        :icon="HeadDesktopIcon"
        tint="indigo"
        :title="$t('turnStileDashboard.cards.deviceAnalytic')"
      />

      <!-- jami son + onlayn ulushi -->
      <div class="flex-1 flex flex-col justify-center gap-3 px-3 py-3">
        <div class="flex items-end justify-between gap-2">
          <div class="min-w-0">
            <p class="text-[12px] leading-[16px] text-fig-text-secondary truncate">
              {{ $t('turnStileDashboard.compare.totalDevices') }}
            </p>
            <p
              class="font-grotesk font-semibold text-[28px] leading-[34px] text-fig-text-primary whitespace-nowrap"
            >
              {{ formatCount(total) }}
            </p>
          </div>
          <span
            class="shrink-0 mb-1 rounded-full bg-fig-green-100 px-2 py-0.5 text-[12px] leading-[16px] font-semibold text-fig-text-green whitespace-nowrap"
          >
            {{ rows[0].percent }}% {{ $t('content.online').toLowerCase() }}
          </span>
        </div>

        <!-- onlayn / oflayn taqsimoti -->
        <div class="h-2.5 w-full rounded-full bg-fig-neutral-300 overflow-hidden flex gap-0.5">
          <div
            class="h-full rounded-full bg-fig-green transition-all duration-500"
            :style="{ width: onlineWidth + '%' }"
          ></div>
          <div
            v-if="offlineWidth"
            class="h-full rounded-full bg-fig-red transition-all duration-500"
            :style="{ width: offlineWidth + '%' }"
          ></div>
        </div>
      </div>

      <div class="bg-surface-ground-soft rounded-xl p-1.5 flex flex-col">
        <button
          v-for="row in rows"
          :key="row.previewType"
          type="button"
          class="group w-full flex items-center gap-2.5 rounded-lg px-2 py-2 text-left cursor-pointer transition-colors duration-200 hover:bg-surface-section"
          @click="emits('onPreview', row.previewType)"
        >
          <span class="w-2.5 h-2.5 rounded-full shrink-0" :class="row.dotClass"></span>
          <span class="flex-1 min-w-0 text-[14px] leading-[20px] text-fig-text-secondary truncate">
            {{ $t(row.label) }}
          </span>
          <span
            class="font-grotesk font-semibold text-[16px] leading-[20px] text-fig-text-primary whitespace-nowrap"
          >
            {{ formatCount(row.count) }}
          </span>
          <span
            class="w-10 text-right text-[12px] leading-[16px] text-fig-text-tertiary whitespace-nowrap"
          >
            {{ row.percent }}%
          </span>
          <n-icon
            size="16"
            class="shrink-0 text-fig-text-tertiary transition-transform duration-200 group-hover:translate-x-0.5"
          >
            <ChevronRight20Regular />
          </n-icon>
        </button>
      </div>
    </template>
  </div>
</template>
