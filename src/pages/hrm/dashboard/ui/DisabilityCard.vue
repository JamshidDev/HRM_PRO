<script setup>
  import { useDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import {
    Accessibility28Regular,
    People28Regular,
    BookPulse20Regular
  } from '@vicons/fluent'

  const { t } = i18n.global

  const props = defineProps({
    type: {
      type: String,
      required: true // 'worker' | 'relative' | 'sickLeave'
    }
  })

  const emit = defineEmits(['detail'])

  const store = useDashboardStore()

  const normalizeLevels = (levels) => {
    return [1, 2, 3].map(lvl => {
      const found = levels.find(l => l.level === lvl)
      return { label: `${lvl}-${t('dashboardPage.disability.group')}`, count: found?.count ?? 0 }
    })
  }

  const config = computed(() => {
    const d = store.dashboard?.disabilityCard
    if (!d) return null
    switch (props.type) {
      case 'worker':
        return {
          titleKey: 'dashboardPage.disability.workerTitle',
          icon: Accessibility28Regular,
          iconType: 'primary',
          total: d.workerDisability.total_count,
          rows: normalizeLevels(d.workerDisability.levels)
        }
      case 'relative':
        return {
          titleKey: 'dashboardPage.disability.relativeTitle',
          icon: People28Regular,
          iconType: 'success',
          total: d.relativeDisability.total_count,
          rows: normalizeLevels(d.relativeDisability.levels)
        }
      case 'sickLeave':
        return {
          titleKey: 'dashboardPage.disability.sickLeaveTitle',
          icon: BookPulse20Regular,
          iconType: 'error',
          total: d.sickLeave.total_count,
          rows: [
            { label: t('dashboardPage.disability.active'),   count: d.sickLeave.active_count },
            { label: t('dashboardPage.disability.finished'), count: d.sickLeave.finished_count }
          ]
        }
    }
  })
</script>

<template>
  <div
    v-if="config"
    class="h-full p-4 rounded-lg bg-surface-section border border-surface-line flex flex-col gap-3 hover-effect-card relative overflow-hidden cursor-pointer"
  >
    <span class="z-1 opacity-20 absolute top-0 right-0 w-[110px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]" />

    <!-- Header -->
    <div class="flex items-center justify-between z-10 relative">
      <div class="flex items-center gap-2">
        <div
          class="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
          :class="{
            'bg-primary/10 text-primary': config.iconType === 'primary',
            'bg-success/10 text-success': config.iconType === 'success',
            'bg-error/10 text-error':     config.iconType === 'error',
          }"
        >
          {{ config.total }}
        </div>
        <n-button text :type="config.iconType">
          <span class="font-semibold text-textColor0">{{ $t(config.titleKey) }}</span>
          <template #icon>
            <n-icon><component :is="config.icon" /></n-icon>
          </template>
        </n-button>
      </div>
      <p
        v-if="props.type === 'worker'"
        @click="emit('detail')"
        class="text-xs leading-[14px] text-primary border-b border-dashed border-primary cursor-pointer transition-all hover:border-primary/80 hover:text-primary/80"
      >
        {{ $t('content.view') }}
      </p>
      <p
        v-else
        class="text-xs leading-[14px] text-textColor3 border-b border-dashed border-textColor3 cursor-not-allowed opacity-50"
      >
        {{ $t('content.view') }}
      </p>
    </div>

    <!-- Rows -->
    <div class="flex flex-col gap-2 z-10 relative">
      <div
        v-for="(row, idx) in config.rows"
        :key="idx"
        class="flex items-center gap-3"
      >
        <span class="text-xs text-nowrap text-textColor3">{{ row.label }}</span>
        <hr class="w-full h-[1px] text-surface-line" />
        <span class="text-sm font-semibold text-nowrap text-textColor0">{{ row.count }}</span>
      </div>
    </div>
  </div>
</template>
