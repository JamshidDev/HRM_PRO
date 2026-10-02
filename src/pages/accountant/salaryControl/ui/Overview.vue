<script setup>
  // «Umumiy» tab — SummaryCards'dan keyingi qism: holatlar turi/summa grafiklari
  // + tekshirilishi kerak bo'lgan holatlar reestri (D.F). Manba: store.findings.
  import { ref, computed } from 'vue'
  import i18n from '@/i18n/index.js'
  import { useAppStore } from '@/store/modules/index.js'
  import { useSalaryControlStore } from '@/store/modules/index.js'
  import { money, mln, chartTheme, tokenColor } from '../helpers.js'
  import Card from './Card.vue'
  import EChart from './EChart.vue'

  const { t } = i18n.global
  const store = useSalaryControlStore()
  const appStore = useAppStore()

  const SEV = ['Yuqori', 'O‘rta', 'Past']
  const SEV_TOKEN = { Yuqori: '--fig-icon-red', 'O‘rta': '--fig-icon-orange', Past: '--fig-icon-amber' }

  // —— Filtrlar ————————————————————————————————————————————————————————
  const sev = ref('')
  const q = ref('')
  const chips = computed(() => [
    { v: '', label: t('salaryControl.findings.all') },
    { v: 'Yuqori', label: t('salaryControl.findings.high') },
    { v: 'O‘rta', label: t('salaryControl.findings.mid') },
    { v: 'Past', label: t('salaryControl.findings.low') }
  ])

  const rows = computed(() => {
    const query = q.value.trim().toLowerCase()
    return store.findings.filter(
      (f) =>
        (!sev.value || f.sev === sev.value) &&
        (!query || (f.fio || '').toLowerCase().includes(query))
    )
  })

  const totalSum = computed(() => store.findings.reduce((a, f) => a + (f.summa || 0), 0))

  // —— Grafik: holatlar turi bo'yicha (severity kesimida stacked bar) ————
  const catCountOption = computed(() => {
    appStore.isDark
    const th = chartTheme()
    const cats = [...new Set(store.findings.map((f) => f.cat))]
    const byCat = cats.map((c) => {
      const items = store.findings.filter((f) => f.cat === c)
      return { c, n: SEV.map((s) => items.filter((f) => f.sev === s).length), total: items.length }
    })
    byCat.sort((a, b) => b.total - a.total)
    return {
      grid: { top: 8, left: 4, right: 16, bottom: 4, containLabel: true },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { show: false },
      xAxis: { type: 'value', axisLabel: { color: th.text }, splitLine: { lineStyle: { color: th.line } } },
      yAxis: {
        type: 'category',
        inverse: true,
        data: byCat.map((r) => r.c),
        axisLabel: { color: th.textStrong, width: 220, overflow: 'truncate', fontSize: 11 },
        axisLine: { lineStyle: { color: th.line } }
      },
      series: SEV.map((s, i) => ({
        name: s,
        type: 'bar',
        stack: 'x',
        data: byCat.map((r) => r.n[i]),
        itemStyle: { color: tokenColor(SEV_TOKEN[s]) },
        barMaxWidth: 18
      }))
    }
  })

  // —— Grafik: shubhali summa — muammo turi bo'yicha (mln) ————————————————
  const catSumOption = computed(() => {
    appStore.isDark
    const th = chartTheme()
    const map = {}
    for (const f of store.findings) map[f.cat] = (map[f.cat] || 0) + (f.summa || 0)
    const arr = Object.entries(map)
      .map(([c, v]) => ({ c, v: mln(v) }))
      .sort((a, b) => b.v - a.v)
    return {
      grid: { top: 8, left: 4, right: 16, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        valueFormatter: (v) => v.toFixed(1) + ' mln'
      },
      xAxis: { type: 'value', axisLabel: { color: th.text }, splitLine: { lineStyle: { color: th.line } } },
      yAxis: {
        type: 'category',
        inverse: true,
        data: arr.map((r) => r.c),
        axisLabel: { color: th.textStrong, width: 220, overflow: 'truncate', fontSize: 11 },
        axisLine: { lineStyle: { color: th.line } }
      },
      series: [
        {
          type: 'bar',
          data: arr.map((r) => r.v),
          itemStyle: { color: tokenColor('--fig-icon-brand') },
          barMaxWidth: 18
        }
      ]
    }
  })

  const sevClass = (s) =>
    s === 'Yuqori' ? 'sc-b--red' : s === 'O‘rta' ? 'sc-b--orange' : 'sc-b--amber'
</script>

<template>
  <n-spin :show="store.dashboardLoading">
    <div class="sc-grid2">
      <Card :title="$t('salaryControl.findings.byType')" :sub="$t('salaryControl.findings.byTypeSub')">
        <EChart :option="catCountOption" height="300px" />
        <div class="sc-legend">
          <span><i class="sw" :style="{ background: 'var(--fig-icon-red)' }"></i>{{ $t('salaryControl.findings.high') }}</span>
          <span><i class="sw" :style="{ background: 'var(--fig-icon-orange)' }"></i>{{ $t('salaryControl.findings.mid') }}</span>
          <span><i class="sw" :style="{ background: 'var(--fig-icon-amber)' }"></i>{{ $t('salaryControl.findings.low') }}</span>
        </div>
      </Card>
      <Card :title="$t('salaryControl.findings.bySum')" :sub="$t('salaryControl.findings.bySumSub')">
        <EChart :option="catSumOption" height="300px" />
      </Card>
    </div>

    <Card
      :title="$t('salaryControl.findings.title')"
      :sub="$t('salaryControl.findings.count', { count: store.findings.length, sum: money(totalSum) })"
    >
      <template #head>
        <button
          class="sc-export"
          :disabled="store.exporting === 'findings'"
          @click="store._export('findings')"
        >
          {{ store.exporting === 'findings' ? '…' : $t('salaryControl.common.export') }}
        </button>
      </template>
      <div class="sc-filters">
        <button
          v-for="c in chips"
          :key="c.v"
          class="sc-chip"
          :aria-pressed="sev === c.v"
          @click="sev = c.v"
        >
          {{ c.label }}
        </button>
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
              <th>{{ $t('salaryControl.risk.table.fio') }}</th>
              <th>{{ $t('salaryControl.risk.table.position') }}</th>
              <th>{{ $t('salaryControl.findings.byType') }}</th>
              <th class="num">{{ $t('salaryControl.common.sum') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(f, i) in rows" :key="i">
              <td>
                <span class="sc-badge" :class="sevClass(f.sev)"><i class="sc-dot"></i>{{ f.sev }}</span>
                <b class="sc-fio">{{ f.fio || '—' }}</b>
                <div class="sc-muted">{{ f.txt }}</div>
              </td>
              <td class="sc-muted">{{ f.lav || '—' }}</td>
              <td>{{ f.cat }}</td>
              <td class="num">{{ money(f.summa) }}</td>
            </tr>
            <tr v-if="!rows.length">
              <td colspan="4" class="sc-empty">{{ $t('salaryControl.common.empty') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  </n-spin>
</template>

<style scoped>
  .sc-grid2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  @media (max-width: 900px) {
    .sc-grid2 {
      grid-template-columns: 1fr;
    }
  }
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
  .sc-export:disabled {
    opacity: 0.6;
    cursor: default;
  }
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
  .sc-fio {
    color: var(--fig-text-primary);
    margin-left: 8px;
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
  .sc-b--red {
    background: var(--fig-bg-red-fill);
    color: var(--fig-text-red);
  }
  .sc-b--orange {
    background: var(--fig-bg-brand-surface);
    color: var(--fig-icon-orange);
  }
  .sc-b--amber {
    background: var(--fig-bg-brand-surface);
    color: var(--fig-icon-amber);
  }
</style>
