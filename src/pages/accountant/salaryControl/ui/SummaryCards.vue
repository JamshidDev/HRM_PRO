<script setup>
  import { useSalaryControlStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useSalaryControlStore()

  // Phase 0: 1C oylik hisobotidan umumiy KPI kartalari.
  // `tint`/`icon` — maketdagi rangli plita (blue/indigo/green/amber/red); barcha
  // ranglar `fig-*` tokenlar orqali kelib, dark/light temaga o'zi moslashadi.
  const cards = computed(() => {
    const d = store.summary ?? {}
    return [
      {
        key: 'accrued',
        label: t('salaryControl.kpi.accrued'),
        value: Utils.formatNumberToMoney(d.total_accrued ?? 0),
        tint: 'blue',
        icon: 'money'
      },
      {
        key: 'employees',
        label: t('salaryControl.kpi.employees'),
        value: d.employee_count ?? 0,
        tint: 'indigo',
        icon: 'users'
      },
      {
        key: 'net',
        label: t('salaryControl.kpi.net'),
        value: Utils.formatNumberToMoney(d.total_net ?? 0),
        tint: 'green',
        icon: 'card'
      },
      {
        key: 'deduction',
        label: t('salaryControl.kpi.deduction'),
        value: Utils.formatNumberToMoney(d.total_deduction ?? 0),
        tint: 'amber',
        icon: 'minus'
      },
      {
        key: 'orgs',
        label: t('salaryControl.kpi.orgs'),
        value: d.org_count ?? 0,
        tint: 'red',
        icon: 'building'
      }
    ]
  })
</script>

<template>
  <n-spin :show="store.summaryLoading">
    <div class="kpi-grid">
      <div v-for="card in cards" :key="card.key" class="kpi-card">
        <div class="kpi-head">
          <span class="kpi-tile" :class="`kpi-tile--${card.tint}`">
            <!-- money -->
            <svg v-if="card.icon === 'money'" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <!-- users -->
            <svg v-else-if="card.icon === 'users'" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="9" cy="8" r="3.5" />
              <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" />
            </svg>
            <!-- card -->
            <svg v-else-if="card.icon === 'card'" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
            <!-- minus / deduction -->
            <svg v-else-if="card.icon === 'minus'" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M8 12h8" />
            </svg>
            <!-- building / org -->
            <svg v-else viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M14 9h4a2 2 0 0 1 2 2v10" />
              <path d="M8 7h2M8 11h2M8 15h2" />
            </svg>
          </span>
          <p class="kpi-title">{{ card.label }}</p>
        </div>
        <p class="kpi-value">{{ card.value }}</p>
      </div>
    </div>
  </n-spin>
</template>

<style scoped>
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }

  .kpi-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    border: 0.8px solid var(--fig-blue-300);
    background: var(--fig-block-bg);
  }

  .kpi-head {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .kpi-tile {
    flex: none;
    display: inline-grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    color: #fff;
  }

  .kpi-tile svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .kpi-tile--blue {
    background: var(--fig-icon-brand);
  }
  .kpi-tile--indigo {
    background: var(--fig-icon-indigo);
  }
  .kpi-tile--green {
    background: var(--fig-icon-green);
  }
  .kpi-tile--amber {
    background: var(--fig-icon-amber);
  }
  .kpi-tile--red {
    background: var(--fig-icon-red);
  }

  .kpi-title {
    min-width: 0;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
    line-height: 18px;
    font-weight: 500;
    color: var(--fig-text-tertiary);
  }

  .kpi-value {
    font-size: 20px;
    line-height: 26px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--fig-text-primary);
  }
</style>
