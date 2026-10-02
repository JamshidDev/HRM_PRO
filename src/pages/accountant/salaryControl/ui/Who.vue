<script setup>
  // «Kimga ko'p to'lanyapti» bo'limi — top hisoblangan/YTD, keskin o'sish, oklad↔jami
  // scatter, taqsimot histogrammasi va lavozim guruhlari oralig'i.
  // Manba: store.people, store.findings. Maket: oylik_nazorat_dashboard_5.html (267–360).
  import { computed } from 'vue'
  import i18n from '@/i18n/index.js'
  import { useSalaryControlStore, useAppStore } from '@/store/modules/index.js'
  import { money, mln, positionGroup, chartTheme, tokenColor } from '../helpers.js'
  import Card from './Card.vue'
  import EChart from './EChart.vue'

  const { t } = i18n.global
  const store = useSalaryControlStore()
  const appStore = useAppStore()

  // ⚠ belgisi — findings'da uchraydigan xodimlar.
  const flagged = computed(() => new Set(store.findings.map((f) => f.fio)))

  // FIO'ni y-o'q uchun qisqartirish (dastlabki 2 so'z).
  const shortFio = (fio) => (fio || '').split(' ').slice(0, 2).join(' ')

  // Gorizontal bar uchun umumiy yAxisLabel formatteri (⚠ + qisqa FIO).
  const yLabel = (fio) => (flagged.value.has(fio) ? '⚠ ' : '') + shortFio(fio)

  // —— 1) Eng ko'p hisoblangan (tot, top 15) ————————————————————————————
  const topOption = computed(() => {
    appStore.isDark
    const th = chartTheme()
    const rows = [...store.people].sort((a, b) => (b.tot || 0) - (a.tot || 0)).slice(0, 15)
    return {
      grid: { top: 8, left: 4, right: 46, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (p) => {
          const r = rows[p[0].dataIndex]
          return `<b>${r.fio || '—'}</b><br>${r.lav || '—'}<br>${money(r.tot)}`
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
        data: rows.map((r) => r.fio),
        axisLabel: {
          color: th.textStrong,
          width: 150,
          overflow: 'truncate',
          fontSize: 11,
          formatter: (v) => yLabel(v)
        },
        axisLine: { lineStyle: { color: th.line } }
      },
      series: [
        {
          type: 'bar',
          data: rows.map((r) => ({
            value: mln(r.tot),
            itemStyle: {
              color: tokenColor(flagged.value.has(r.fio) ? '--fig-icon-red' : '--fig-icon-brand')
            }
          })),
          barMaxWidth: 16,
          label: { show: true, position: 'right', color: th.text, fontSize: 10, formatter: (p) => p.value.toFixed(1) }
        }
      ]
    }
  })

  // —— 2) Yil boshidan (ytd, top 15) ————————————————————————————————————
  const ytdOption = computed(() => {
    appStore.isDark
    const th = chartTheme()
    const rows = [...store.people].sort((a, b) => (b.ytd || 0) - (a.ytd || 0)).slice(0, 15)
    return {
      grid: { top: 8, left: 4, right: 46, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (p) => {
          const r = rows[p[0].dataIndex]
          return `<b>${r.fio || '—'}</b><br>${r.lav || '—'}<br>${money(r.ytd)}`
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
        data: rows.map((r) => r.fio),
        axisLabel: {
          color: th.textStrong,
          width: 150,
          overflow: 'truncate',
          fontSize: 11,
          formatter: (v) => yLabel(v)
        },
        axisLine: { lineStyle: { color: th.line } }
      },
      series: [
        {
          type: 'bar',
          data: rows.map((r) => ({
            value: mln(r.ytd),
            itemStyle: {
              color: tokenColor(flagged.value.has(r.fio) ? '--fig-icon-red' : '--fig-icon-brand')
            }
          })),
          barMaxWidth: 16,
          label: { show: true, position: 'right', color: th.text, fontSize: 10, formatter: (p) => p.value.toFixed(1) }
        }
      ]
    }
  })

  // —— 3) Keskin o'sish: oy vs yillik o'rtacha (ratio = tot/(ytd/8)) ————————
  const spikeOption = computed(() => {
    appStore.isDark
    const th = chartTheme()
    const rows = store.people
      .filter((p) => (p.ytd || 0) > 0 && (p.tot || 0) > 0)
      .map((p) => ({ ...p, avg: p.ytd / 8, r: p.tot / (p.ytd / 8) }))
      .filter((p) => p.r < 7.5)
      .sort((a, b) => b.r - a.r)
      .slice(0, 15)
    return {
      grid: { top: 8, left: 4, right: 46, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (p) => {
          const r = rows[p[0].dataIndex]
          return `<b>${r.fio || '—'}</b><br>${r.lav || '—'}<br>${t('salaryControl.who.topAccrued')}: ${money(
            r.tot
          )}<br>${money(r.avg)}<br>${r.r.toFixed(2)}×`
        }
      },
      xAxis: {
        type: 'value',
        axisLabel: { color: th.text, formatter: (v) => v + '×' },
        splitLine: { lineStyle: { color: th.line } }
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: rows.map((r) => r.fio),
        axisLabel: {
          color: th.textStrong,
          width: 150,
          overflow: 'truncate',
          fontSize: 11,
          formatter: (v) => yLabel(v)
        },
        axisLine: { lineStyle: { color: th.line } }
      },
      series: [
        {
          type: 'bar',
          data: rows.map((r) => ({
            value: +r.r.toFixed(1),
            itemStyle: {
              color: tokenColor(flagged.value.has(r.fio) ? '--fig-icon-red' : '--fig-icon-brand')
            }
          })),
          barMaxWidth: 16,
          label: { show: true, position: 'right', color: th.text, fontSize: 10, formatter: (p) => p.value.toFixed(1) + '×' }
        }
      ]
    }
  })

  // —— 4) Oklad ↔ jami hisoblangan scatter (+ 1×/2×/3× chiziqlar) ————————
  const okxOption = computed(() => {
    appStore.isDark
    const th = chartTheme()
    const pts = store.people.filter((p) => (p.ok || 0) > 0 && (p.tot || 0) > 0)
    const norm = []
    const susp = []
    for (const p of pts) {
      const pt = { value: [mln(p.ok), mln(p.tot)], p }
      if (p.tot > 2 * p.ok) susp.push(pt)
      else norm.push(pt)
    }
    // Referens diagonal chiziqlar: tot = k×ok (ok 0..12 mln).
    const xMax = 12
    const line = (k) => [
      [0, 0],
      [xMax, xMax * k]
    ]
    const tip = (o) => {
      const p = o.data.p
      return `<b>${p.fio || '—'}</b><br>${p.lav || '—'}<br>Oklad: ${money(
        p.ok
      )}<br>${t('salaryControl.common.total')}: ${money(p.tot)} (${(p.tot / p.ok).toFixed(2)}×)`
    }
    return {
      grid: { top: 12, left: 4, right: 16, bottom: 28, containLabel: true },
      legend: {
        show: true,
        bottom: 0,
        textStyle: { color: th.text },
        data: ["Me'yorda", 'Tekshirilishi kerak']
      },
      tooltip: {
        trigger: 'item',
        formatter: (o) => (o.data && o.data.p ? tip(o) : '')
      },
      xAxis: {
        type: 'value',
        name: t('salaryControl.common.sumMln'),
        nameLocation: 'middle',
        nameGap: 26,
        nameTextStyle: { color: th.text, fontSize: 11 },
        min: 0,
        axisLabel: { color: th.text },
        splitLine: { lineStyle: { color: th.line } }
      },
      yAxis: {
        type: 'value',
        min: 0,
        axisLabel: { color: th.text },
        splitLine: { lineStyle: { color: th.line } }
      },
      series: [
        {
          name: "Me'yorda",
          type: 'scatter',
          data: norm,
          symbolSize: 8,
          itemStyle: { color: tokenColor('--fig-icon-brand'), opacity: 0.8 },
          markLine: {
            silent: true,
            symbol: 'none',
            label: {
              formatter: (o) => o.data.k + '×',
              color: th.text,
              fontSize: 10
            },
            lineStyle: { type: 'dashed', color: th.line },
            data: [
              { k: 1, coords: line(1) },
              { k: 2, coords: line(2), lineStyle: { color: th.text } },
              { k: 3, coords: line(3) }
            ]
          }
        },
        {
          name: 'Tekshirilishi kerak',
          type: 'scatter',
          data: susp,
          symbolSize: 10,
          itemStyle: { color: tokenColor('--fig-icon-red') }
        }
      ]
    }
  })

  // —— 5) Taqsimot histogrammasi (2 mln so'mlik intervallar) ——————————————
  const histOption = computed(() => {
    appStore.isDark
    const th = chartTheme()
    const v = store.people.filter((p) => (p.tot || 0) > 0)
    const bw = 2e6
    const nb = 14
    const buckets = Array(nb).fill(0)
    for (const p of v) buckets[Math.min(nb - 1, Math.floor(p.tot / bw))]++
    const labels = buckets.map((_, i) => (i === nb - 1 ? i * 2 + '+' : String(i * 2)))
    return {
      grid: { top: 16, left: 4, right: 10, bottom: 24, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (p) => {
          const i = p[0].dataIndex
          const lo = i * 2
          const hi = i === nb - 1 ? '28+' : lo + 2
          return `<b>${lo}–${hi} mln</b>: ${p[0].value} ${t('salaryControl.common.employee')}`
        }
      },
      xAxis: {
        type: 'category',
        data: labels,
        name: t('salaryControl.common.sumMln'),
        nameLocation: 'middle',
        nameGap: 24,
        nameTextStyle: { color: th.text, fontSize: 11 },
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
          data: buckets,
          itemStyle: { color: tokenColor('--fig-icon-brand'), borderRadius: [4, 4, 0, 0] },
          barMaxWidth: 26,
          label: { show: true, position: 'top', color: th.text, fontSize: 10 }
        }
      ]
    }
  })

  // —— 6) Lavozim guruhlari — o'rtacha (min–max tooltip) ————————————————
  const grpOption = computed(() => {
    appStore.isDark
    const th = chartTheme()
    const groups = {}
    for (const p of store.people) {
      if ((p.tot || 0) <= 0) continue
      const g = positionGroup(p.lav)
      ;(groups[g] = groups[g] || []).push(p.tot)
    }
    const rows = Object.entries(groups)
      .map(([g, arr]) => ({
        g,
        n: arr.length,
        mn: Math.min(...arr),
        mx: Math.max(...arr),
        av: arr.reduce((a, x) => a + x, 0) / arr.length
      }))
      .sort((a, b) => b.av - a.av)
    return {
      grid: { top: 8, left: 4, right: 46, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (p) => {
          const r = rows[p[0].dataIndex]
          return `<b>${r.g}</b> — ${r.n} ${t('salaryControl.common.employee')}<br>Min: ${money(
            r.mn
          )}<br>${t('salaryControl.common.total')}: ${money(r.av)}<br>Max: ${money(r.mx)}`
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
        data: rows.map((r) => `${r.g} (${r.n})`),
        axisLabel: { color: th.textStrong, width: 150, overflow: 'truncate', fontSize: 11 },
        axisLine: { lineStyle: { color: th.line } }
      },
      series: [
        {
          type: 'bar',
          data: rows.map((r) => mln(r.av)),
          itemStyle: { color: tokenColor('--fig-icon-brand') },
          barMaxWidth: 18,
          label: { show: true, position: 'right', color: th.text, fontSize: 10, formatter: (p) => p.value.toFixed(1) }
        }
      ]
    }
  })
</script>

<template>
  <n-spin :show="store.dashboardLoading">
    <div class="sc-grid2">
      <Card :title="$t('salaryControl.who.topAccrued')" :sub="$t('salaryControl.who.topAccruedSub')">
        <EChart :option="topOption" height="340px" />
      </Card>
      <Card :title="$t('salaryControl.who.ytd')" :sub="$t('salaryControl.who.ytdSub')">
        <EChart :option="ytdOption" height="340px" />
      </Card>
    </div>

    <div class="sc-grid2">
      <Card :title="$t('salaryControl.who.spike')" :sub="$t('salaryControl.who.spikeSub')">
        <EChart :option="spikeOption" height="340px" />
      </Card>
      <Card :title="$t('salaryControl.who.okx')" :sub="$t('salaryControl.who.okxSub')">
        <EChart :option="okxOption" height="340px" />
      </Card>
    </div>

    <div class="sc-grid2">
      <Card :title="$t('salaryControl.who.hist')" :sub="$t('salaryControl.who.histSub')">
        <EChart :option="histOption" height="340px" />
      </Card>
      <Card :title="$t('salaryControl.who.grp')" :sub="$t('salaryControl.who.grpSub')">
        <EChart :option="grpOption" height="340px" />
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
</style>
