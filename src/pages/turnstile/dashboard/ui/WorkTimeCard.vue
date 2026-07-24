<script setup>
  import { Eye20Filled } from '@vicons/fluent'
  import WorkTimeChart from '@/pages/turnstile/dashboard/ui/WorkTimeChart.vue'
  import CardDecor from './CardDecor.vue'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  const store = useTurnstileDashboardStore()

  const lateComeCount = computed(() =>
    store.workTime ? store.workTime?.late_and_early?.late[0]?.count : 0
  )
  const earlyGoCount = computed(() =>
    store.workTime ? store.workTime?.late_and_early?.early[0]?.count : 0
  )

  const percentOf = (count) => {
    const total = store.totalWorkerCount || 0
    if (!total) return 0
    return Math.min(Math.round((count / total) * 100), 100)
  }

  const rows = computed(() => [
    {
      label: 'turnStileDashboard.cards.earlyGo',
      count: earlyGoCount.value,
      previewType: 'early_leave',
      dot: 'bg-warning',
      track: 'bg-warning/10',
      fill: 'bg-warning'
    },
    {
      label: 'turnStileDashboard.cards.lateCome',
      count: lateComeCount.value,
      previewType: 'late_come',
      dot: 'bg-danger',
      track: 'bg-danger/10',
      fill: 'bg-danger'
    }
  ])

  const emits = defineEmits(['onPreview'])
</script>

<template>
  <div
    class="p-4 bg-surface-section/75 border border-surface-line rounded-2xl relative overflow-hidden min-h-[315px]"
  >
    <CardDecor variant="lines" class="top-0 right-0 text-warning" />
    <n-spin :show="store.workTimeLoading">
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 xl:col-span-4 lg:col-span-5 flex flex-col">
          <div>
            <h3 class="font-bold text-[17px] leading-[1.2] text-textColor0">
              {{ $t('turnStileDashboard.cards.workTimeTitle') }}
            </h3>
            <small class="text-xs text-secondary leading-[1.2]">{{
              $t('turnStileDashboard.cards.workTimeSubtitle')
            }}</small>
          </div>
          <div class="mt-5">
            <div class="font-grotesk text-4xl text-textColor0 font-bold leading-[1]">
              {{ store.totalWorkerCount }}
            </div>
            <small class="text-secondary text-xs leading-[1.2]">{{
              $t('turnStileDashboard.cards.allWorkers')
            }}</small>
          </div>

          <div class="flex flex-col gap-2 mt-auto pt-5">
            <div
              v-for="(row, idx) in rows"
              :key="idx"
              @click="emits('onPreview', row.previewType)"
              class="p-2 rounded-xl relative group cursor-pointer hover:bg-primary/6 transition-all duration-300"
            >
              <div
                class="transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100 z-10"
              >
                <n-icon size="28">
                  <Eye20Filled />
                </n-icon>
              </div>
              <div class="opacity-100 group-hover:opacity-[0.2] transition-all duration-300">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" :class="row.dot"></span>
                  <span class="font-medium text-secondary text-xs">{{ $t(row.label) }}</span>
                  <span class="ml-auto font-bold font-grotesk text-[15px] text-textColor0">{{
                    row.count
                  }}</span>
                </div>
                <div
                  class="w-full h-[4px] relative rounded-lg overflow-hidden mt-2"
                  :class="row.track"
                >
                  <div
                    class="h-full rounded-lg"
                    :class="row.fill"
                    :style="{ width: percentOf(row.count) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-span-12 xl:col-span-8 lg:col-span-7 flex flex-col z-10">
          <WorkTimeChart class="z-10 mt-auto" />
        </div>
      </div>
    </n-spin>
  </div>
</template>
