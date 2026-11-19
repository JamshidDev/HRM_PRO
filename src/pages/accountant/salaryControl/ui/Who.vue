<script setup>
  // «Kimga ko'p to'lanyapti» bo'limi — top hisoblangan/YTD, keskin o'sish, oklad↔jami
  // scatter, taqsimot histogrammasi va lavozim guruhlari oralig'i.
  // Manba: store.people, store.findings. Maket: oylik_nazorat_dashboard_5.html (267–360).
  import { computed } from 'vue'
  import i18n from '@/i18n/index.js'
  import { useSalaryControlStore, useAppStore } from '@/store/modules/index.js'
  import { money, mln, positionGroup, chartTheme, tokenColor, normText } from '../helpers.js'
  import { elapsedMonths } from '../engine.js'
  import { CHART } from '../explain.js'
  import Card from './Card.vue'
  import EChart from './EChart.vue'
  import ScSkeleton from './ScSkeleton.vue'
  import EmptyState from './EmptyState.vue'

  const { t } = i18n.global
  const store = useSalaryControlStore()
  const appStore = useAppStore()

  // DAS-16735: davrga bog'liq izoh (i) matnlari — CHART.*.sub funksiyalarini tanlangan
  // davr bilan yechamiz (qotirilgan «avgust»/«yanvar–avgust» o'rniga).
  const subInfo = (chart) => {
    const s = chart?.sub
    return typeof s === 'function' ? s(store.params.year, store.params.month) : s
  }
  const topInfo = computed(() => subInfo(CHART.top))
  const ytdInfo = computed(() => subInfo(CHART.ytd))
  const spikeInfo = computed(() => subInfo(CHART.spike))
  const histInfo = computed(() => subInfo(CHART.hist))
  const grpInfo = computed(() => subInfo(CHART.grp))

  // ⚠ belgisi — findings'da (14 tekshiruv) uchraydigan xodimlar.
  const flagged = computed(() => new Set(store.scFindings.map((f) => f.fio)))

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
          if (!p || !p.length) return ''
          const r = rows[p[0].dataIndex]
          return `<b>${normText(r.fio) || '—'}</b><br>${r.lav || '—'}<br>${money(r.tot)}`
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
        data: rows.map((r) => normText(r.fio)),
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
          if (!p || !p.length) return ''
          const r = rows[p[0].dataIndex]
          return `<b>${normText(r.fio) || '—'}</b><br>${r.lav || '—'}<br>${money(r.ytd)}`
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
        data: rows.map((r) => normText(r.fio)),
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
    const elapsed = elapsedMonths(store.params.month)
    const rows = store.people
      .filter((p) => (p.ytd || 0) > 0 && (p.tot || 0) > 0)
      .map((p) => ({ ...p, avg: p.ytd / elapsed, r: p.tot / (p.ytd / elapsed) }))
      .filter((p) => p.r < 7.5)
      .sort((a, b) => b.r - a.r)
      .slice(0, 15)
    return {
      grid: { top: 8, left: 4, right: 46, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (p) => {
          if (!p || !p.length) return ''
          const r = rows[p[0].dataIndex]
          return `<b>${normText(r.fio) || '—'}</b><br>${r.lav || '—'}<br>${t('salaryControl.who.topAccrued')}: ${money(
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
        data: rows.map((r) => normText(r.fio)),
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
      return `<b>${normText(p.fio) || '—'}</b><br>${p.lav || '—'}<br>Oklad: ${money(
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
        // DAS-16735: X o'qi — oklad (mln), ilgari noto'g'ri "Summa, mln" deb nomlangan edi.
        name: `${t('salaryControl.employees.oklad')}, mln`,
        nameLocation: 'middle',
        nameGap: 26,
        nameTextStyle: { color: th.text, fontSize: 11 },
        min: 0,
        axisLabel: { color: th.text },
        splitLine: { lineStyle: { color: th.line } }
      },
      yAxis: {
        type: 'value',
        // DAS-16735: Y o'q nomi — "jami hisoblangan" (mln). X nomi ("Oklad") pastda.
        name: `${t('salaryControl.common.total')}, mln`,
        nameLocation: 'end',
        nameGap: 12,
        nameTextStyle: { color: th.text, fontSize: 11, align: 'left' },
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

  // Scatter bo'sh bo'lsa (oklad hamma xodimda 0 — 1C oklad bermagan) — o'qlar
  // o'rniga tushunarli «Ma'lumot yo'q» holatini ko'rsatamiz.
  const okxEmpty = computed(
    () => store.people.filter((p) => (p.ok || 0) > 0 && (p.tot || 0) > 0).length === 0
  )

  // —— 5) Taqsimot histogrammasi (2 mln so'mlik intervallar) ——————————————
  // DAS-16735: ma'lumot tayyor bo'lgandagina chiziladi — aks holda bo'sh/placeholder
  // ma'lumotda Y o'qi noto'g'ri (masalan 2100 gacha) auto-scale bo'lardi.
  const histPeople = computed(() => store.people.filter((p) => (p.tot || 0) > 0))
  const histReady = computed(() => histPeople.value.length > 0)
  const histOption = computed(() => {
    appStore.isDark
    const th = chartTheme()
    const v = histPeople.value
    const bw = 2e6
    const nb = 14
    const buckets = Array(nb).fill(0)
    for (const p of v) buckets[Math.min(nb - 1, Math.floor(p.tot / bw))]++
    const labels = buckets.map((_, i) => (i === nb - 1 ? i * 2 + '+' : String(i * 2)))
    return {
      grid: { top: 36, left: 4, right: 10, bottom: 24, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (p) => {
          if (!p || !p.length) return ''
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

  // —— 6) Lavozim guruhlari — min–max oraliq + o'rtacha (DAS-16735) ————————
  // Ilgari faqat o'rtacha ustun chizilardi. Endi har guruh uchun eng kam–eng ko'p
  // oraliq (gorizontal chiziq) + o'rtacha nuqta — custom renderItem bilan.
  const grpRows = computed(() => {
    const groups = {}
    for (const p of store.people) {
      if ((p.tot || 0) <= 0) continue
      const g = positionGroup(p.lav)
      ;(groups[g] = groups[g] || []).push(p.tot)
    }
    return Object.entries(groups)
      .map(([g, arr]) => ({
        g,
        n: arr.length,
        mn: Math.min(...arr),
        mx: Math.max(...arr),
        av: arr.reduce((a, x) => a + x, 0) / arr.length
      }))
      .sort((a, b) => b.av - a.av)
  })
  const grpOption = computed(() => {
    appStore.isDark
    const th = chartTheme()
    const brand = tokenColor('--fig-icon-brand')
    const rows = grpRows.value
    // Custom seriya: har qator [yIndex, min(mln), max(mln), avg(mln)] — chiziq + nuqta.
    const data = rows.map((r, i) => [i, mln(r.mn), mln(r.mx), mln(r.av)])
    const renderItem = (params, api) => {
      const yIndex = api.value(0)
      const mnPt = api.coord([api.value(1), yIndex])
      const mxPt = api.coord([api.value(2), yIndex])
      const avPt = api.coord([api.value(3), yIndex])
      const h = 5 // oraliq chiziq qalinligi
      return {
        type: 'group',
        children: [
          // min–max oraliq (yarim shaffof tasma)
          {
            type: 'rect',
            shape: { x: mnPt[0], y: mnPt[1] - h / 2, width: Math.max(1, mxPt[0] - mnPt[0]), height: h },
            style: { fill: brand, opacity: 0.25 }
          },
          // min va max uchlari (kichik vertikal chiziqlar)
          { type: 'line', shape: { x1: mnPt[0], y1: mnPt[1] - 7, x2: mnPt[0], y2: mnPt[1] + 7 }, style: { stroke: brand, lineWidth: 1.5 } },
          { type: 'line', shape: { x1: mxPt[0], y1: mxPt[1] - 7, x2: mxPt[0], y2: mxPt[1] + 7 }, style: { stroke: brand, lineWidth: 1.5 } },
          // o'rtacha nuqta
          { type: 'circle', shape: { cx: avPt[0], cy: avPt[1], r: 5 }, style: { fill: brand } }
        ]
      }
    }
    return {
      grid: { top: 8, left: 4, right: 20, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (p) => {
          const idx = Array.isArray(p) ? p[0]?.dataIndex : p?.dataIndex
          const r = rows[idx]
          if (!r) return ''
          return `<b>${r.g}</b> — ${r.n} ${t('salaryControl.common.employee')}<br>Min: ${money(
            r.mn
          )}<br>${t('salaryControl.common.total')}: ${money(r.av)}<br>Max: ${money(r.mx)}`
        }
      },
      xAxis: {
        type: 'value',
        min: 0,
        name: 'mln',
        nameTextStyle: { color: th.text, fontSize: 11 },
        axisLabel: { color: th.text, formatter: (v) => v.toFixed(0) },
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
          type: 'custom',
          renderItem,
          encode: { x: [1, 2, 3], y: 0 },
          data
        }
      ]
    }
  })
</script>

<template>
  <div class="flex flex-col gap-4">
    <template v-if="store.dashboardLoading">
      <ScSkeleton variant="chart2" chart-height="340px" />
      <ScSkeleton variant="chart2" chart-height="340px" />
      <ScSkeleton variant="chart2" chart-height="340px" />
    </template>

    <template v-else>
      <div class="sc-grid2">
        <Card :title="$t('salaryControl.who.topAccrued')" :sub="$t('salaryControl.who.topAccruedSub')" :info="topInfo">
          <EChart :option="topOption" height="340px" />
        </Card>
        <Card :title="$t('salaryControl.who.ytd')" :sub="$t('salaryControl.who.ytdSub')" :info="ytdInfo">
          <EChart :option="ytdOption" height="340px" />
        </Card>
      </div>

      <div class="sc-grid2">
        <Card :title="$t('salaryControl.who.spike')" :sub="$t('salaryControl.who.spikeSub')" :info="spikeInfo">
          <EChart :option="spikeOption" height="340px" />
        </Card>
        <Card :title="$t('salaryControl.who.okx')" :sub="$t('salaryControl.who.okxSub')" :info="CHART.okx.sub">
          <EmptyState v-if="okxEmpty" :text="$t('salaryControl.common.empty')" />
          <EChart v-else :option="okxOption" height="340px" />
        </Card>
      </div>

      <div class="sc-grid2">
        <Card :title="$t('salaryControl.who.hist')" :sub="$t('salaryControl.who.histSub')" :info="histInfo">
          <EmptyState v-if="!histReady" :text="$t('salaryControl.common.empty')" />
          <EChart v-else :option="histOption" height="340px" />
        </Card>
        <Card :title="$t('salaryControl.who.grp')" :sub="$t('salaryControl.who.grpSub')" :info="grpInfo">
          <EChart :option="grpOption" height="340px" />
        </Card>
      </div>
    </template>
  </div>
</template>

<style scoped>
  .sc-grid2 {
    display: grid;
    /* DAS-16735: kontentga qarab stack (MacBook kabi tor kontent xavfsiz). */
    grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
    gap: 16px;
  }
</style>
