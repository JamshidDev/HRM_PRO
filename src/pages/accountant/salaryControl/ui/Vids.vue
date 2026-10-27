<script setup>
  // «To'lov turlari (vidlar)» tab — vidlar tarkibi (horizontal bar), mukofot/
  // ishlangan vaqt (scatter) va mukofot foizi strip-plot (lavozim guruhlari).
  // Manba: store.vids + store.emps + store.findings. Maketning echarts ko'chirmasi.
  import { computed, ref, h, onMounted } from 'vue'
  import i18n from '@/i18n/index.js'
  import { useSalaryControlStore, useAppStore } from '@/store/modules/index.js'
  import {
    money,
    formatMoney,
    positionGroup,
    chartTheme,
    tokenColor,
    normText
  } from '../helpers.js'
  import {
    vidShortName,
    vidCategory,
    VID_CATEGORIES,
    VID_CAT_TOKEN
  } from '../vid-meta.js'
  import Card from './Card.vue'
  import EChart from './EChart.vue'
  import ScSkeleton from './ScSkeleton.vue'
  import EmptyState from './EmptyState.vue'

  const { t } = i18n.global
  const store = useSalaryControlStore()
  const appStore = useAppStore()

  const flagged = computed(() => new Set(store.findings.map((f) => f.fio)))

  // —— KPI qatori ——————————————————————————————————————————————————————————
  // «Tekshirilishi kerak» — mukofot anomaliyasi bo'lgan xodimlar (scatter/strip qizil
  // qoidasi): 011/ok > 004/ok, YOKI findings'da bor va 011/004 > 1.05.
  const flaggedBonusCount = computed(() => {
    const set = new Set()
    for (const e of store.emps) {
      const ok = e.ok || 0
      const v4 = e.v?.['004'] || 0
      const v11 = e.v?.['011'] || 0
      const scatterBad = ok > 0 && v11 / ok > v4 / ok
      const stripBad = flagged.value.has(e.fio) && v4 > 0 && v11 / v4 > 1.05
      if (scatterBad || stripBad) set.add(e.j || e.fio)
    }
    return set.size
  })
  const kpis = computed(() => {
    const totalSum = store.vids.reduce((a, v) => a + (v.s || 0), 0)
    // O'tgan oyga nisbatan Δ% — faqat o'tgan oy jami summasi (prev_total_sum) bo'lsa.
    const prev = store.dashKpi?.prev_total_sum || 0
    const delta = prev > 0 ? ((totalSum - prev) / prev) * 100 : null
    const cards = [
      { key: 'sum', label: t('salaryControl.vids.kpiSum'), value: formatMoney(totalSum, { unit: 'mln' }), tint: 'blue' },
      { key: 'count', label: t('salaryControl.vids.kpiCount'), value: String(store.vids.length), tint: 'indigo' },
      { key: 'recip', label: t('salaryControl.vids.kpiRecipients'), value: store.emps.length.toLocaleString('ru-RU'), tint: 'green' },
      { key: 'flag', label: t('salaryControl.vids.kpiFlagged'), value: flaggedBonusCount.value.toLocaleString('ru-RU'), tint: 'red' }
    ]
    if (delta != null) {
      cards.push({
        key: 'delta',
        label: t('salaryControl.vids.kpiDelta'),
        value: `${delta >= 0 ? '+' : ''}${delta.toFixed(0)}%`,
        tint: delta >= 0 ? 'green' : 'red'
      })
    }
    return cards
  })

  // —— Faol filtr chiplari (o'chiriladigan) ————————————————————————————————————
  const periodChip = computed(() => {
    const { year, month } = store.params
    return year && month ? `${year} · ${String(month).padStart(2, '0')}` : ''
  })
  const orgChips = computed(() => store.params.organizations || [])
  const removeOrg = (id) => {
    store.params.organizations = (store.params.organizations || []).filter((o) => o.id !== id)
    store.structureCheck2 = (store.structureCheck2 || []).filter((v) => v !== id)
    store._filter()
  }
  const removeCode = () => {
    store.params.ones_code = null
    store._filter()
  }

  // —— 1) Vidlar jadvali (bar o'rniga) — kod/nom/turkum/summa/ulush/oluvchilar ————
  const totalVidSum = computed(() => store.vids.reduce((a, v) => a + (v.s || 0), 0))
  const vidRows = computed(() => {
    const total = totalVidSum.value || 1
    return store.vids.map((v) => ({
      k: v.k,
      name: vidShortName(v.k, v.n),
      full: normText(v.n),
      cat: vidCategory(v.k, v.n),
      s: v.s || 0,
      sharePct: ((v.s || 0) / total) * 100,
      c: v.c || 0,
      avg: v.c ? (v.s || 0) / v.c : 0,
      // Δ% o'tgan oyga — faqat o'tgan oy summasi (sp) bo'lsa.
      delta: v.sp > 0 ? (((v.s || 0) - v.sp) / v.sp) * 100 : null
    }))
  })

  // Turkumlar bo'yicha bitta gorizontal stacked bar (jadval ustida).
  const catSegments = computed(() => {
    const total = totalVidSum.value || 1
    const map = new Map()
    for (const r of vidRows.value) map.set(r.cat, (map.get(r.cat) || 0) + r.s)
    return VID_CATEGORIES.filter((c) => map.get(c)).map((c) => ({
      cat: c,
      s: map.get(c),
      pct: (map.get(c) / total) * 100,
      color: `var(${VID_CAT_TOKEN[c] || '--fig-text-tertiary'})`
    }))
  })

  // Qidiruv (kod/nom) + saralash + Top-10 + «Boshqalar».
  const search = ref('')
  const showAll = ref(false)
  const sortedRows = computed(() => vidRows.value.slice().sort((a, b) => b.s - a.s))
  const filteredRows = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return sortedRows.value
    return sortedRows.value.filter(
      (r) =>
        r.k.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.full.toLowerCase().includes(q)
    )
  })
  const maxRowSum = computed(() => filteredRows.value.reduce((m, r) => Math.max(m, r.s), 0) || 1)
  const displayedRows = computed(() => {
    const rows = filteredRows.value
    if (showAll.value || search.value.trim() || rows.length <= 10) return rows
    const top = rows.slice(0, 10)
    const rest = rows.slice(10)
    if (!rest.length) return top
    const restSum = rest.reduce((a, r) => a + r.s, 0)
    const restC = rest.reduce((a, r) => a + r.c, 0)
    return [
      ...top,
      {
        k: '—',
        name: `${t('salaryControl.vids.others')} (${rest.length})`,
        full: '',
        cat: '',
        s: restSum,
        sharePct: (restSum / (totalVidSum.value || 1)) * 100,
        c: restC,
        avg: restC ? restSum / restC : 0,
        _isOther: true
      }
    ]
  })

  // Jadval ustunlari (n-data-table).
  const columns = computed(() => [
    { title: t('salaryControl.vids.colCode'), key: 'k', width: 68 },
    {
      title: t('salaryControl.vids.colName'),
      key: 'name',
      minWidth: 200,
      ellipsis: { tooltip: true },
      render: (r) => h('span', { title: r.full || r.name }, r.name)
    },
    {
      title: t('salaryControl.vids.colCat'),
      key: 'cat',
      width: 160,
      render: (r) =>
        r.cat
          ? h('span', { class: 'vid-cat-tag' }, [
              h('i', {
                class: 'vid-cat-dot',
                style: { background: `var(${VID_CAT_TOKEN[r.cat] || '--fig-text-tertiary'})` }
              }),
              r.cat
            ])
          : ''
    },
    {
      title: t('salaryControl.vids.colSum'),
      key: 's',
      align: 'right',
      width: 200,
      sorter: (a, b) => a.s - b.s,
      render: (r) =>
        h('div', { class: 'vid-sum-cell' }, [
          h('span', { class: 'vid-sum-val' }, formatMoney(r.s, { unit: 'mln' })),
          h('div', { class: 'vid-mini' }, [
            h('div', {
              class: 'vid-mini-fill',
              style: { width: `${Math.max(2, (r.s / maxRowSum.value) * 100)}%` }
            })
          ])
        ])
    },
    {
      title: t('salaryControl.vids.colShare'),
      key: 'sharePct',
      align: 'right',
      width: 92,
      sorter: (a, b) => a.sharePct - b.sharePct,
      render: (r) => `${r.sharePct.toFixed(1)}%`
    },
    {
      title: t('salaryControl.vids.colRecipients'),
      key: 'c',
      align: 'right',
      width: 118,
      sorter: (a, b) => a.c - b.c,
      render: (r) => (r.c || 0).toLocaleString('ru-RU')
    },
    {
      title: t('salaryControl.vids.colAvg'),
      key: 'avg',
      align: 'right',
      width: 150,
      sorter: (a, b) => a.avg - b.avg,
      render: (r) => formatMoney(r.avg, { unit: 'full' })
    },
    {
      title: t('salaryControl.vids.colDelta'),
      key: 'delta',
      align: 'right',
      width: 100,
      sorter: (a, b) => (a.delta ?? -Infinity) - (b.delta ?? -Infinity),
      render: (r) =>
        r.delta == null
          ? h('span', { style: { color: 'var(--fig-text-tertiary)' } }, '—')
          : h(
              'span',
              {
                style: {
                  color: r.delta >= 0 ? 'var(--fig-icon-green)' : 'var(--fig-icon-red)',
                  fontVariantNumeric: 'tabular-nums'
                }
              },
              `${r.delta >= 0 ? '+' : ''}${r.delta.toFixed(0)}%`
            )
    }
  ])
  const rowProps = (row) => ({
    style: row._isOther ? '' : 'cursor:pointer',
    onClick: () => openVid(row)
  })
  const tablePagination = { pageSize: 15, showSizePicker: true, pageSizes: [15, 30, 50] }

  // —— Drawer: shu vidni olgan xodimlar (click-to-detail) + CSV eksport ——————————
  const drawerOpen = ref(false)
  const drawerVid = ref(null)
  const openVid = (row) => {
    if (!row || row._isOther || row.k === '—') return
    drawerVid.value = row
    drawerOpen.value = true
  }
  const drawerRows = computed(() => {
    const v = drawerVid.value
    if (!v) return []
    return store.emps
      .filter((e) => (e.v?.[v.k] || 0) > 0)
      .map((e) => ({
        fio: normText(e.fio) || '—',
        lav: e.lav || '—',
        dep: e.dep || '—',
        amount: e.v[v.k]
      }))
      .sort((a, b) => b.amount - a.amount)
  })
  const drawerColumns = computed(() => [
    { title: '#', key: 'n', width: 54, render: (_r, i) => i + 1 },
    { title: t('salaryControl.risk.table.fio'), key: 'fio', minWidth: 200, ellipsis: { tooltip: true } },
    { title: t('salaryControl.risk.table.position'), key: 'lav', minWidth: 170, ellipsis: { tooltip: true } },
    { title: t('salaryControl.vids.colDep'), key: 'dep', minWidth: 150, ellipsis: { tooltip: true } },
    {
      title: t('salaryControl.common.sum'),
      key: 'amount',
      align: 'right',
      width: 150,
      render: (r) => formatMoney(r.amount, { unit: 'full' })
    }
  ])
  const exportCsv = () => {
    const v = drawerVid.value
    if (!v) return
    const header = ['#', 'F.I.Sh.', 'Lavozim', 'Bo‘lim', 'Summa']
    const body = drawerRows.value.map((r, i) => [i + 1, r.fio, r.lav, r.dep, Math.round(r.amount)])
    const csv =
      '﻿' +
      [header, ...body]
        .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
        .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vid-${v.k}-xodimlar.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // —— Mukofot / ishlangan vaqt: scatter (x=004/ok, y=011/ok) ————————————————————
  // «Tekshirilishi kerak» qoidasi: mukofot ulushi (011/oklad) ishlangan haq
  // ulushidan (004/oklad) yuqori — diagonal chiziq ustida (qizil).
  const XM = 1.2 // x o'q chegarasi (120%)
  const YM = 1.5 // y o'q chegarasi (150%) — tekis qadam 0/30/60/90/120/150
  const scatterRedCount = computed(() => {
    let n = 0
    for (const e of store.emps) {
      if (!(e.ok > 0 && (e.v?.['004'] || e.v?.['011']))) continue
      if ((e.v?.['011'] || 0) / e.ok > (e.v?.['004'] || 0) / e.ok) n++
    }
    return n
  })
  const scatterOption = computed(() => {
    appStore.isDark
    const th = chartTheme()
    const brand = tokenColor('--fig-icon-brand')
    const red = tokenColor('--fig-icon-red')
    const norm = []
    const risk = []
    for (const e of store.emps) {
      if (!(e.ok > 0 && (e.v?.['004'] || e.v?.['011']))) continue
      const wr = (e.v?.['004'] || 0) / e.ok
      const br = (e.v?.['011'] || 0) / e.ok
      const w = Math.min(Math.max(wr, 0), XM)
      const b = Math.min(Math.max(br, 0), YM)
      const clamped = wr > XM || br > YM // chegaradan oshgan — ▲ bilan
      const bad = br > wr
      const pt = {
        value: [w, b],
        raw: e,
        symbol: clamped ? 'triangle' : 'circle',
        symbolSize: bad ? 9 : 6
      }
      ;(bad ? risk : norm).push(pt)
    }
    const tip = (e) => {
      const wp = Math.round(((e.v?.['004'] || 0) / e.ok) * 100)
      const bp = Math.round(((e.v?.['011'] || 0) / e.ok) * 100)
      return (
        `<b>${normText(e.fio) || '—'}</b><br/>${normText(e.lav) || ''}<br/>` +
        `Oklad: ${money(e.ok)}<br/>004 (vaqtbay): ${money(e.v?.['004'] || 0)} (${wp}%)<br/>` +
        `011 (mukofot): ${money(e.v?.['011'] || 0)} (${bp}%)`
      )
    }
    return {
      grid: { top: 16, left: 8, right: 18, bottom: 36, containLabel: true },
      tooltip: { trigger: 'item', confine: true, formatter: (p) => tip(p.data.raw) },
      xAxis: {
        type: 'value',
        min: 0,
        max: XM,
        interval: 0.3,
        name: '004 / oklad',
        nameLocation: 'middle',
        nameGap: 28,
        nameTextStyle: { color: th.text, fontSize: 11 },
        axisLabel: { color: th.text, formatter: (v) => Math.round(v * 100) + '%' },
        splitLine: { lineStyle: { color: th.line } }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: YM,
        interval: 0.3,
        name: '011 / oklad',
        nameTextStyle: { color: th.text, fontSize: 11, align: 'left' },
        axisLabel: { color: th.text, formatter: (v) => Math.round(v * 100) + '%' },
        splitLine: { lineStyle: { color: th.line } }
      },
      series: [
        {
          type: 'scatter',
          data: norm,
          z: 1,
          itemStyle: { color: brand, opacity: 0.3 },
          markLine: {
            silent: true,
            symbol: 'none',
            label: {
              show: true,
              formatter: t('salaryControl.vids.proportional'),
              color: th.text,
              fontSize: 10,
              position: 'end'
            },
            lineStyle: { type: 'dashed', color: tokenColor('--fig-text-tertiary'), width: 1.5 },
            data: [[{ coord: [0, 0] }, { coord: [XM, XM] }]]
          }
        },
        { type: 'scatter', data: risk, z: 3, itemStyle: { color: red, opacity: 0.9 } }
      ]
    }
  })

  // —— Mukofot foizi strip-plot: x=011/004, y=lavozim guruhi (category) ——————————
  const median = (arr) => {
    if (!arr.length) return 0
    const s = arr.slice().sort((a, b) => a - b)
    const m = Math.floor(s.length / 2)
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
  }
  const stripData = computed(() =>
    store.emps
      .filter((e) => (e.v?.['011'] || 0) > 0 && (e.v?.['004'] || 0) > 0)
      .map((e) => ({ e, g: positionGroup(e.lav), r: (e.v['011'] || 0) / (e.v['004'] || 1) }))
  )
  const stripGroups = computed(() => [...new Set(stripData.value.map((p) => p.g))])
  // Guruh bo'yicha statistika (n, mediana %, qizil soni) — grafik ostida ko'rsatiladi.
  const stripStats = computed(() =>
    stripGroups.value.map((g) => {
      const items = stripData.value.filter((p) => p.g === g)
      const redN = items.filter((p) => flagged.value.has(p.e.fio) && p.r > 1.05).length
      return { g, n: items.length, med: Math.round(median(items.map((p) => p.r)) * 100), red: redN }
    })
  )
  const STRIP_XMAX = 6 // 600% cap
  const stripOption = computed(() => {
    appStore.isDark
    const th = chartTheme()
    const brand = tokenColor('--fig-icon-brand')
    const red = tokenColor('--fig-icon-red')
    const groups = stripGroups.value
    const norm = []
    const risk = []
    stripData.value.forEach((p, i) => {
      const gi = groups.indexOf(p.g)
      const jitter = (((i * 37) % 17) / 16 - 0.5) * 0.6
      const clamped = p.r > STRIP_XMAX
      const bad = flagged.value.has(p.e.fio) && p.r > 1.05
      const pt = {
        value: [Math.min(p.r, STRIP_XMAX), gi + jitter],
        raw: p,
        symbol: clamped ? 'triangle' : 'circle',
        symbolSize: bad ? 10 : 8
      }
      ;(bad ? risk : norm).push(pt)
    })
    const tip = (p) =>
      `<b>${normText(p.e.fio) || '—'}</b><br/>${normText(p.e.lav) || ''}<br/>` +
      `011/004: ${Math.round(p.r * 100)}%<br/>011: ${money(p.e.v['011'])} · 004: ${money(p.e.v['004'])}`
    return {
      grid: { top: 12, left: 8, right: 22, bottom: 30, containLabel: true },
      tooltip: { trigger: 'item', confine: true, formatter: (d) => tip(d.data.raw) },
      xAxis: {
        type: 'value',
        min: 0,
        max: STRIP_XMAX,
        axisLabel: { color: th.text, formatter: (v) => Math.round(v * 100) + '%' },
        splitLine: { lineStyle: { color: th.line } }
      },
      yAxis: {
        type: 'category',
        data: groups,
        axisLabel: { color: th.textStrong, fontSize: 11, width: 92, overflow: 'break', lineHeight: 13 },
        axisLine: { lineStyle: { color: th.line } },
        splitLine: { show: true, lineStyle: { color: th.line, type: 'dashed' } }
      },
      series: [
        {
          type: 'scatter',
          data: norm,
          z: 1,
          itemStyle: { color: brand, opacity: 0.45 },
          markLine: {
            silent: true,
            symbol: 'none',
            label: { show: true, formatter: '100%', color: th.text, fontSize: 10 },
            lineStyle: { type: 'dashed', color: tokenColor('--fig-text-tertiary'), width: 1.5 },
            data: [{ xAxis: 1 }]
          }
        },
        { type: 'scatter', data: risk, z: 3, itemStyle: { color: red, opacity: 0.95 } }
      ]
    }
  })

  // —— Nuqta → xodim Drawer (click-to-detail) ————————————————————————————————————
  const empOpen = ref(false)
  const empData = ref(null)
  const openEmp = (e) => {
    if (!e || e.fio === undefined) return
    empData.value = e
    empOpen.value = true
  }
  const onPointClick = (ev) => {
    const raw = ev?.data?.raw
    openEmp(raw?.e || raw)
  }
  const empDetail = computed(() => {
    const e = empData.value
    if (!e) return []
    const v4 = e.v?.['004'] || 0
    const v11 = e.v?.['011'] || 0
    const ok = e.ok || 0
    return [
      { label: t('salaryControl.risk.table.position'), value: normText(e.lav) || '—' },
      { label: t('salaryControl.vids.colDep'), value: normText(e.dep) || '—' },
      { label: t('salaryControl.employees.oklad'), value: money(ok) },
      { label: '004 (vaqtbay)', value: `${money(v4)} · ${ok ? Math.round((v4 / ok) * 100) : 0}%` },
      { label: '011 (mukofot)', value: `${money(v11)} · ${ok ? Math.round((v11 / ok) * 100) : 0}%` },
      { label: t('salaryControl.vids.bonusToWork'), value: v4 ? Math.round((v11 / v4) * 100) + '%' : '—' },
      { label: t('salaryControl.common.total'), value: money(e.tot || 0) }
    ]
  })

  // «Boshqa» guruhiga tushgan lavozimlar — mapping'ni to'ldirish uchun konsolga.
  onMounted(() => {
    const others = [
      ...new Set(
        store.emps
          .filter((e) => positionGroup(e.lav) === 'Boshqa' && (e.v?.['011'] || 0) > 0)
          .map((e) => e.lav)
      )
    ].filter(Boolean)
    if (others.length) {
      console.warn('[vids] "Boshqa" guruhidagi lavozimlar (mapping uchun):', others)
    }
  })
</script>

<template>
  <div class="flex flex-col gap-4">
    <template v-if="store.dashboardLoading">
      <ScSkeleton variant="chart2" chart-height="340px" />
      <ScSkeleton variant="chart" chart-height="360px" />
    </template>

    <EmptyState v-else-if="!store.vids.length" :text="$t('salaryControl.common.empty')" />

    <template v-else>
      <!-- KPI qatori -->
      <div class="vids-kpi">
        <div v-for="k in kpis" :key="k.key" class="vids-kpi-card">
          <span class="vids-kpi-dot" :class="`t-${k.tint}`"></span>
          <div class="vids-kpi-body">
            <p class="vids-kpi-label">{{ k.label }}</p>
            <p class="vids-kpi-value">{{ k.value }}</p>
          </div>
        </div>
      </div>

      <!-- Faol filtrlar (o'chiriladigan chip) -->
      <div v-if="periodChip || orgChips.length || store.params.ones_code" class="vids-chips">
        <span class="vids-chips-label">{{ $t('salaryControl.vids.activeFilters') }}:</span>
        <span v-if="periodChip" class="vids-chip vids-chip--static">{{ periodChip }}</span>
        <button v-for="o in orgChips" :key="o.id" class="vids-chip" @click="removeOrg(o.id)">
          {{ o.name || o.label || o.id }}<i class="vids-chip-x">×</i>
        </button>
        <button v-if="store.params.ones_code" class="vids-chip" @click="removeCode">
          1C: {{ store.params.ones_code }}<i class="vids-chip-x">×</i>
        </button>
      </div>

      <!-- Asosiy: Vidlar jadvali + turkum stacked bar -->
      <Card :title="$t('salaryControl.vids.title')" :sub="$t('salaryControl.vids.sub')">
        <div class="vid-catbar">
          <div
            v-for="seg in catSegments"
            :key="seg.cat"
            class="vid-catbar-seg"
            :style="{ width: seg.pct + '%', background: seg.color }"
            :title="`${seg.cat}: ${formatMoney(seg.s, { unit: 'mln' })} (${seg.pct.toFixed(1)}%)`"
          ></div>
        </div>
        <div class="vid-catbar-legend">
          <span v-for="seg in catSegments" :key="seg.cat">
            <i class="sw" :style="{ background: seg.color }"></i>{{ seg.cat }} ·
            {{ seg.pct.toFixed(0) }}%
          </span>
        </div>

        <div class="vid-toolbar">
          <n-input
            v-model:value="search"
            size="small"
            clearable
            :placeholder="$t('salaryControl.vids.searchPh')"
            class="vid-search"
          />
          <button
            v-if="!search && filteredRows.length > 10"
            class="vid-showall"
            @click="showAll = !showAll"
          >
            {{ showAll ? $t('salaryControl.vids.showTop') : $t('salaryControl.vids.showAll') }}
          </button>
        </div>

        <n-data-table
          :columns="columns"
          :data="displayedRows"
          :row-props="rowProps"
          :pagination="showAll || search ? tablePagination : false"
          :bordered="false"
          size="small"
          :scroll-x="1120"
        />
        <p class="vid-hint">{{ $t('salaryControl.vids.rowHint') }}</p>
      </Card>

      <!-- Mukofot tahlili bo'limi -->
      <div class="vids-section">
        <h3 class="vids-section-title">{{ $t('salaryControl.vids.bonusSection') }}</h3>
        <p class="vids-section-note">{{ $t('salaryControl.vids.bonusSectionNote') }}</p>
      </div>
      <div class="sc-grid2">
        <Card :title="$t('salaryControl.vids.scatter')" :sub="$t('salaryControl.vids.scatterSub')">
          <template #head>
            <span class="vid-badge">
              {{ $t('salaryControl.vids.kpiFlagged') }}: {{ scatterRedCount }}
            </span>
          </template>
          <EChart :option="scatterOption" height="340px" @chart-click="onPointClick" />
          <div class="sc-legend">
            <span><i class="sw" :style="{ background: 'var(--fig-icon-brand)' }"></i>Me'yorda</span>
            <span><i class="sw" :style="{ background: 'var(--fig-icon-red)' }"></i>Tekshirilishi kerak</span>
            <span><i class="sw sw--line" :style="{ background: 'var(--fig-text-tertiary)' }"></i>Mutanosib (100%)</span>
            <span><i class="sw sw--tri"></i>{{ $t('salaryControl.vids.overLimit') }}</span>
          </div>
          <p class="vid-rule">{{ $t('salaryControl.vids.scatterRule') }}</p>
        </Card>
        <Card :title="$t('salaryControl.vids.strip')" :sub="$t('salaryControl.vids.stripSub')">
          <EChart :option="stripOption" height="340px" @chart-click="onPointClick" />
          <div class="vid-stripstats">
            <span v-for="s in stripStats" :key="s.g" class="vid-stripstat">
              <b>{{ s.g }}</b> · n={{ s.n }} · med {{ s.med }}%<span
                v-if="s.red"
                class="vid-red"
              >
                · qizil {{ s.red }}</span>
            </span>
          </div>
          <div class="sc-legend">
            <span><i class="sw" :style="{ background: 'var(--fig-icon-brand)' }"></i>Me'yorda</span>
            <span><i class="sw" :style="{ background: 'var(--fig-icon-red)' }"></i>Tekshirilishi kerak</span>
            <span><i class="sw sw--tri"></i>{{ $t('salaryControl.vids.overLimit') }}</span>
          </div>
        </Card>
      </div>
    </template>

    <!-- Click-to-detail: shu vidni olgan xodimlar ro'yxati + CSV eksport -->
    <n-drawer v-model:show="drawerOpen" :width="560" placement="right">
      <n-drawer-content :native-scrollbar="false" closable>
        <template #header>
          <div class="vid-dh">
            <span class="vid-dh-code">{{ drawerVid?.k }}</span>
            <span class="vid-dh-name">{{ drawerVid?.name }}</span>
          </div>
        </template>
        <div class="vid-dmeta">
          <span>{{ $t('salaryControl.vids.colSum') }}: <b>{{ formatMoney(drawerVid?.s || 0, { unit: 'mln' }) }}</b></span>
          <span>{{ $t('salaryControl.vids.colRecipients') }}: <b>{{ (drawerVid?.c || 0).toLocaleString('ru-RU') }}</b></span>
          <button class="vid-csv" @click="exportCsv">{{ $t('salaryControl.vids.exportCsv') }}</button>
        </div>
        <n-data-table
          :columns="drawerColumns"
          :data="drawerRows"
          :pagination="{ pageSize: 20 }"
          :bordered="false"
          size="small"
        />
      </n-drawer-content>
    </n-drawer>

    <!-- Nuqta bosilganda — xodim kartochkasi (click-to-detail) -->
    <n-drawer v-model:show="empOpen" :width="440" placement="right">
      <n-drawer-content :native-scrollbar="false" closable>
        <template #header>
          <span class="vid-dh-name">{{ empData ? normText(empData.fio) : '' }}</span>
        </template>
        <ul class="vid-emp">
          <li v-for="(d, i) in empDetail" :key="i">
            <span class="vid-emp-l">{{ d.label }}</span>
            <span class="vid-emp-v">{{ d.value }}</span>
          </li>
        </ul>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<style scoped>
  .sc-grid2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  @media (max-width: 1280px) {
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

  /* —— KPI qatori —— */
  .vids-kpi {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }
  .vids-kpi-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 14px;
    border: 0.8px solid var(--fig-br-disable);
    background: var(--fig-block-bg);
  }
  .vids-kpi-dot {
    flex: none;
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
  .vids-kpi-dot.t-blue {
    background: var(--fig-icon-brand);
  }
  .vids-kpi-dot.t-indigo {
    background: var(--fig-icon-indigo);
  }
  .vids-kpi-dot.t-green {
    background: var(--fig-icon-green);
  }
  .vids-kpi-dot.t-red {
    background: var(--fig-icon-red);
  }
  .vids-kpi-label {
    font-size: 12px;
    color: var(--fig-text-tertiary);
    line-height: 16px;
  }
  .vids-kpi-value {
    font-size: 18px;
    font-weight: 600;
    color: var(--fig-text-primary);
    font-variant-numeric: tabular-nums;
    line-height: 24px;
  }

  /* —— Faol filtr chiplari —— */
  .vids-chips {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .vids-chips-label {
    font-size: 12px;
    color: var(--fig-text-tertiary);
  }
  .vids-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: 0.8px solid var(--fig-br-disable);
    background: var(--fig-bg-tertiary);
    color: var(--fig-text-secondary);
    border-radius: 999px;
    padding: 3px 10px;
    font-size: 12px;
    font: inherit;
    font-size: 12px;
    cursor: pointer;
  }
  .vids-chip--static {
    cursor: default;
  }
  .vids-chip-x {
    font-size: 14px;
    line-height: 1;
    color: var(--fig-text-tertiary);
    font-style: normal;
  }

  /* —— Mukofot tahlili bo'limi —— */
  .vids-section {
    margin-top: 4px;
  }
  .vids-section-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--fig-text-primary);
  }
  .vids-section-note {
    font-size: 12px;
    color: var(--fig-text-tertiary);
    margin-top: 2px;
  }

  /* —— Turkum stacked bar —— */
  .vid-catbar {
    display: flex;
    width: 100%;
    height: 14px;
    border-radius: 7px;
    overflow: hidden;
    background: var(--fig-bg-tertiary);
  }
  .vid-catbar-seg {
    height: 100%;
    min-width: 2px;
  }
  .vid-catbar-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 8px 0 14px;
    font-size: 12px;
    color: var(--fig-text-secondary);
  }
  .vid-catbar-legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  /* —— Jadval asboblari —— */
  .vid-toolbar {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .vid-search {
    width: 260px;
    max-width: 60%;
  }
  .vid-showall {
    border: 0.8px solid var(--fig-br-disable);
    background: var(--fig-bg-tertiary);
    color: var(--fig-text-secondary);
    border-radius: 8px;
    padding: 5px 12px;
    font: inherit;
    font-size: 12px;
    cursor: pointer;
    white-space: nowrap;
  }
  .vid-hint {
    margin-top: 8px;
    font-size: 12px;
    color: var(--fig-text-tertiary);
  }

  /* —— Jadval kataklari —— */
  :deep(.vid-cat-tag) {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: var(--fig-text-secondary);
    white-space: nowrap;
  }
  :deep(.vid-cat-dot) {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex: none;
  }
  :deep(.vid-sum-cell) {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 3px;
  }
  :deep(.vid-sum-val) {
    font-variant-numeric: tabular-nums;
  }
  :deep(.vid-mini) {
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: var(--fig-bg-tertiary);
    overflow: hidden;
  }
  :deep(.vid-mini-fill) {
    height: 100%;
    background: var(--fig-icon-brand);
    border-radius: 2px;
  }

  /* —— Drawer —— */
  .vid-dh {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .vid-dh-code {
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    background: var(--fig-icon-brand);
    border-radius: 6px;
    padding: 1px 7px;
  }
  .vid-dh-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--fig-text-primary);
  }
  .vid-dmeta {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 12px;
    font-size: 13px;
    color: var(--fig-text-secondary);
  }
  .vid-dmeta b {
    color: var(--fig-text-primary);
  }
  .vid-csv {
    margin-left: auto;
    border: 0;
    background: var(--fig-icon-brand);
    color: #fff;
    border-radius: 8px;
    padding: 6px 14px;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }

  /* —— Scatter/strip qo'shimcha —— */
  .vid-badge {
    display: inline-flex;
    align-items: center;
    background: var(--fig-bg-red-fill);
    color: var(--fig-text-red);
    border-radius: 999px;
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }
  .sw--tri {
    width: 0 !important;
    height: 0 !important;
    border-radius: 0 !important;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 9px solid var(--fig-text-tertiary);
    background: none !important;
  }
  .vid-rule {
    margin-top: 8px;
    font-size: 12px;
    color: var(--fig-text-tertiary);
    line-height: 16px;
  }
  .vid-stripstats {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
    margin-top: 8px;
    font-size: 12px;
    color: var(--fig-text-secondary);
  }
  .vid-stripstat b {
    color: var(--fig-text-primary);
  }
  .vid-red {
    color: var(--fig-text-red);
    font-weight: 600;
  }

  /* —— Xodim kartochkasi (drawer) —— */
  .vid-emp {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .vid-emp li {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 9px 2px;
    border-bottom: 0.8px solid var(--fig-br-disable);
    font-size: 13px;
  }
  .vid-emp-l {
    color: var(--fig-text-tertiary);
  }
  .vid-emp-v {
    color: var(--fig-text-primary);
    font-weight: 500;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
</style>
