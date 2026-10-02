<script setup>
  // «Ushlanmalar» tab — hisoblangandan kartagacha oqim (waterfall) +
  // soliqdan tashqari ushlanmalar ulushi eng yuqori 15 xodim (horizontal bar).
  // Manba: store.dashKpi + store.emps. Maket: oylik_nazorat_dashboard_5.html (wf/dsh).
  import { computed } from 'vue'
  import i18n from '@/i18n/index.js'
  import { useSalaryControlStore, useAppStore } from '@/store/modules/index.js'
  import { money, mln, chartTheme, tokenColor } from '../helpers.js'
  import Card from './Card.vue'
  import EChart from './EChart.vue'

  const { t } = i18n.global
  const store = useSalaryControlStore()
  const appStore = useAppStore()

  // Soliqdan tashqari ushlanma (bitta xodim) — ded qiymatlari yig'indisi
  // (ded'da daromad solig'i yo'q).
  const nonTaxDed = (e) => Object.values(e.ded || {}).reduce((a, b) => a + (Number(b) || 0), 0)

  // —— Grafik 1: Hisoblangandan kartagacha (waterfall) ——————————————————
  const wfOption = computed(() => {
    appStore.isDark
    const th = chartTheme()
    const tot = Number(store.dashKpi.tot) || 0
    const card = Number(store.dashKpi.card) || 0
    const drop = Math.max(0, tot - card)

    const cats = [
      t('salaryControl.deductions.accrued'),
      t('salaryControl.deductions.deductions'),
      t('salaryControl.deductions.card')
    ]
    // Transparent asos (waterfall ko'rinishi) + ko'rinadigan segment (mln).
    const base = [0, mln(card), 0]
    const val = [mln(tot), mln(drop), mln(card)]
    const raw = [tot, drop, card]
    const colors = [
      tokenColor('--fig-icon-brand'),
      tokenColor('--fig-icon-red'),
      tokenColor('--fig-icon-green')
    ]

    return {
      grid: { top: 8, left: 4, right: 16, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (ps) => {
          const p = ps.find((x) => x.seriesName === 'val') || ps[0]
          const i = p.dataIndex
          const pct = tot ? ((raw[i] / tot) * 100).toFixed(1) : '0.0'
          return `<b>${cats[i]}</b><br/>${money(raw[i])} so‘m (${pct}%)`
        }
      },
      xAxis: {
        type: 'category',
        data: cats,
        axisLabel: { color: th.textStrong, fontSize: 11 },
        axisLine: { lineStyle: { color: th.line } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: th.text, formatter: (v) => v.toFixed(0) },
        splitLine: { lineStyle: { color: th.line } }
      },
      series: [
        {
          name: 'base',
          type: 'bar',
          stack: 'wf',
          data: base,
          itemStyle: { color: 'transparent' },
          emphasis: { itemStyle: { color: 'transparent' } },
          tooltip: { show: false },
          silent: true,
          barMaxWidth: 60
        },
        {
          name: 'val',
          type: 'bar',
          stack: 'wf',
          data: val.map((v, i) => ({ value: v, itemStyle: { color: colors[i], borderRadius: [4, 4, 0, 0] } })),
          barMaxWidth: 60,
          label: {
            show: true,
            position: 'top',
            color: th.textStrong,
            fontSize: 11,
            formatter: (p) => p.value.toLocaleString('ru-RU', { maximumFractionDigits: 1 })
          }
        }
      ]
    }
  })

  // —— Grafik 2: Ushlanmalar ulushi — eng yuqori 15 xodim ————————————————
  const NM = {
    889: 'Aliment',
    901: 'Ijro hujjati',
    897: 'Omonat',
    899: 'Kredit',
    875: 'Ortiqcha moddiy yordam'
  }

  const dshOption = computed(() => {
    appStore.isDark
    const th = chartTheme()
    const list = (store.emps || [])
      .map((e) => {
        const o = nonTaxDed(e)
        const tot = Number(e.tot) || 0
        return { fio: e.fio || '—', o, tot, ded: e.ded || {}, r: tot ? o / tot : 0 }
      })
      .filter((e) => e.o > 0)
      .sort((a, b) => b.r - a.r)
      .slice(0, 15)

    return {
      grid: { top: 8, left: 4, right: 40, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (ps) => {
          const p = ps[0]
          const it = list[p.dataIndex]
          const rows = Object.entries(it.ded)
            .map(([k, v]) => `${NM[k] || k}: ${money(v)}`)
            .join('<br/>')
          const pct = it.r < 0.01 ? (it.r * 100).toFixed(1) : Math.round(it.r * 100)
          return `<b>${it.fio}</b><br/>${t('salaryControl.deductions.share')}: ${pct}%<br/>${rows}<br/>${t('salaryControl.deductions.accrued')}: ${money(it.tot)}`
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
        inverse: true,
        data: list.map((r) => r.fio),
        axisLabel: { color: th.textStrong, width: 150, overflow: 'truncate', fontSize: 11 },
        axisLine: { lineStyle: { color: th.line } }
      },
      series: [
        {
          type: 'bar',
          data: list.map((r) => +(r.r * 100).toFixed(1)),
          itemStyle: { color: tokenColor('--fig-icon-amber'), borderRadius: [0, 4, 4, 0] },
          barMaxWidth: 18,
          label: {
            show: true,
            position: 'right',
            color: th.text,
            fontSize: 11,
            formatter: (p) => p.value + '%'
          }
        }
      ]
    }
  })
</script>

<template>
  <n-spin :show="store.dashboardLoading">
    <div class="sc-grid2">
      <Card :title="$t('salaryControl.deductions.wf')" :sub="$t('salaryControl.deductions.wfSub')">
        <EChart :option="wfOption" height="320px" />
        <div class="sc-legend">
          <span><i class="sw" :style="{ background: 'var(--fig-icon-brand)' }"></i>{{ $t('salaryControl.deductions.accrued') }}</span>
          <span><i class="sw" :style="{ background: 'var(--fig-icon-red)' }"></i>{{ $t('salaryControl.deductions.deductions') }}</span>
          <span><i class="sw" :style="{ background: 'var(--fig-icon-green)' }"></i>{{ $t('salaryControl.deductions.card') }}</span>
        </div>
      </Card>
      <Card :title="$t('salaryControl.deductions.share')" :sub="$t('salaryControl.deductions.shareSub')">
        <EChart :option="dshOption" height="320px" />
      </Card>
    </div>
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
</style>
