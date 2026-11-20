<script setup>
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import { ChevronRight20Regular } from '@vicons/fluent'
  import { Utils } from '@/utils/index.js'
  import { UICountUp } from '@/components/index.js'
  import CardHeader from './CardHeader.vue'
  import HeadUsersIcon from '@/assets/icons/dashboard/head-users.svg'

  const store = useTurnstileDashboardStore()
  const emits = defineEmits(['onPreview'])
  const formatCount = (v) => Utils.formatNumberToMoney(v) || '0'

  // Reja: grafik bo'yicha shu kun kelishi kerak bo'lganlar = kelgan + kelmagan + sababli.
  const cells = computed(() => {
    const plan = store.attendance?.plan || {}
    return [
      {
        label: 'turnStileDashboard.plan.expected',
        info: 'turnStileDashboard.plan.expectedInfo',
        count: plan.expected || 0,
        dotColor: '--fig-icon-brand',
        previewType: null
      },
      {
        label: 'turnStileDashboard.plan.came',
        info: 'turnStileDashboard.plan.cameInfo',
        count: plan.came || 0,
        dotColor: '--fig-icon-green',
        previewType: 'att_plan_came'
      },
      {
        label: 'turnStileDashboard.plan.absent',
        info: 'turnStileDashboard.plan.absentInfo',
        count: plan.absent || 0,
        dotColor: '--fig-icon-red',
        previewType: 'att_plan_absent'
      },
      {
        label: 'turnStileDashboard.plan.excused',
        info: 'turnStileDashboard.plan.excusedInfo',
        count: plan.excused || 0,
        dotColor: '--fig-icon-indigo',
        previewType: 'att_plan_excused'
      }
    ]
  })
</script>

<template>
  <div
    class="bg-surface-section shadow-card rounded-2xl px-1 pb-1 relative overflow-hidden flex flex-col"
  >
    <CardHeader :icon="HeadUsersIcon" tint="indigo" :title="$t('turnStileDashboard.plan.title')" />

    <div class="flex flex-col gap-2 px-2 pb-2 flex-1">
      <div
        v-for="(cell, idx) in cells"
        :key="idx"
        class="group relative border border-fig-br-secondary rounded-xl px-3 py-2.5 transition-colors duration-200"
        :class="cell.previewType ? 'cursor-pointer hover:bg-surface-ground-soft' : ''"
        @click="cell.previewType && emits('onPreview', cell.previewType)"
      >
        <div class="flex items-center gap-2">
          <span
            class="w-2.5 h-2.5 rounded-full shrink-0"
            :style="{ backgroundColor: `var(${cell.dotColor})` }"
          ></span>
          <span class="flex-1 min-w-0 text-[14px] leading-[20px] text-fig-text-secondary truncate">
            {{ $t(cell.label) }}
          </span>
          <span
            class="font-grotesk font-semibold text-[20px] leading-[24px] text-fig-text-primary whitespace-nowrap"
          >
            <UICountUp :value="formatCount(cell.count)" />
          </span>
          <n-icon
            v-if="cell.previewType"
            size="16"
            class="shrink-0 text-fig-text-tertiary transition-transform duration-200 group-hover:translate-x-0.5"
          >
            <ChevronRight20Regular />
          </n-icon>
        </div>
        <p class="mt-1 pl-[18px] text-[12px] leading-[16px] text-fig-text-tertiary">
          {{ $t(cell.info) }}
        </p>
      </div>
    </div>
  </div>
</template>
