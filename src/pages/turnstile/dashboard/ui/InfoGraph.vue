<script setup>
  import CircleChart from './CircleChart.vue'
  import CardDecor from './CardDecor.vue'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import { Eye20Filled } from '@vicons/fluent'

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

  const cells = computed(() => [
    {
      previewType: 'privilege_turnstile_workers',
      percent: grandPercent.value,
      type: 'success',
      count: store.grandWorkerData?.privilege_turnstile_workers_count || 0,
      label: 'turnStileDashboard.cards.privilege'
    },
    {
      previewType: 'not_passed_turnstile_workers',
      percent: notPassedPercent.value,
      type: 'warning',
      count: store.grandWorkerData?.not_passed_turnstile_workers_count || 0,
      label: 'turnStileDashboard.cards.dontPassFace'
    },
    {
      previewType: 'vacations',
      percent: vacationPercent.value,
      type: 'secondary',
      count: store.grandWorkerData?.vacation_workers?.total || 0,
      label: 'turnStileDashboard.cards.onVacation'
    },
    {
      previewType: 'casual_workers',
      percent: casualPercent.value,
      type: 'primary',
      count: store.grandWorkerData?.casual_workers || 0,
      label: 'turnStileDashboard.cards.onHoliday'
    }
  ])

  const emits = defineEmits(['onPreview'])
</script>

<template>
  <div
    class="p-4 bg-surface-section/75 border border-surface-line rounded-2xl relative overflow-hidden"
  >
    <CardDecor variant="dots" class="top-4 right-4 text-secondary" />
    <n-spin :show="store.grandLoading">
      <div>
        <h3 class="font-bold text-[17px] leading-[1.2] text-textColor0">
          {{ $t('turnStileDashboard.cards.privilege_turnstile_workers') }}
        </h3>
        <small class="text-xs text-secondary leading-[1.2]">{{
          $t('turnStileDashboard.cards.privilegeSubtitle')
        }}</small>
      </div>
      <div class="grid grid-cols-2 gap-3 mt-5">
        <div
          v-for="(cell, idx) in cells"
          :key="idx"
          @click="emits('onPreview', cell.previewType)"
          class="z-10 flex items-center gap-3 min-w-0 bg-transparent hover:bg-primary/6 transition-all duration-300 cursor-pointer p-2 rounded-xl relative group"
        >
          <div
            class="z-10 transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100"
          >
            <n-icon size="30"><Eye20Filled /></n-icon>
          </div>
          <CircleChart
            :percent="cell.percent"
            :type="cell.type"
            class="shrink-0 opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
          />
          <div class="min-w-0 opacity-100 group-hover:opacity-[0.2] transition-all duration-300">
            <div class="font-grotesk text-[19px] font-bold text-textColor0 leading-[1.2]">
              {{ cell.count }}
            </div>
            <div class="text-[11px] text-secondary leading-[1.3] line-clamp-2">
              {{ $t(cell.label) }}
            </div>
          </div>
        </div>
      </div>
    </n-spin>
  </div>
</template>
