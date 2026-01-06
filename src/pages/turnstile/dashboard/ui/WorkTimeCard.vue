<script setup>
  import { PersonClock20Regular, ClockToolbox20Regular, Eye20Filled } from '@vicons/fluent'
  import WorkTimeChart from '@/pages/turnstile/dashboard/ui/WorkTimeChart.vue'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  const store = useTurnstileDashboardStore()

  const lateComeCount = computed(() =>
    store.workTime ? store.workTime?.late_and_early?.late[0]?.count : 0
  )
  const earlyGoCount = computed(() =>
    store.workTime ? store.workTime?.late_and_early?.early[0]?.count : 0
  )
  const emits = defineEmits(['onPreview'])
</script>

<template>
  <div
    class="grid grid-cols-12 px-4 py-2 bg-surface-section border border-surface-line rounded-xl relative cursor-pointer min-h-[315px]"
  >
    <n-spin :show="store.workTimeLoading" class="col-span-12">
      <div class="grid grid-cols-12">
        <div class="col-span-12">
          <h3 class="font-bold text-lg leading-[1.2] mt-4 text-textColor0">
            {{ $t('turnStileDashboard.cards.workTimeTitle') }}
          </h3>
          <small class="text-secondary leading-[1.2]">{{
            $t('turnStileDashboard.cards.workTimeSubtitle')
          }}</small>
        </div>
        <div class="col-span-5">
          <div class="text-2xl text-textColor0 font-bold !leading-[0.8] mt-5">
            {{ store.totalWorkerCount }}
          </div>
          <small class="text-secondary text-xs leading-[1.2]">{{
            $t('turnStileDashboard.cards.allWorkers')
          }}</small>

          <div
            @click="emits('onPreview', 'early_leave')"
            class="flex gap-2 items-center mt-4 bg-transparent hover:bg-primary/6 transition-all duration-300 cursor-pointer py-1 px-2 rounded-xl relative group"
          >
            <div
              class="transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100"
            >
              <n-icon size="36">
                <Eye20Filled />
              </n-icon>
            </div>

            <div
              class="w-[32px] h-[32px] bg-warning/10 rounded-lg flex opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
            >
              <n-icon size="24" class="text-warning m-auto">
                <ClockToolbox20Regular />
              </n-icon>
            </div>
            <div
              class="leading-1 opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
            >
              <h4 class="text-lg text-textColor0 font-bold leading-[1.2]">{{ earlyGoCount }}</h4>
              <small class="text-secondary text-xs leading-[1.2]">{{
                $t('turnStileDashboard.cards.earlyGo')
              }}</small>
            </div>
          </div>

          <div
            @click="emits('onPreview', 'late_come')"
            class="flex gap-2 items-center mt-4 bg-transparent hover:bg-primary/6 transition-all duration-300 cursor-pointer py-1 px-2 rounded-xl relative group"
          >
            <div
              class="transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100"
            >
              <n-icon size="36">
                <Eye20Filled />
              </n-icon>
            </div>

            <div
              class="w-[32px] h-[32px] bg-danger/10 rounded-lg flex opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
            >
              <n-icon size="24" class="text-danger m-auto">
                <PersonClock20Regular />
              </n-icon>
            </div>
            <div
              class="leading-1 opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
            >
              <h4 class="text-lg text-textColor0 font-bold leading-[1.2]">{{ lateComeCount }}</h4>
              <small class="text-secondary text-xs leading-[1.2]">{{
                $t('turnStileDashboard.cards.lateCome')
              }}</small>
            </div>
          </div>
        </div>
        <div class="col-span-7 flex justify-end z-10">
          <WorkTimeChart class="z-10" />
        </div>
      </div>
    </n-spin>

    <span
      class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"
    ></span>
  </div>
</template>
