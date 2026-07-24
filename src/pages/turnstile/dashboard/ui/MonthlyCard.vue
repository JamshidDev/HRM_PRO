<script setup>
  import { UIUserGroup } from '@/components/index.js'
  import CardDecor from './CardDecor.vue'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import { Eye20Filled } from '@vicons/fluent'

  const store = useTurnstileDashboardStore()
  const emits = defineEmits(['onPreview'])
</script>

<template>
  <div
    class="p-4 bg-surface-section/75 border border-surface-line rounded-2xl relative overflow-hidden"
  >
    <CardDecor variant="rects" class="-top-6 -right-6 text-secondary" />
    <n-spin :show="store.monthlyLoading">
      <div class="flex flex-col">
        <div>
          <h3 class="font-bold text-[17px] leading-[1.2] text-textColor0">
            {{ $t('turnStileDashboard.cards.graphAnalytic') }}
          </h3>
          <div class="text-secondary leading-[1.2] text-xs">
            {{ $t('turnStileDashboard.cards.graphAnalyticDescription') }}
          </div>
        </div>

        <div
          @click="emits('onPreview', 'notIncludedSchedule')"
          class="mt-4 bg-transparent hover:bg-primary/6 transition-all duration-300 cursor-pointer p-2 rounded-xl relative group"
        >
          <div
            class="transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100"
          >
            <n-icon size="30">
              <Eye20Filled />
            </n-icon>
          </div>

          <div class="w-full group-hover:opacity-[0.2] transition-all duration-300">
            <div class="font-grotesk text-[32px] font-bold text-textColor0 leading-[1.2]">
              {{ store.monthlyTotalWorkerCount }}
            </div>
            <div class="leading-[1.1] text-xs text-secondary">
              {{ $t('turnStileDashboard.cards.currentMonthWorkerCount') }}
            </div>
          </div>
        </div>

        <div class="mt-4 px-2">
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
    </n-spin>
  </div>
</template>
