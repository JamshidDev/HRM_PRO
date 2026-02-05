<script setup>
  import BarChart from './BarChart.vue'
  import { UIUserGroup } from '@/components/index.js'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import { ChartMultiple24Regular, Eye20Filled } from '@vicons/fluent'

  const store = useTurnstileDashboardStore()
  const emits = defineEmits(['onPreview'])
</script>

<template>
  <div
    class="grid grid-cols-12 px-4 py-2 bg-surface-section border border-surface-line rounded-xl cursor-pointer relative"
  >
    <n-spin :show="store.monthlyLoading" class="col-span-12">
      <div class="col-span-12 grid grid-cols-12">
        <div class="col-span-6 mb-4">
          <div class="grid col-span-12">
            <div class="col-span-12">
              <h3 class="font-bold text-lg leading-[1.2] mt-4 text-textColor0">
                {{ $t('turnStileDashboard.cards.graphAnalytic') }}
              </h3>
              <div class="text-secondary leading-[1.2] text-xs">
                {{ $t('turnStileDashboard.cards.graphAnalyticDescription') }}
              </div>
            </div>

            <div class="col-span-12 flex flex-col justify-between">
              <div
                @click="emits('onPreview', 'notIncludedSchedule')"
                class="mt-8 bg-transparent hover:bg-primary/6 transition-all duration-300 cursor-pointer p-2 rounded-xl relative group"
              >
                <div
                  class="transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100"
                >
                  <n-icon size="36">
                    <Eye20Filled />
                  </n-icon>
                </div>

                <div class="w-full group-hover:opacity-[0.2]">
                  <div class="text-2xl font-bold text-textColor0">
                    {{ store.monthlyTotalWorkerCount }}
                  </div>
                  <div class="leading-[1.1] text-xs text-secondary mb-2">
                    {{ $t('turnStileDashboard.cards.currentMonthWorkerCount') }}
                  </div>
                </div>
              </div>

              <UIUserGroup
                @click.stop
                :max="6"
                :data="
                  store.monthlyTotalWorkerCount < 5
                    ? store.monthlyWorkers
                    : [...store.monthlyWorkers, ...store.monthlyWorkers]
                "
                :has-more="store.monthlyTotalWorkerCount - 5"
              />
            </div>
          </div>
        </div>
        <div class="col-span-6 z-10">
          <!--          <BarChart />-->
        </div>
      </div>
    </n-spin>
    <span
      class="opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"
    ></span>
  </div>
</template>
