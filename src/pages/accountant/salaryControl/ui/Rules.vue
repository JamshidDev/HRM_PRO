<script setup>
  // «Mezonlar» tab — To'lov turlari bo'yicha aniqlash mezonlari (9 ta nazorat
  // qilinadigan to'lov turi). Baholash SERVER TOMONDA bajariladi
  // (salary-control.payment-rules.ts) — bu komponent faqat natijani chizadi.
  import { ref, computed } from 'vue'
  import i18n from '@/i18n/index.js'
  import { useSalaryControlStore, useAppStore } from '@/store/modules/index.js'
  import { money, mln, chartTheme, tokenColor } from '../helpers.js'
  import Card from './Card.vue'
  import EChart from './EChart.vue'

  const { t } = i18n.global
  const store = useSalaryControlStore()
  const appStore = useAppStore()

  // Natija tokeni ('based'|'check') → yorliq + badge sinfi.
  const resLabel = (res) =>
    res === 'check' ? t('salaryControl.rules.check') : res === 'based' ? t('salaryControl.rules.based') : ''
  const resClass = (res) => (res === 'check' ? 'sc-b--amber' : 'sc-b--green')
  const isCheck = (res) => res === 'check'

  // —— KPI qatori (rk) — server tomonda hisoblangan ————————————————————————
  const kpi = computed(() => {
    const k = store.rules.kpi || {}
    return {
      basedTypes: k.based_types || 0,
      checkTypes: k.check_types || 0,
      totalRecipients: k.total_recipients || 0,
      totalSum: k.total_sum || 0
    }
  })

  // —— Asosiy jadval (rtbl): 9 ta tur qatori (server) ——————————————————————
  const ruleRows = computed(() => store.rules.types || [])

  // —— Grafik (r11): 011 oluvchilari lavozim toifasi bo'yicha (server) ————————
  const r11Option = computed(() => {
    appStore.isDark
    const th = chartTheme()
    const rows = (store.rules.r11 || []).filter((r) => r.n)
    return {
      grid: { top: 8, left: 4, right: 16, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (p) => {
          const r = rows[p[0].dataIndex]
          return `<b>${r.c}</b> — 011 mukofoti<br/>${r.n} xodim · ${money(r.s)} so‘m`
        }
      },
      xAxis: {
        type: 'value',
        axisLabel: { color: th.text },
        splitLine: { lineStyle: { color: th.line } }
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: rows.map((r) => r.c),
        axisLabel: { color: th.textStrong, fontSize: 11 },
        axisLine: { lineStyle: { color: th.line } }
      },
      series: [
        {
          type: 'bar',
          data: rows.map((r) => ({
            value: r.n,
            itemStyle: {
              color: r.c === 'Ishchi' ? tokenColor('--fig-icon-green') : tokenColor('--fig-icon-amber')
            }
          })),
          barMaxWidth: 22,
          label: { show: true, position: 'right', color: th.text, formatter: '{c}' }
        }
      ]
    }
  })

  // —— Reestr (rreg): server tomonda tekshirish talab qilingan yozuvlar ——————
  const q = ref('')

  // Server registry — faqat 'check' yozuvlar, summa bo'yicha saralangan.
  // Bu yerda faqat qidiruv (prezentatsiya) qo'llanadi.
  const registry = computed(() => {
    const query = q.value.trim().toLowerCase()
    const list = store.rules.registry || []
    return query ? list.filter((x) => (x.fio || '').toLowerCase().includes(query)) : list
  })

  // —— Excel eksport — server tomonda haqiqiy .xlsx (mezonlar reestri) ————————
  const onExport = () => store._export('rules')
</script>

<template>
  <n-spin :show="store.dashboardLoading">
    <!-- rk — KPI qatori -->
    <div class="sc-kpis">
      <div class="sc-kpi">
        <div class="sc-kpi__h">
          <i class="sc-tile sc-tile--green"></i>{{ $t('salaryControl.rules.based') }}
        </div>
        <div class="sc-kpi__v">{{ kpi.basedTypes }}</div>
        <div class="sc-kpi__s">{{ $t('salaryControl.rules.code') }} — to‘lov turlari</div>
      </div>
      <div class="sc-kpi">
        <div class="sc-kpi__h">
          <i class="sc-tile sc-tile--amber"></i>{{ $t('salaryControl.rules.check') }}
        </div>
        <div class="sc-kpi__v">{{ kpi.checkTypes }}</div>
        <div class="sc-kpi__s">{{ $t('salaryControl.rules.code') }} — to‘lov turlari</div>
      </div>
      <div class="sc-kpi">
        <div class="sc-kpi__h"><i class="sc-tile sc-tile--brand"></i>{{ $t('salaryControl.common.people', { count: kpi.totalRecipients }) }}</div>
        <div class="sc-kpi__v">{{ kpi.totalRecipients }}</div>
        <div class="sc-kpi__s">{{ $t('salaryControl.common.count') }} — oluvchilar</div>
      </div>
      <div class="sc-kpi">
        <div class="sc-kpi__h"><i class="sc-tile sc-tile--indigo"></i>{{ $t('salaryControl.common.total') }}</div>
        <div class="sc-kpi__v">{{ mln(kpi.totalSum).toFixed(1) }} <span class="sc-kpi__u">mln</span></div>
        <div class="sc-kpi__s">{{ money(kpi.totalSum) }}</div>
      </div>
    </div>

    <!-- rtbl — asosiy jadval (9 ta tur) -->
    <Card :title="$t('salaryControl.rules.title')" :sub="$t('salaryControl.rules.sub')">
      <div class="sc-scroll">
        <table class="sc-tbl">
          <thead>
            <tr>
              <th style="width: 70px">{{ $t('salaryControl.rules.code') }}</th>
              <th>{{ $t('salaryControl.rules.name') }}</th>
              <th class="num" style="width: 80px">{{ $t('salaryControl.common.count') }}</th>
              <th class="num" style="width: 140px">{{ $t('salaryControl.common.sum') }}</th>
              <th style="width: 190px">{{ $t('salaryControl.rules.result') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in ruleRows" :key="row.k">
              <td><b>{{ row.k }}</b></td>
              <td>
                <b class="sc-name">{{ row.name }}</b>
                <div class="sc-muted">{{ row.m }}</div>
              </td>
              <td class="num">{{ row.n }}</td>
              <td class="num">{{ money(row.sum) }}</td>
              <td>
                <span v-if="row.res" class="sc-badge" :class="resClass(row.res)">
                  <i class="sc-dot"></i>{{ resLabel(row.res) }}
                </span>
                <span v-else class="sc-muted">{{ $t('salaryControl.common.empty') }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- r11 — 011 lavozim toifasi grafigi -->
    <Card :title="$t('salaryControl.rules.r11Title')" :sub="$t('salaryControl.rules.r11Sub')">
      <EChart :option="r11Option" height="240px" />
      <div class="sc-legend">
        <span><i class="sw" :style="{ background: 'var(--fig-icon-green)' }"></i>{{ $t('salaryControl.rules.based') }}</span>
        <span><i class="sw" :style="{ background: 'var(--fig-icon-amber)' }"></i>{{ $t('salaryControl.rules.check') }}</span>
      </div>
    </Card>

    <!-- rreg — reestr + rcsv -->
    <Card :title="$t('salaryControl.rules.registry')" :sub="$t('salaryControl.findings.count', { count: registry.length, sum: money(registry.reduce((a, x) => a + x.s, 0)) })">
      <template #head>
        <button class="sc-export" :disabled="store.exporting === 'rules'" @click="onExport">
          {{ store.exporting === 'rules' ? '…' : $t('salaryControl.common.export') }}
        </button>
      </template>
      <div class="sc-filters">
        <n-input
          v-model:value="q"
          size="small"
          clearable
          :placeholder="$t('salaryControl.common.search')"
          class="sc-search"
        />
      </div>
      <div class="sc-scroll">
        <table class="sc-tbl">
          <thead>
            <tr>
              <th class="num" style="width: 48px">№</th>
              <th>{{ $t('salaryControl.risk.table.fio') }}</th>
              <th>{{ $t('salaryControl.risk.table.position') }}</th>
              <th>{{ $t('salaryControl.rules.name') }}</th>
              <th class="num" style="width: 130px">{{ $t('salaryControl.common.sum') }}</th>
              <th>{{ $t('salaryControl.risk.finding') }}</th>
              <th style="width: 180px">{{ $t('salaryControl.rules.result') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(x, i) in registry" :key="i">
              <td class="num">{{ i + 1 }}</td>
              <td><b class="sc-name">{{ x.fio || '—' }}</b></td>
              <td class="sc-muted">{{ x.lav || '—' }}</td>
              <td>{{ x.name }} <span class="sc-muted">({{ x.k }})</span></td>
              <td class="num">{{ money(x.s) }}</td>
              <td class="sc-muted">{{ x.why }}</td>
              <td>
                <span class="sc-badge" :class="resClass(x.res)"><i class="sc-dot"></i>{{ resLabel(x.res) }}</span>
              </td>
            </tr>
            <tr v-if="!registry.length">
              <td colspan="7" class="sc-empty">{{ $t('salaryControl.common.empty') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  </n-spin>
</template>

<style scoped>
  /* —— KPI kartalari —————————————————————————————————————————————————— */
  .sc-kpis {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }
  @media (max-width: 900px) {
    .sc-kpis {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  .sc-kpi {
    background: var(--fig-block-bg);
    border: 0.8px solid var(--fig-blue-300);
    border-radius: 14px;
    padding: 12px 14px;
  }
  .sc-kpi__h {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--fig-text-secondary);
  }
  .sc-kpi__v {
    font-size: 24px;
    font-weight: 700;
    color: var(--fig-text-primary);
    margin-top: 6px;
    font-variant-numeric: tabular-nums;
  }
  .sc-kpi__u {
    font-size: 14px;
    font-weight: 600;
    color: var(--fig-text-tertiary);
  }
  .sc-kpi__s {
    font-size: 12px;
    color: var(--fig-text-tertiary);
    margin-top: 2px;
  }
  .sc-tile {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    display: inline-block;
  }
  .sc-tile--green {
    background: var(--fig-icon-green);
  }
  .sc-tile--amber {
    background: var(--fig-icon-amber);
  }
  .sc-tile--brand {
    background: var(--fig-icon-brand);
  }
  .sc-tile--indigo {
    background: var(--fig-icon-indigo);
  }

  /* —— Eksport tugmasi ———————————————————————————————————————————————— */
  .sc-export {
    border: 0;
    background: var(--fig-icon-brand);
    color: #fff;
    border-radius: 10px;
    padding: 7px 14px;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }

  /* —— Legenda ———————————————————————————————————————————————————————— */
  .sc-legend {
    display: flex;
    gap: 14px;
    font-size: 12px;
    color: var(--fig-text-secondary);
    margin-top: 6px;
    flex-wrap: wrap;
  }
  .sc-legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .sw {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
  }

  /* —— Filtrlar (Overview bilan bir xil) ——————————————————————————————— */
  .sc-filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 12px;
  }
  .sc-chip {
    border: 0;
    background: var(--fig-bg-tertiary);
    color: var(--fig-text-secondary);
    border-radius: 10px;
    padding: 6px 14px;
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
  }
  .sc-chip[aria-pressed='true'] {
    background: var(--fig-icon-brand);
    color: #fff;
    font-weight: 600;
  }
  .sc-search {
    width: 220px;
    max-width: 100%;
  }

  /* —— Jadval (Overview .sc-tbl/.sc-scroll bilan bir xil) ————————————————— */
  .sc-scroll {
    overflow: auto;
    max-height: 560px;
    border-radius: 12px;
    border: 0.8px solid var(--fig-br-disable);
  }
  .sc-tbl {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 13px;
  }
  .sc-tbl th {
    text-align: left;
    color: var(--fig-text-tertiary);
    font-weight: 600;
    font-size: 12px;
    padding: 10px;
    border-bottom: 1px solid var(--fig-br-disable);
    position: sticky;
    top: 0;
    background: var(--fig-block-header-bg);
    white-space: nowrap;
  }
  .sc-tbl td {
    padding: 10px;
    border-bottom: 1px solid var(--fig-br-disable);
    vertical-align: top;
    color: var(--fig-text-secondary);
  }
  .sc-tbl .num {
    text-align: right;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .sc-name {
    color: var(--fig-text-primary);
  }
  .sc-muted {
    color: var(--fig-text-tertiary);
    font-size: 12px;
    margin-top: 3px;
  }
  .sc-empty {
    text-align: center;
    color: var(--fig-text-tertiary);
    padding: 24px;
  }

  /* —— Badge (Overview bilan bir xil + green natija) —————————————————————— */
  .sc-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border-radius: 999px;
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }
  .sc-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    display: inline-block;
  }
  .sc-b--green {
    background: var(--fig-bg-brand-surface);
    color: var(--fig-icon-green);
  }
  .sc-b--amber {
    background: var(--fig-bg-brand-surface);
    color: var(--fig-icon-amber);
  }
</style>
