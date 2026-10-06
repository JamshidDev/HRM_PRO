<script setup>
  // «14 ta risk» tab — RiskMap'dan keyingi tahliliy grafiklar + ta'sirlangan
  // xodimlar reestri. Manba: store.emps (grafiklar) + store.risks (reestr).
  // Maket: oylik_nazorat_dashboard_5.html (c14a/c14b/c14c/t14) — echarts ko'chirmasi.
  import { ref, computed } from 'vue'
  import i18n from '@/i18n/index.js'
  import { useSalaryControlStore, useAppStore } from '@/store/modules/index.js'
  import { money, mln, chartTheme, tokenColor } from '../helpers.js'
  import Card from './Card.vue'
  import EChart from './EChart.vue'
  import ScSkeleton from './ScSkeleton.vue'

  const { t } = i18n.global
  const store = useSalaryControlStore()
  const appStore = useAppStore()

  // —— Yordamchi: matnni qisqartirish ————————————————————————————————————
  const trunc = (s, n = 22) => {
    const str = String(s || '')
    return str.length > n ? str.slice(0, n - 1) + '…' : str
  }

  // ————————————————————————————————————————————————————————————————————
  // c14a — Risk 4: bir xil lavozim, turlicha oklad (scatter)
  // ————————————————————————————————————————————————————————————————————
  const spreadGroups = computed(() => {
    const byLav = new Map()
    for (const e of store.emps ?? []) {
      const lav = e.lav || '—'
      const ok = Math.round(Number(e.ok) || 0)
      if (!ok) continue
      if (!byLav.has(lav)) byLav.set(lav, new Set())
      byLav.get(lav).add(ok)
    }
    // faqat >1 xil oklad bo'lgan lavozimlar
    const groups = []
    for (const [lav, set] of byLav) {
      if (set.size > 1) groups.push({ lav, oklads: [...set].sort((a, b) => a - b) })
    }
    // eng ko'p tarqoq (oklad soni) yuqorida — top 12
    groups.sort((a, b) => b.oklads.length - a.oklads.length)
    return groups.slice(0, 12)
  })

  const spreadOption = computed(() => {
    appStore.isDark
    const th = chartTheme()
    const groups = spreadGroups.value
    const cats = groups.map((g) => trunc(g.lav, 24))
    // har oklad = bitta nuqta [x=guruh indeksi, y=oklad mln]
    const points = []
    groups.forEach((g, gi) => {
      for (const ok of g.oklads) points.push([gi, mln(ok), g.lav, ok, g.oklads.length])
    })
    return {
      grid: { top: 12, left: 4, right: 16, bottom: 90, containLabel: true },
      tooltip: {
        trigger: 'item',
        formatter: (p) => {
          const [, , lav, ok, cnt] = p.value
          return `<b>${lav}</b><br>${money(ok)} so'm<br>${cnt} xil oklad`
        }
      },
      xAxis: {
        type: 'category',
        data: cats,
        axisLabel: {
          color: th.text,
          interval: 0,
          rotate: 40,
          width: 110,
          overflow: 'truncate',
          fontSize: 10
        },
        axisLine: { lineStyle: { color: th.line } }
      },
      yAxis: {
        type: 'value',
        name: 'mln',
        nameTextStyle: { color: th.text },
        axisLabel: { color: th.text, formatter: (v) => v.toFixed(1) },
        splitLine: { lineStyle: { color: th.line } }
      },
      series: [
        {
          type: 'scatter',
          symbolSize: 11,
          data: points,
          itemStyle: {
            color: tokenColor('--fig-icon-brand'),
            borderColor: tokenColor('--fig-block-bg'),
            borderWidth: 2
          }
        }
      ]
    }
  })

  // ————————————————————————————————————————————————————————————————————
  // c14b — Risk 11: ushlanmalar ulushi (top 15, horizontal bar)
  // ————————————————————————————————————————————————————————————————————
  const shareOption = computed(() => {
    appStore.isDark
    const th = chartTheme()
    const list = (store.emps ?? [])
      .map((e) => {
        const tot = Number(e.tot) || 0
        const card = Number(e.card) || 0
        const share = tot > 0 ? (tot - card) / tot : 0
        return { fio: e.fio || '—', share, ded: tot - card }
      })
      .filter((e) => e.share > 0)
      .sort((a, b) => b.share - a.share)
      .slice(0, 15)
      .reverse() // eng yuqori yuqorida (inverse category)
    return {
      grid: { top: 8, left: 4, right: 40, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (ps) => {
          const p = ps[0]
          const e = list[p.dataIndex]
          return `<b>${e.fio}</b><br>Ushlanma ulushi: ${(e.share * 100).toFixed(0)}%<br>${money(e.ded)} so'm`
        }
      },
      xAxis: {
        type: 'value',
        max: 100,
        axisLabel: { color: th.text, formatter: '{value}%' },
        splitLine: { lineStyle: { color: th.line } }
      },
      yAxis: {
        type: 'category',
        data: list.map((e) => trunc(e.fio, 22)),
        axisLabel: { color: th.textStrong, fontSize: 11 },
        axisLine: { lineStyle: { color: th.line } }
      },
      series: [
        {
          type: 'bar',
          data: list.map((e) => +(e.share * 100).toFixed(1)),
          barMaxWidth: 16,
          itemStyle: {
            color: (p) =>
              list[p.dataIndex].share > 0.5
                ? tokenColor('--fig-icon-red')
                : tokenColor('--fig-icon-brand')
          },
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { color: tokenColor('--fig-icon-red'), type: 'dashed' },
            label: { color: tokenColor('--fig-icon-red'), fontWeight: 600 },
            data: [
              { xAxis: 50, label: { formatter: '50%' } },
              { xAxis: 70, label: { formatter: '70%' } }
            ]
          }
        }
      ]
    }
  })

  // ————————————————————————————————————————————————————————————————————
  // c14c — Risk 9: ishlangan soatlar taqsimoti (histogram)
  // ————————————————————————————————————————————————————————————————————
  const hoursOption = computed(() => {
    appStore.isDark
    const th = chartTheme()
    const norm = Number(store.dashNorm) || 0
    const hist = {}
    for (const e of store.emps ?? []) {
      const h = Math.round(Number(e.t) || 0)
      if (h <= 0) continue
      hist[h] = (hist[h] || 0) + 1
    }
    const keys = Object.keys(hist)
      .map(Number)
      .sort((a, b) => a - b)
    return {
      grid: { top: 24, left: 4, right: 16, bottom: 24, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (ps) => {
          const k = keys[ps[0].dataIndex]
          const over = norm && k > norm ? `<br>Me'yordan ${k - norm} soat ko'p` : ''
          return `<b>${k} soat</b>: ${hist[k]} xodim${over}`
        }
      },
      xAxis: {
        type: 'category',
        data: keys,
        axisLabel: { color: th.text, fontSize: 10 },
        axisLine: { lineStyle: { color: th.line } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: th.text },
        splitLine: { lineStyle: { color: th.line } }
      },
      series: [
        {
          type: 'bar',
          data: keys.map((k) => hist[k]),
          barMaxWidth: 26,
          label: { show: true, position: 'top', color: th.text, fontSize: 10 },
          itemStyle: {
            color: (p) =>
              norm && keys[p.dataIndex] > norm
                ? tokenColor('--fig-icon-amber')
                : tokenColor('--fig-icon-brand')
          },
          markLine: norm
            ? {
                silent: true,
                symbol: 'none',
                lineStyle: { color: tokenColor('--fig-icon-red'), type: 'dashed' },
                label: {
                  color: tokenColor('--fig-icon-red'),
                  fontWeight: 600,
                  formatter: `${norm}`
                },
                data: [{ xAxis: String(norm) }]
              }
            : undefined
        }
      ]
    }
  })

  // ————————————————————————————————————————————————————————————————————
  // t14 — Risk reestri: bad/chk risklarning affected[] tekislangan ro'yxati
  // ————————————————————————————————————————————————————————————————————
  const allRows = computed(() => {
    const rows = []
    for (const r of store.risks ?? []) {
      if (r.status !== 'bad' && r.status !== 'chk') continue
      for (const a of r.affected ?? []) {
        rows.push({
          riskN: r.n,
          riskTitle: r.title,
          fio: a.fio || '—',
          position: a.position || '',
          detail: a.detail || '—',
          summa: a.summa
        })
      }
    }
    return rows
  })

  // filtr — risk raqami bo'yicha chip + qidiruv
  const riskFilter = ref('')
  const q = ref('')

  const riskOptions = computed(() => {
    const seen = new Map()
    for (const row of allRows.value) {
      if (!seen.has(row.riskN)) seen.set(row.riskN, row.riskTitle)
    }
    return [...seen].map(([n, title]) => ({ n, title }))
  })

  // n-select uchun: «Barchasi» + «Risk N — nomi» (to'liq nom ko'rinadi).
  const riskSelectOptions = computed(() => [
    { label: t('salaryControl.findings.all'), value: '' },
    ...riskOptions.value.map((o) => ({ label: `Risk ${o.n} — ${o.title}`, value: o.n }))
  ])

  const rows = computed(() => {
    const query = q.value.trim().toLowerCase()
    return allRows.value.filter(
      (r) =>
        (!riskFilter.value || r.riskN === riskFilter.value) &&
        (!query || r.fio.toLowerCase().includes(query))
    )
  })
</script>

<template>
  <template v-if="store.dashboardLoading">
    <ScSkeleton variant="chart2" chart-height="320px" />
    <div class="sc-sk-gap"><ScSkeleton variant="chart" chart-height="300px" /></div>
    <div class="sc-sk-gap"><ScSkeleton variant="table" /></div>
  </template>

  <template v-else>
    <!-- c14a + c14b -->
    <div class="sc-grid2">
      <Card
        title="Risk 4 · Bir xil lavozim — turlicha oklad"
        sub="Bir lavozimda bir nechta oklad qiymati bo'lgan guruhlar (har nuqta — bitta oklad)"
      >
        <EChart :option="spreadOption" height="320px" />
        <p v-if="!spreadGroups.length" class="sc-empty">{{ $t('salaryControl.common.empty') }}</p>
      </Card>

      <Card
        title="Risk 11 · Ushlanmalar ulushi"
        sub="Soliqdan tashqari ushlanmalar / jami hisoblangan — eng yuqori 15 xodim"
      >
        <EChart :option="shareOption" height="320px" />
      </Card>
    </div>

    <!-- c14c -->
    <Card
      title="Risk 9 · Ishlangan soatlar taqsimoti"
      :sub="store.dashNorm ? $t('salaryControl.common.norm', { norm: store.dashNorm }) : ''"
    >
      <EChart :option="hoursOption" height="300px" />
    </Card>

    <!-- t14 -->
    <Card
      title="14 ta risk reestri"
      :sub="$t('salaryControl.common.people', { count: rows.length })"
    >
      <div class="sc-filters">
        <n-select
          v-model:value="riskFilter"
          :options="riskSelectOptions"
          size="small"
          class="sc-risk-select"
        />
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
              <th>{{ $t('salaryControl.common.count') }}</th>
              <th>{{ $t('salaryControl.risk.table.fio') }}</th>
              <th>Risk nomi</th>
              <th>{{ $t('salaryControl.risk.table.detail') }}</th>
              <th class="num">{{ $t('salaryControl.risk.table.summa') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in rows" :key="i">
              <td><span class="sc-rn">{{ r.riskN }}</span></td>
              <td>
                <b class="sc-fio">{{ r.fio }}</b>
                <div v-if="r.position" class="sc-muted">{{ r.position }}</div>
              </td>
              <td>{{ r.riskTitle }}</td>
              <td class="sc-muted">{{ r.detail }}</td>
              <td class="num">{{ r.summa != null ? money(r.summa) : '—' }}</td>
            </tr>
            <tr v-if="!rows.length">
              <td colspan="5" class="sc-empty">{{ $t('salaryControl.common.empty') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  </template>
</template>

<style scoped>
  .sc-sk-gap {
    margin-top: 16px;
  }
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
  .sc-risk-select {
    width: 340px;
    max-width: 100%;
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
  .sc-rn {
    display: inline-grid;
    place-items: center;
    min-width: 24px;
    height: 24px;
    padding: 0 4px;
    border-radius: 8px;
    background: var(--fig-icon-brand);
    color: #fff;
    font-weight: 700;
    font-size: 12px;
  }
  .sc-fio {
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
</style>
