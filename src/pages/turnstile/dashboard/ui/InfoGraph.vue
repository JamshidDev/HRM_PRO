<script setup>
  import { Eye20Filled, Ribbon20Filled } from '@vicons/fluent'
  import { Utils } from '@/utils/index.js'
  import CardHeader from './CardHeader.vue'
  import DeltaBadge from './DeltaBadge.vue'
  import PrivilegeDonut from './PrivilegeDonut.vue'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'

  const store = useTurnstileDashboardStore()
  const emits = defineEmits(['onPreview'])

  const cells = computed(() => [
    {
      previewType: 'privilege_turnstile_workers',
      label: 'turnStileDashboard.cards.privilege',
      count: store.grandWorkerData?.privilege_turnstile_workers_count || 0,
      color: '--chart-green',
      delta: store.deltas.privilege
    },
    {
      previewType: 'not_passed_turnstile_workers',
      label: 'turnStileDashboard.cards.dontPassFace',
      count: store.grandWorkerData?.not_passed_turnstile_workers_count || 0,
      color: '--chart-blue',
      delta: store.deltas.notPassed,
      invert: true
    },
    {
      previewType: 'vacations',
      label: 'turnStileDashboard.cards.onVacation',
      count: store.grandWorkerData?.vacation_workers?.total || 0,
      color: '--chart-indigo',
      delta: store.deltas.vacation
    },
    {
      previewType: 'casual_workers',
      label: 'turnStileDashboard.cards.onHoliday',
      count: store.grandWorkerData?.casual_workers || 0,
      color: '--chart-gold',
      delta: store.deltas.casual
    }
  ])

  const donutData = computed(() =>
    cells.value.map((v) => ({
      value: v.count,
      name: v.label,
      color: v.color
    }))
  )

  const formatCount = (v) => Utils.formatNumberToMoney(v) || '0'
</script>

<template>
  <div
    class="p-4 bg-surface-section/75 border border-surface-line rounded-2xl relative overflow-hidden"
  >
    <n-spin :show="store.grandLoading">
      <CardHeader
        :icon="Ribbon20Filled"
        type="primary"
        :title="$t('turnStileDashboard.cards.privilege_turnstile_workers')"
        :subtitle="$t('turnStileDashboard.cards.privilegeSubtitle')"
      />

      <div class="grid grid-cols-12 gap-4 mt-4 items-center">
        <div class="xl:col-span-5 md:col-span-5 col-span-12">
          <PrivilegeDonut :data="donutData" height="220px" />
        </div>

        <div class="xl:col-span-7 md:col-span-7 col-span-12">
          <div
            v-for="(cell, idx) in cells"
            :key="idx"
            @click="emits('onPreview', cell.previewType)"
            class="relative group cursor-pointer transition-all duration-300 hover:bg-primary/6 rounded-xl px-2 py-2.5"
            :class="idx < cells.length - 1 ? 'border-b border-surface-line' : ''"
          >
            <div
              class="z-10 transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100"
            >
              <n-icon size="26">
                <Eye20Filled />
              </n-icon>
            </div>

            <div class="flex gap-3 transition-all duration-300 group-hover:opacity-[0.2]">
              <span
                class="w-[3px] rounded-full shrink-0"
                :style="{ backgroundColor: `var(${cell.color})` }"
              ></span>
              <div class="min-w-0">
                <div class="text-xs text-secondary leading-[1.3] line-clamp-1">
                  {{ $t(cell.label) }}
                </div>
                <div class="flex items-center gap-2 flex-wrap mt-1">
                  <span class="font-grotesk font-bold text-textColor0 text-[18px] leading-[1.1]">
                    {{ formatCount(cell.count) }}
                  </span>
                  <DeltaBadge
                    hide-label
                    :delta="cell.delta"
                    :invert="cell.invert"
                    :loading="store.compareLoading"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </n-spin>
  </div>
</template>
