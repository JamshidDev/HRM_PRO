<script setup>
  import CircleChart from './CircleChart.vue'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import { ChartMultiple24Regular, Eye20Filled } from '@vicons/fluent'

  const store = useTurnstileDashboardStore()

  const grandPercent = ref(0)
  const notPassedPercent = ref(0)
  const vacationPercent = ref(0)
  const casualPercent = ref(0)

  watchEffect(() => {
    if (store.grandWorkerData && store.totalWorkerCount) {
      grandPercent.value = Number(
        (store.grandWorkerData.privilege_turnstile_workers_count / store.totalWorkerCount) * 100
      ).toFixed(1)
      notPassedPercent.value = Number(
        (store.grandWorkerData.not_passed_turnstile_workers_count / store.totalWorkerCount) * 100
      ).toFixed(1)
      vacationPercent.value = Number(
        (store.grandWorkerData.vacation_workers?.total / store.totalWorkerCount) * 100
      ).toFixed(1)
      casualPercent.value = Number(
        (store.grandWorkerData.casual_workers / store.totalWorkerCount) * 100
      ).toFixed(1)
    }
  })

  const emits = defineEmits(['onPreview'])
</script>

<template>
  <div
    class="grid grid-cols-12 px-4 py-2 bg-surface-section border border-surface-line rounded-xl relative cursor-pointer"
  >
    <n-spin :show="store.grandLoading" class="col-span-12">
      <div class="grid grid-cols-12">
        <div class="col-span-12 my-4">
          <h3 class="font-bold text-lg leading-[1.2] text-textColor0">
            {{ $t('turnStileDashboard.cards.privilege_turnstile_workers') }}
          </h3>
          <small class="text-secondary leading-[1.2]">{{
            $t('turnStileDashboard.cards.privilegeSubtitle')
          }}</small>
        </div>
        <div class="col-span-12 flex flex-wrap gap-x-6 gap-y-2 justify-evenly content-end mb-2">
          <div
            @click="emits('onPreview', 'privilege_turnstile_workers')"
            class="z-10 flex flex-col w-[70px] bg-transparent hover:bg-primary/6 transition-all duration-300 cursor-pointer p-2 rounded-xl relative group"
          >
            <div
              class="z-10 transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100"
            >
              <n-icon size="36">
                <Eye20Filled />
              </n-icon>
            </div>
            <h3
              class="text-lg font-bold flex gap-1 items-center text-textColor0 opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
            >
              <span
                class="bg-success/10 w-[20px] h-[20px] flex justify-center items-center rounded-lg"
              >
                <n-icon size="14" class="text-success">
                  <ChartMultiple24Regular />
                </n-icon>
              </span>
              {{ store.grandWorkerData?.privilege_turnstile_workers_count || 0 }}
            </h3>
            <h3
              class="text-[10px] font-semibold text-secondary pl-1 mt-3 mb-1 line-clamp-1 opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
            >
              {{ $t('turnStileDashboard.cards.privilege') }}
            </h3>
            <CircleChart
              :percent="grandPercent"
              type="success"
              class="opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
            />
          </div>

          <div
            @click="emits('onPreview', 'not_passed_turnstile_workers')"
            class="z-10 flex flex-col w-[90px] bg-transparent hover:bg-primary/6 transition-all duration-300 cursor-pointer pt-2 rounded-xl relative group"
          >
            <div
              class="ml-2 z-10 transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100"
            >
              <n-icon size="36">
                <Eye20Filled />
              </n-icon>
            </div>
            <h3
              class="text-lg font-bold flex gap-1 items-center text-textColor0 opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
            >
              <span
                class="bg-warning/10 w-[20px] h-[20px] flex justify-center items-center rounded-lg"
              >
                <n-icon size="14" class="text-warning">
                  <ChartMultiple24Regular />
                </n-icon>
              </span>
              {{ store.grandWorkerData?.not_passed_turnstile_workers_count || 0 }}
            </h3>
            <span
              class="text-center text-[10px] font-semibold text-secondary  mt-3 mb-1 line-clamp-1 opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
            >
              {{ $t('turnStileDashboard.cards.dontPassFace') }}
            </span>
            <CircleChart
              :percent="notPassedPercent"
              type="warning"
              class="opacity-100 group-hover:opacity-[0.2] transition-all duration-300 mx-auto block w-fit"
            />
          </div>

          <div
            @click="emits('onPreview', 'vacations')"
            class="z-10 flex flex-col w-[70px] bg-transparent hover:bg-primary/6 transition-all duration-300 cursor-pointer p-2 rounded-xl relative group"
          >
            <div
              class="z-10 transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100"
            >
              <n-icon size="36">
                <Eye20Filled />
              </n-icon>
            </div>

            <h3
              class="text-lg font-bold flex gap-1 items-center text-textColor0 opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
            >
              <span
                class="bg-dark/10 w-[20px] h-[20px] flex justify-center items-center rounded-lg"
              >
                <n-icon size="14" class="text-dark">
                  <ChartMultiple24Regular />
                </n-icon>
              </span>
              {{ store.grandWorkerData?.vacation_workers?.total || 0 }}
            </h3>
            <h3
              class="text-[10px] font-semibold text-secondary pl-1 mt-3 mb-1 line-clamp-1 opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
            >
              {{ $t('turnStileDashboard.cards.onVacation') }}
            </h3>
            <CircleChart
              :percent="vacationPercent"
              type="dark"
              class="opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
            />
          </div>

          <div
            @click="emits('onPreview', 'casual_workers')"
            class="z-10 flex flex-col w-[70px] bg-transparent hover:bg-primary/6 transition-all duration-300 cursor-pointer p-2 rounded-xl relative group"
          >
            <div
              class="z-10 transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100"
            >
              <n-icon size="36">
                <Eye20Filled />
              </n-icon>
            </div>

            <h3
              class="text-lg font-bold flex gap-1 items-center text-textColor0 opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
            >
              <span
                class="bg-primary/10 w-[20px] h-[20px] flex justify-center items-center rounded-lg"
              >
                <n-icon size="14" class="text-primary">
                  <ChartMultiple24Regular />
                </n-icon>
              </span>
              {{ store.grandWorkerData?.casual_workers || 0 }}
            </h3>
            <h3
              class="text-[10px] font-semibold text-secondary pl-1 mt-3 mb-1 line-clamp-1 opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
            >
              {{ $t('turnStileDashboard.cards.onHoliday') }}
            </h3>
            <CircleChart
              :percent="casualPercent"
              type="primary"
              class="opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
            />
          </div>
        </div>
      </div>
    </n-spin>
    <span
      class="z-[1] opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"
    ></span>
  </div>
</template>
