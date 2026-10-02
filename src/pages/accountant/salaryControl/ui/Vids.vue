<script setup>
  // «To'lov turlari (vidlar)» tab — vidlar tarkibi (horizontal bar), mukofot/
  // ishlangan vaqt (scatter) va mukofot foizi strip-plot (lavozim guruhlari).
  // Manba: store.vids + store.emps + store.findings. Maketning echarts ko'chirmasi.
  import { computed } from 'vue'
  import i18n from '@/i18n/index.js'
  import { useSalaryControlStore, useAppStore } from '@/store/modules/index.js'
  import { money, mln, positionGroup, chartTheme, tokenColor } from '../helpers.js'
  import Card from './Card.vue'
  import EChart from './EChart.vue'

  const { t } = i18n.global
  const store = useSalaryControlStore()
  const appStore = useAppStore()

  const flagged = computed(() => new Set(store.findings.map((f) => f.fio)))

  const truncate = (s, n) => {
    const str = String(s || '')
    return str.length > n ? str.slice(0, n - 1) + '…' : str
  }

  // —— 1) Vid tarkibi: gorizontal bar (top 14, summa mln bo'yicha) ————————————
  const vidOption = computed(() => {
    appStore.isDark
    const th = chartTheme()
    const V = store.vids.slice(0, 14)
    // Yuqoridagi eng katta pastda turishi uchun teskari tartibda beramiz.
    const rows = V.slice().reverse()
    const brand = tokenColor('--fig-icon-brand')
    return {
      grid: { top: 8, left: 4, right: 60, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (p) => {
          const v = rows[p[0].dataIndex]
          return `<b>${v.k}</b> — ${v.n}<br/>${money(v.s)} · ${v.c} ta`
        }
      },
      xAxis: {
        type: 'value',
        axisLabel: { color: th.text, formatter: (v) => v.toFixed(0) },
        splitLine: { lineStyle: { color: th.line } }
      },
      yAxis: {
        type: 'category',
        data: rows.map((v) => `${v.k} · ${truncate(v.n, 30)}`),
        axisLabel: { color: th.textStrong, width: 230, overflow: 'truncate', fontSize: 11 },
        axisLine: { lineStyle: { color: th.line } }
      },
      series: [
        {
          type: 'bar',
          data: rows.map((v) => ({ value: mln(v.s), raw: v })),
          itemStyle: { color: brand, borderRadius: [0, 4, 4, 0] },
          barMaxWidth: 16,
          label: {
            show: true,
            position: 'right',
            color: th.text,
            fontSize: 10,
            formatter: (p) => mln(p.data.raw.s).toFixed(1)
          }
        }
      ]
    }
  })

  // —— 2) Mukofot / ishlangan vaqt: scatter (x=004/ok, y=011/ok) ——————————————
  const scatterOption = computed(() => {
    appStore.isDark
    const th = chartTheme()
    const brand = tokenColor('--fig-icon-brand')
    const red = tokenColor('--fig-icon-red')
    const pts = store.emps.filter((e) => e.ok > 0 && (e.v?.['004'] || e.v?.['011']))
    const clamp = (v, hi) => Math.max(0, Math.min(v, hi))
    const norm = []
    const risk = []
    for (const e of pts) {
      const worked = clamp((e.v?.['004'] || 0) / e.ok, 1.2)
      const bonus = clamp((e.v?.['011'] || 0) / e.ok, 1.6)
      // Nomutanosib: mukofot ulushi ishlangan ulushdan yuqori (chiziq ustida).
      const bad = bonus > worked
      const point = { value: [worked, bonus], raw: e }
      ;(bad ? risk : norm).push(point)
    }
    const tip = (d) => {
      const e = d.raw
      const wp = Math.round(((e.v?.['004'] || 0) / e.ok) * 100)
      const bp = Math.round(((e.v?.['011'] || 0) / e.ok) * 100)
      return `<b>${e.fio || '—'}</b><br/>${e.lav || ''}<br/>${t('salaryControl.vids.scatterSub')}<br/>004: ${wp}% · 011: ${bp}%`
    }
    return {
      grid: { top: 12, left: 8, right: 16, bottom: 30, containLabel: true },
      tooltip: { trigger: 'item', formatter: (p) => tip(p.data) },
      xAxis: {
        type: 'value',
        min: 0,
        max: 1.2,
        name: t('salaryControl.vids.scatterSub'),
        nameLocation: 'middle',
        nameGap: 26,
        nameTextStyle: { color: th.text, fontSize: 11 },
        axisLabel: { color: th.text, formatter: (v) => Math.round(v * 100) + '%' },
        splitLine: { lineStyle: { color: th.line } }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 1.6,
        axisLabel: { color: th.text, formatter: (v) => Math.round(v * 100) + '%' },
        splitLine: { lineStyle: { color: th.line } }
      },
      series: [
        {
          name: t('salaryControl.vids.scatter'),
          type: 'scatter',
          data: norm,
          symbolSize: 9,
          itemStyle: { color: brand, opacity: 0.8 },
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { type: 'dashed', color: tokenColor('--fig-text-tertiary'), width: 2 },
            data: [[{ coord: [0, 0] }, { coord: [1.2, 1.2] }]]
          }
        },
        {
          name: t('salaryControl.vids.scatter'),
          type: 'scatter',
          data: risk,
          symbolSize: 12,
          itemStyle: { color: red, opacity: 0.95 }
        }
      ]
    }
  })

  // —— 3) Mukofot foizi strip-plot: x=011/004, y=lavozim guruhi (category) —————
  const stripGroups = computed(() => {
    const set = new Set()
    for (const e of store.emps) {
      if ((e.v?.['011'] || 0) > 0 && (e.v?.['004'] || 0) > 0) set.add(positionGroup(e.lav))
    }
    return [...set]
  })

  const stripOption = computed(() => {
    appStore.isDark
    const th = chartTheme()
    const brand = tokenColor('--fig-icon-brand')
    const red = tokenColor('--fig-icon-red')
    const groups = stripGroups.value
    const XMAX = 6 // 600% cap
    const pts = store.emps
      .filter((e) => (e.v?.['011'] || 0) > 0 && (e.v?.['004'] || 0) > 0)
      .map((e) => ({ e, g: positionGroup(e.lav), r: (e.v['011'] || 0) / (e.v['004'] || 1) }))
    const norm = []
    const risk = []
    pts.forEach((p, i) => {
      const gi = groups.indexOf(p.g)
      // Guruh ichida tarqoqlik uchun deterministik vertikal jitter (±0.3).
      const jitter = (((i * 37) % 17) / 16 - 0.5) * 0.6
      const bad = flagged.value.has(p.e.fio) && p.r > 1.05
      const point = { value: [Math.min(p.r, XMAX), gi + jitter], raw: p }
      ;(bad ? risk : norm).push(point)
    })
    const tip = (d) => {
      const p = d.raw
      return `<b>${p.e.fio || '—'}</b><br/>${p.e.lav || ''}<br/>011/004: ${Math.round(p.r * 100)}%<br/>011: ${money(p.e.v['011'])} · 004: ${money(p.e.v['004'])}`
    }
    return {
      grid: { top: 12, left: 8, right: 20, bottom: 30, containLabel: true },
      tooltip: { trigger: 'item', formatter: (p) => tip(p.data) },
      xAxis: {
        type: 'value',
        min: 0,
        max: XMAX,
        axisLabel: { color: th.text, formatter: (v) => Math.round(v * 100) + '%' },
        splitLine: { lineStyle: { color: th.line } }
      },
      yAxis: {
        type: 'category',
        data: groups,
        axisLabel: { color: th.textStrong, fontSize: 11 },
        axisLine: { lineStyle: { color: th.line } },
        splitLine: { show: true, lineStyle: { color: th.line, type: 'dashed' } }
      },
      series: [
        {
          type: 'scatter',
          data: norm,
          symbolSize: 9,
          itemStyle: { color: brand, opacity: 0.7 },
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { type: 'dashed', color: tokenColor('--fig-text-tertiary'), width: 1.5 },
            data: [{ xAxis: 1 }]
          }
        },
        {
          type: 'scatter',
          data: risk,
          symbolSize: 12,
          itemStyle: { color: red, opacity: 0.95 }
        }
      ]
    }
  })
</script>

<template>
  <n-spin :show="store.dashboardLoading">
    <div class="sc-grid2">
      <Card :title="$t('salaryControl.vids.scatter')" :sub="$t('salaryControl.vids.scatterSub')">
        <EChart :option="scatterOption" height="340px" />
        <div class="sc-legend">
          <span><i class="sw" :style="{ background: 'var(--fig-icon-brand)' }"></i>Me'yorda</span>
          <span><i class="sw" :style="{ background: 'var(--fig-icon-red)' }"></i>Tekshirilishi kerak</span>
          <span><i class="sw sw--line" :style="{ background: 'var(--fig-text-tertiary)' }"></i>Mutanosib (100%)</span>
        </div>
      </Card>
      <Card :title="$t('salaryControl.vids.title')" :sub="$t('salaryControl.vids.sub')">
        <EChart :option="vidOption" height="340px" />
      </Card>
    </div>

    <Card :title="$t('salaryControl.vids.strip')" :sub="$t('salaryControl.vids.stripSub')">
      <EChart :option="stripOption" height="360px" />
      <div class="sc-legend">
        <span><i class="sw" :style="{ background: 'var(--fig-icon-brand)' }"></i>Me'yorda</span>
        <span><i class="sw" :style="{ background: 'var(--fig-icon-red)' }"></i>Tekshirilishi kerak</span>
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
  .sw--line {
    width: 16px;
    height: 0;
    border-radius: 0;
    border-top: 2px dashed var(--fig-text-tertiary);
    background: none !important;
  }
</style>
