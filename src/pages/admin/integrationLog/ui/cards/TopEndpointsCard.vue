<script setup>
  import { useIntegrationLogStore } from '@/store/modules/index.js'
  import { methodBadgeClass, durationBgClass, errorRate } from './useHelpers.js'

  const store = useIntegrationLogStore()

  const endpointMax = computed(() =>
    Math.max(...store.topEndpoints.map((x) => x.total_requests), 1)
  )
</script>

<template>
  <div class="xl:col-span-6 col-span-12 bg-surface-section border border-surface-line rounded-xl overflow-hidden">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-surface-line">
      <h3 class="font-semibold text-sm text-textColor1">{{ $t('integrationLog.dashboard.topEndpoints') }}</h3>
    </div>

    <!-- List -->
    <div class="divide-y divide-surface-line">
      <div
        v-for="(e, i) in store.topEndpoints"
        :key="i"
        class="flex items-center gap-3 px-4 py-1.5"
      >
        <!-- Rank -->
        <span class="text-xs font-bold text-textColor3 w-4 flex-shrink-0">{{ i + 1 }}</span>

        <!-- Method badge -->
        <span
          :class="methodBadgeClass(e.method)"
          class="text-[10px] font-bold px-2 py-1 rounded-md flex-shrink-0 w-12 text-center"
        >
          {{ e.method }}
        </span>

        <!-- Endpoint path + progress -->
        <div class="flex-1 min-w-0">
          <p class="text-[11px] font-mono font-semibold text-textColor1 line-clamp-1" :title="e.endpoint">
            {{ e.endpoint }}
          </p>
          <div class="h-1 rounded-full bg-surface-ground overflow-hidden mt-1">
            <div
              class="h-full rounded-full bg-primary/40 transition-all duration-700"
              :style="{ width: `${(e.total_requests / endpointMax) * 100}%` }"
            />
          </div>
        </div>

        <!-- Stats badges -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <n-tooltip placement="top" :delay="300">
            <template #trigger>
              <span class="text-[11px] font-semibold bg-primary/10 text-primary px-2 py-1 rounded-lg leading-none cursor-pointer w-[58px] text-center inline-block">
                {{ e.total_requests.toLocaleString() }}
              </span>
            </template>
            {{ $t('integrationLog.dashboard.requests') }}
          </n-tooltip>

          <n-tooltip placement="top" :delay="300">
            <template #trigger>
              <span
                class="text-[11px] font-semibold px-2 py-1 rounded-lg leading-none cursor-pointer w-[58px] text-center inline-block"
                :class="e.error_requests > 0 ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'"
              >
                {{ errorRate(e.error_requests, e.total_requests) }}
              </span>
            </template>
            {{ $t('integrationLog.dashboard.errorPct') }}
          </n-tooltip>

          <n-tooltip placement="top" :delay="300">
            <template #trigger>
              <span
                class="text-[11px] font-semibold px-2 py-1 rounded-lg leading-none cursor-pointer w-[58px] text-center inline-block"
                :class="durationBgClass(parseFloat(e.avg_duration_ms))"
              >
                {{ parseFloat(e.avg_duration_ms).toFixed(0) }} ms
              </span>
            </template>
            {{ $t('integrationLog.dashboard.avgMs') }}
          </n-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>
