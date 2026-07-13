<script setup>
  import { useIntegrationClientsStore } from '@/store/modules/index.js'
  import { secretTypeBadge, durationColor, durationBgClass, errorRate } from './useHelpers.js'
  import { People24Regular } from '@vicons/fluent'

  const store = useIntegrationClientsStore()
</script>

<template>
  <div class="xl:col-span-6 col-span-12 bg-surface-section border border-surface-line rounded-xl overflow-hidden">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-surface-line">
      <h3 class="font-semibold text-sm text-textColor1">{{ $t('integrationLog.dashboard.topClients') }}</h3>
    </div>

    <!-- List -->
    <div class="divide-y divide-surface-line">
      <div
        v-for="(c, i) in store.topClients"
        :key="i"
        class="flex items-center gap-3 px-4 py-1.5"
      >
        <!-- Rank -->
        <span class="text-xs font-bold text-textColor3 w-4 flex-shrink-0">{{ i + 1 }}</span>

        <!-- Avatar -->
        <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <n-icon size="16" class="text-primary"><People24Regular /></n-icon>
        </div>

        <!-- Name + type -->
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-textColor0 line-clamp-1">{{ c.client?.name }}</p>
          <span
            :class="secretTypeBadge(c.client?.secret_type)"
            class="text-[10px] font-semibold px-1.5 py-0.5 rounded mt-0.5 inline-block capitalize"
          >
            {{ c.client?.secret_type }}
          </span>
        </div>

        <!-- Stats badges -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <n-tooltip placement="top" :delay="300">
            <template #trigger>
              <span class="text-[11px] font-semibold bg-primary/10 text-primary px-2 py-1 rounded-lg leading-none cursor-pointer w-[58px] text-center inline-block">
                {{ c.total_requests.toLocaleString() }}
              </span>
            </template>
            {{ $t('integrationLog.dashboard.requests') }}
          </n-tooltip>

          <n-tooltip placement="top" :delay="300">
            <template #trigger>
              <span
                class="text-[11px] font-semibold px-2 py-1 rounded-lg leading-none cursor-pointer w-[58px] text-center inline-block"
                :class="c.error_requests > 0 ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'"
              >
                {{ errorRate(c.error_requests, c.total_requests) }}
              </span>
            </template>
            {{ $t('integrationLog.dashboard.errorPct') }}
          </n-tooltip>

          <n-tooltip placement="top" :delay="300">
            <template #trigger>
              <span
                class="text-[11px] font-semibold px-2 py-1 rounded-lg leading-none cursor-pointer w-[58px] text-center inline-block"
                :class="durationBgClass(c.avg_duration_ms)"
              >
                {{ parseFloat(c.avg_duration_ms).toFixed(0) }} ms
              </span>
            </template>
            {{ $t('integrationLog.dashboard.avgMs') }}
          </n-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>
