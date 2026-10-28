<script setup>
  // «Umumiy» tab — holatlar turi/summa grafiklari + tekshirilishi kerak bo'lgan
  // holatlar reestri (D.F). Manba: store.findings.
  import { ref, computed, h } from 'vue'
  import i18n from '@/i18n/index.js'
  import { useAppStore, useSalaryControlStore } from '@/store/modules/index.js'
  import { money, mln, chartTheme, tokenColor } from '../helpers.js'
  import Card from './Card.vue'
  import EChart from './EChart.vue'
  import ScSkeleton from './ScSkeleton.vue'
  import StatusBadge from './StatusBadge.vue'

  const { t } = i18n.global
  const store = useSalaryControlStore()
  const appStore = useAppStore()

  const SEV = ['Yuqori', 'O‘rta', 'Past']
  const SEV_TOKEN = { Yuqori: '--fig-icon-red', 'O‘rta': '--fig-icon-orange', Past: '--fig-icon-amber' }
  const SEV_RANK = { Yuqori: 0, 'O‘rta': 1, Past: 2 }
  const sevTone = (s) => (s === 'Yuqori' ? 'red' : s === 'O‘rta' ? 'orange' : 'amber')

  // —— Filtrlar ————————————————————————————————————————————————————————
  const sev = ref('')
  const q = ref('')
  const chips = computed(() => [
    { v: '', label: t('salaryControl.findings.all') },
    { v: 'Yuqori', label: t('salaryControl.findings.high') },
    { v: 'O‘rta', label: t('salaryControl.findings.mid') },
    { v: 'Past', label: t('salaryControl.findings.low') }
  ])

  // —— Xodim bo'yicha guruhlash — bitta xodim bir necha holatda bo'lsa bitta qator;
  // eng yuqori xavf darajasi; holatlar turi teglari; summa TAKROR qo'shilmaydi
  // (eng katta olinadi). JSHSHIR (f.j) bo'yicha aniq guruhlash; yo'q bo'lsa F.I.O.+lavozim.
  const grouped = computed(() => {
    const map = new Map()
    for (const f of store.findings) {
      const key = f.j || `${f.fio || ''}||${f.lav || ''}`
      let g = map.get(key)
      if (!g) {
        g = { fio: f.fio || '—', lav: f.lav || '', cats: [], sev: f.sev, summa: 0, txt: f.txt }
        map.set(key, g)
      }
      if (!g.cats.includes(f.cat)) g.cats.push(f.cat)
      if ((SEV_RANK[f.sev] ?? 9) < (SEV_RANK[g.sev] ?? 9)) {
        g.sev = f.sev
        g.txt = f.txt
      }
      g.summa = Math.max(g.summa, f.summa || 0)
    }
    return [...map.values()]
  })

  const rows = computed(() => {
    const query = q.value.trim().toLowerCase()
    return grouped.value
      .filter(
        (g) =>
          (!sev.value || g.sev === sev.value) &&
          (!query || g.fio.toLowerCase().includes(query))
      )
      .sort((a, b) => (SEV_RANK[a.sev] - SEV_RANK[b.sev]) || b.summa - a.summa)
  })

  const totalSum = computed(() => rows.value.reduce((a, g) => a + (g.summa || 0), 0))

  const columns = computed(() => [
    {
      title: t('salaryControl.risk.table.fio'),
      key: 'fio',
      minWidth: 260,
      ellipsis: { tooltip: true },
      render: (r) =>
        h('div', { class: 'sc-fio-cell' }, [
          h(StatusBadge, { tone: sevTone(r.sev), label: r.sev }),
          h('b', { class: 'sc-fio' }, r.fio)
        ])
    },
    {
      title: t('salaryControl.risk.table.position'),
      key: 'lav',
      minWidth: 180,
      ellipsis: { tooltip: true },
      render: (r) => r.lav || t('salaryControl.common.notSet')
    },
    {
      title: t('salaryControl.findings.byType'),
      key: 'cats',
      minWidth: 200,
      render: (r) =>
        h(
          'div',
          { class: 'sc-tags' },
          r.cats.map((c) => h('span', { class: 'sc-tag' }, c))
        )
    },
    {
      title: t('salaryControl.common.sum'),
      key: 'summa',
      align: 'right',
      width: 150,
      className: 'sc-num',
      render: (r) => money(r.summa)
    }
  ])

  const pagination = { pageSize: 50, showSizePicker: true, pageSizes: [50, 100, 200] }

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
      grid: { top: 12, left: 4, right: 24, bottom: 4, containLabel: true },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { show: false },
      xAxis: { type: 'value', axisLabel: { color: th.text }, splitLine: { lineStyle: { color: th.line } } },
      yAxis: {
        type: 'category',
        inverse: true,
        data: byCat.map((r) => r.c),
        axisLabel: { color: th.textStrong, width: 200, overflow: 'truncate', fontSize: 11 },
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
      grid: { top: 12, left: 4, right: 24, bottom: 4, containLabel: true },
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
        axisLabel: { color: th.textStrong, width: 200, overflow: 'truncate', fontSize: 11 },
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
</script>

<template>
  <template v-if="store.dashboardLoading">
    <ScSkeleton variant="chart2" chart-height="300px" />
    <ScSkeleton variant="table" />
  </template>

  <template v-else>
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
      :sub="$t('salaryControl.findings.count', { count: rows.length, sum: money(totalSum) })"
    >
      <template #head>
        <button
          class="sc-export"
          :disabled="store.exporting === 'findings'"
          @click="store._export('findings')"
        >
          {{ store.exporting === 'findings' ? $t('salaryControl.common.exporting') : $t('salaryControl.common.export') }}
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
      <n-data-table
        :columns="columns"
        :data="rows"
        :pagination="pagination"
        :bordered="false"
        :scroll-x="790"
        size="small"
      />
    </Card>
  </template>
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
  :deep(.sc-fio-cell) {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  :deep(.sc-fio) {
    color: var(--fig-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  :deep(.sc-tags) {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  :deep(.sc-tag) {
    background: var(--fig-bg-tertiary);
    color: var(--fig-text-secondary);
    border-radius: 6px;
    padding: 1px 8px;
    font-size: 12px;
    white-space: nowrap;
  }
  :deep(.sc-num) {
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
</style>
