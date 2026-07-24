<script setup>
  import { Eye20Filled } from '@vicons/fluent'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'

  const store = useTurnstileDashboardStore()

  const emits = defineEmits(['onPreview'])

  const percentOf = (count) => {
    const total = store.mainChart?.scheduled_workers_today || 0
    if (!total) return 0
    return Math.min(Math.round((count / total) * 100), 100)
  }

  const rows = computed(() => [
    {
      label: 'turnStileDashboard.cards.planned',
      count: store.mainChart?.scheduled_workers_today || 0,
      color: 'primary',
      previewType: null
    },
    {
      label: 'turnStileDashboard.cards.todayCome',
      count: store.mainChart?.attended_workers_today || 0,
      color: 'warning',
      previewType: 'come'
    },
    {
      label: 'turnStileDashboard.cards.todayDontCome',
      count: store.mainChart?.absent_workers_today || 0,
      color: 'danger',
      previewType: 'not_come'
    }
  ])

  const colorClasses = {
    primary: { dot: 'bg-primary', track: 'bg-primary/10', fill: 'bg-primary' },
    warning: { dot: 'bg-warning', track: 'bg-warning/10', fill: 'bg-warning' },
    danger: { dot: 'bg-danger', track: 'bg-danger/10', fill: 'bg-danger' }
  }
</script>

<template>
  <n-spin :show="store.mainChartLoading">
    <div class="flex flex-col h-full min-h-[280px]">
      <div>
        <h3 class="font-bold text-[17px] leading-[1.2] text-textColor0">
          {{ $t('turnStileDashboard.cards.workerAnalytic') }}
        </h3>
        <small class="text-xs text-secondary leading-[1.2]">{{
          $t('turnStileDashboard.cards.workerAnalyticDescription')
        }}</small>
      </div>
      <div class="mt-5">
        <div class="font-bold text-4xl font-grotesk text-textColor0 leading-[1]">
          {{ store?.totalWorkerCount }}
        </div>
        <small class="text-xs text-secondary leading-[1.2]">{{
          $t('turnStileDashboard.cards.allWorkerOfCompany')
        }}</small>
      </div>

      <div class="flex flex-col gap-2 mt-auto pt-5">
        <div
          v-for="(row, idx) in rows"
          :key="idx"
          @click="row.previewType && emits('onPreview', row.previewType)"
          class="p-2 rounded-xl relative group transition-all duration-300"
          :class="row.previewType ? 'cursor-pointer hover:bg-primary/6' : ''"
        >
          <div
            v-if="row.previewType"
            class="transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100 z-10"
          >
            <n-icon size="28">
              <Eye20Filled />
            </n-icon>
          </div>
          <div
            class="opacity-100 transition-all duration-300"
            :class="row.previewType ? 'group-hover:opacity-[0.2]' : ''"
          >
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full" :class="colorClasses[row.color].dot"></span>
              <span class="font-medium text-secondary text-xs">{{ $t(row.label) }}</span>
              <span class="ml-auto font-bold font-grotesk text-[15px] text-textColor0">{{
                row.count
              }}</span>
            </div>
            <div
              class="w-full h-[4px] relative rounded-lg overflow-hidden mt-2"
              :class="colorClasses[row.color].track"
            >
              <div
                class="h-full rounded-lg"
                :class="colorClasses[row.color].fill"
                :style="{ width: percentOf(row.count) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </n-spin>
</template>
