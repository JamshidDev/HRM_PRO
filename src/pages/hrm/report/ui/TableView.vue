<script setup>
  import { UISearchInput, UISegmentTabs, UITableActionsMenu } from '@/components/index.js'
  import { useReport2Store } from '@/store/modules/index.js'
  import {
    AddCircle24Regular,
    ChevronRight20Regular,
    Delete20Regular,
    Edit32Regular,
    Folder20Regular,
    ReOrderDotsVertical20Regular
  } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'
  import { useReportActions } from '../useReportActions.js'
  import { useElementBounding, useWindowSize } from '@vueuse/core'

  // Shtat jadvali ko'rinishi: barcha bo'linmalar va ularning lavozimlari bitta
  // ochiq jadvalda, bo'linma qatorlari bo'lim sarlavhasi vazifasini bajaradi.
  const store = useReport2Store()
  const { t } = i18n.global
  const {
    deleteDepartment,
    editDepartment,
    addPosition,
    editPosition,
    deletePosition,
    openWorker
  } = useReportActions()

  watch(
    () => store.department.list,
    () => store._loadTable(),
    { immediate: true }
  )

  // Jadval sahifa pastigacha cho'zilishi uchun balandlik konteynerning haqiqiy
  // joylashuvidan hisoblanadi (accountant/report sahifasidagi kabi). 24px —
  // kartochka p-1 + o'ram pb-1 + UIPageContent p-4.
  const sheetRef = ref(null)
  const { height: windowHeight } = useWindowSize()
  const { top: sheetTop, update: updateSheetTop } = useElementBounding(sheetRef)
  const sheetStyle = computed(() => ({
    height: `${Math.max(400, windowHeight.value - sheetTop.value - 24)}px`
  }))
  onMounted(() => nextTick(updateSheetTop))

  const search = ref('')
  const status = ref('all')

  // Lavozimlar bo'linma qatori bosilganda (ochilganda) so'raladi — ro'yxat
  // ko'rinishidagi kabi. Ko'p bo'linmali tashkilotda yuzlab so'rov birdaniga ketmaydi.
  const filterActive = computed(() => !!search.value?.trim() || status.value !== 'all')
  const isOpen = (id) => filterActive.value || !!store.table.expanded[id]
  const toggleDept = (id) => {
    if (store.table.expanded[id]) {
      delete store.table.expanded[id]
      return
    }
    store.table.expanded[id] = true
    store._requestTablePositions([id])
  }

  // Lavozimlarni sudrab tartiblash — faqat o'z bo'linmasi ichida. Qidiruv/filtr
  // paytida ro'yxat to'liq emas, tartib noto'g'ri saqlanardi — o'chiriladi.
  // Qatorlar bitta tbody'da bo'linma va xodim qatorlari bilan aralash, shu sababli
  // VueDraggable emas, brauzerning o'z drag-and-drop'i ishlatiladi.
  const canDrag = computed(() => !filterActive.value && !store.busy)
  const drag = reactive({ deptId: null, from: null, over: null, after: false })

  const onDragStart = (e, deptId, idx) => {
    drag.deptId = deptId
    drag.from = idx
    e.dataTransfer.effectAllowed = 'move'
    // Firefox `setData`siz drag'ni boshlamaydi.
    e.dataTransfer.setData('text/plain', String(idx))
  }

  const onDragOver = (e, deptId, idx) => {
    if (drag.deptId !== deptId) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const rect = e.currentTarget.getBoundingClientRect()
    drag.over = idx
    drag.after = e.clientY > rect.top + rect.height / 2
  }

  const resetDrag = () => {
    drag.deptId = null
    drag.from = null
    drag.over = null
  }

  const onDrop = (deptId) => {
    const list = store.table.positions[deptId]
    const { from, over, after } = drag
    resetDrag()
    if (!list || from === null || over === null) return
    let to = over + (after ? 1 : 0)
    if (from < to) to--
    if (from === to) return
    const [moved] = list.splice(from, 1)
    list.splice(to, 0, moved)
    store._positionOrderable(
      list.map((item, index) => ({ id: item.id, sort: index })),
      deptId
    )
  }

  const dropCls = (deptId, idx) => {
    if (drag.deptId !== deptId || drag.over !== idx || drag.from === idx) return null
    return drag.after ? 'drop-after' : 'drop-before'
  }

  // Yangilanish o'rtasida ro'yxat ko'rinishiga o'tilsa, jadval qulfi qolib ketmasin.
  onBeforeUnmount(() => {
    store.table.refreshing = false
  })

  // Qidiruv yoki Vakant/Sverx filtri barcha lavozimlarni talab qiladi.
  watch(
    [search, status, () => store.table.seq],
    () => {
      if (search.value?.trim() || status.value !== 'all') {
        store._requestTablePositions(store.table.ids)
      }
    }
  )

  // Tahrirdan keyin bo'linmalar qayta yuklanganda jadval o'sha joyida qolsin.
  let savedScroll = null
  watch(
    () => store.department.loading,
    (loading) => {
      if (loading) {
        savedScroll = sheetRef.value?.scrollTop ?? null
        return
      }
      nextTick(() => {
        if (savedScroll !== null && sheetRef.value) sheetRef.value.scrollTop = savedScroll
        savedScroll = null
      })
    }
  )

  const num = (v) => Math.round((Number(v) || 0) * 100) / 100
  // Lavozimda bitta shtat birligi — ayirma to'g'ri. Bo'linmada esa API'ning
  // `vacant`/`over` maydonlari olinadi: ular har shtat birligi bo'yicha hisoblanadi,
  // `rate - real_rate` olsak bir lavozimdagi bo'sh o'rin boshqasidagi ortiqchani yeb qo'yadi.
  const vacantOf = (d) => num(d.vacant ?? Math.max(num(d.rate) - num(d.real_rate), 0))
  const overOf = (d) => num(d.over ?? Math.max(num(d.real_rate) - num(d.rate), 0))

  const sections = computed(() => {
    const result = []
    const walk = (list, depth) =>
      list.forEach((dept) => {
        const positions = store.table.positions[dept.id]
        result.push({
          dept,
          depth,
          positions: positions || [],
          loaded: !!positions,
          open: isOpen(dept.id)
        })
        if (dept.children?.length) walk(dept.children, depth + 1)
      })
    walk(store.department.list, 0)
    return result
  })

  const allPositions = computed(() => sections.value.flatMap((s) => s.positions))

  const sumOf = (list) =>
    list.reduce(
      (acc, p) => ({
        rate: num(acc.rate + num(p.rate)),
        real_rate: num(acc.real_rate + num(p.real_rate)),
        vacant: num(acc.vacant + vacantOf(p)),
        over: num(acc.over + overOf(p))
      }),
      { rate: 0, real_rate: 0, vacant: 0, over: 0 }
    )

  // Jami Plan/Fakt — backend hisoblagan tashkilot qiymati (`/report/structure`),
  // sahifa tepasidagi Plan/Fakt bilan bir xil bo'lishi uchun. Lavozimlarni
  // frontendda qo'shsak, bo'linmaga tushmagan shtatlar tushib qoladi.
  // Vakant/sverx structure javobida bo'lmasa — bo'linmalarning backend qiymatlari
  // yig'indisi (bo'linma qiymati faqat o'z lavozimlarini oladi, bolalarini emas).
  // Lavozimlar yig'indisi emas: ular bo'linma ochilgandagina yuklanadi.
  const totals = computed(() => {
    const sum = sumOf(sections.value.map((s) => s.dept))
    const org = store.department.params.organization_id?.[0]
    if (!org) return sum
    return {
      rate: num(org.rate),
      real_rate: num(org.real_rate),
      vacant: org.vacant !== undefined ? num(org.vacant) : sum.vacant,
      over: org.over !== undefined ? num(org.over) : sum.over
    }
  })

  // Tab badge'lari — shtat birliklari (backend jamidan), yuqoridagi Plan/Vakant/Sverx
  // bilan bir xil. Lavozimlar bo'linma ochilganda yuklangani uchun qatorlarni
  // sanash jadvalga o'tganda to'liq bo'lmasdi.
  const statusTabs = computed(() => [
    { id: 'all', name: t('report.table.all'), badge: totals.value.rate },
    { id: 'vacant', name: t('report.tooltip.V'), badge: totals.value.vacant },
    { id: 'over', name: t('report.tooltip.S'), badge: totals.value.over }
  ])

  const matchStatus = (p) =>
    status.value === 'vacant' ? vacantOf(p) > 0 : status.value === 'over' ? overOf(p) > 0 : true

  const visibleSections = computed(() => {
    const q = search.value?.trim().toLowerCase()
    return sections.value
      .map((s) => {
        const deptMatch = !q || s.dept.name?.toLowerCase().includes(q)
        const positions = s.positions.filter(
          (p) => matchStatus(p) && (deptMatch || p.position?.name?.toLowerCase().includes(q))
        )
        return { ...s, positions, deptMatch }
      })
      .filter((s) => s.positions.length > 0 || (status.value === 'all' && s.deptMatch))
  })

  // Filtrsiz holatda "Jami" qatori ham backend jamini ko'rsatadi; qidiruv yoki
  // status filtri bo'lsa — faqat ko'rinib turgan lavozimlar yig'indisi.
  const visibleTotals = computed(() =>
    !search.value?.trim() && status.value === 'all'
      ? totals.value
      : sumOf(visibleSections.value.flatMap((s) => s.positions))
  )

  const occupancy = (d) => {
    const plan = num(d.rate)
    const fact = num(d.real_rate)
    if (!plan) return fact ? { pct: null, cls: 'bg-fig-text-red' } : null
    const pct = Math.round((fact / plan) * 100)
    const cls =
      pct > 100 ? 'bg-fig-text-red' : pct === 100 ? 'bg-fig-chip-green-text' : 'bg-primary'
    return { pct, cls }
  }

  const stats = computed(() => [
    { label: t('report.tooltip.P'), value: totals.value.rate, cls: 'text-fig-text-primary' },
    { label: t('report.tooltip.F'), value: totals.value.real_rate, cls: 'text-fig-text-primary' },
    // Vakant/Sverx — jadvaldagi badge'lar bilan bir xil ranglar.
    {
      label: t('report.tooltip.V'),
      value: totals.value.vacant,
      cls: 'bg-fig-green-100 text-fig-chip-green-text'
    },
    { label: t('report.tooltip.S'), value: totals.value.over, cls: 'bg-fig-red-100 text-fig-text-red' }
  ])

  // Lavozim qatori bosilganda shu lavozimdagi xodimlar jadval ichida ochiladi.
  const workers = reactive({})
  const toggleWorkers = (section, p) => {
    if (workers[p.id]) {
      delete workers[p.id]
      return
    }
    workers[p.id] = { loading: true, list: [] }
    store
      ._tableWorkers(section.dept.id, p.id)
      .then((list) => {
        if (workers[p.id]) workers[p.id].list = list
      })
      .finally(() => {
        if (workers[p.id]) workers[p.id].loading = false
      })
  }

  // G/R ranglari design system tokenlaridan — Vakant/Sverx badge'lari bilan bir
  // xil qolip: -100 fon + chip matn rangi (dark mavzu variantlari tokenlarda).
  const ellipsisTooltip = { style: { maxWidth: '400px' } }

  const departmentActions = computed(() => [
    {
      label: t('report.addPosition'),
      key: 'addPosition',
      disabled: store.busy,
      icon: UIHelper.renderIcon(AddCircle24Regular)
    },
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      disabled: store.busy,
      icon: UIHelper.renderIcon(Edit32Regular)
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      disabled: store.busy,
      icon: UIHelper.renderIcon(Delete20Regular)
    }
  ])

  const positionActions = computed(() => departmentActions.value.slice(1))

  const onDepartmentAction = (key, dept) => {
    if (key === 'addPosition') addPosition(dept)
    else if (key === Utils.ActionTypes.edit) editDepartment(dept)
    else if (key === Utils.ActionTypes.delete) deleteDepartment(dept)
  }

  const onPositionAction = (key, p, dept) => {
    if (key === Utils.ActionTypes.edit) editPosition(p)
    else if (key === Utils.ActionTypes.delete) deletePosition(p, dept.id)
  }

  // Lavozim guruhi, razryadi va maksimal razryadi. Ro'yxat API'sida obyekt
  // (`{ id, name }`) yoki oddiy qiymat bo'lib kelishi mumkin — ikkalasi ham qo'llanadi.
  const gradeCols = [
    { key: 'group', short: 'G', label: 'report.tooltip.G', cls: 'bg-fig-indigo-100 text-fig-chip-indigo-text' },
    { key: 'rank', short: 'R', label: 'report.tooltip.R', cls: 'bg-fig-amber-100 text-fig-chip-amber-text' },
    { key: 'max_rank', short: 'MR', label: 'report.tooltip.MR', cls: 'bg-fig-amber-100 text-fig-chip-amber-text' }
  ]

  const gradeOf = (d, key) => {
    const v = d?.[key]
    return v && typeof v === 'object' ? v.name : v
  }

  const numberCols = [
    { key: 'rate', label: 'report.tooltip.P' },
    { key: 'real_rate', label: 'report.tooltip.F' },
    { key: 'vacant', label: 'report.tooltip.V' },
    { key: 'over', label: 'report.tooltip.S' }
  ]

  const valueOf = (d, key) => {
    if (key === 'vacant') return vacantOf(d)
    if (key === 'over') return overOf(d)
    return num(d[key])
  }

  const valueCls = (key, value) => {
    if (!value) return 'text-fig-text-disable'
    if (key === 'vacant') return 'text-fig-chip-green-text font-semibold'
    if (key === 'over') return 'text-fig-text-red font-semibold'
    return 'text-fig-text-primary'
  }

  // Vakant va sverx qiymatlari bo'lsa badge ko'rinishida ko'rsatiladi
  // Fon -100 tokenlarda — chip/50 fonlari oq fonda deyarli ko'rinmaydi.
  const badgeCls = (key, value) => {
    if (!value) return null
    if (key === 'vacant') return 'bg-fig-green-100 text-fig-chip-green-text'
    if (key === 'over') return 'bg-fig-red-100 text-fig-text-red'
    return null
  }
</script>

<template>
  <div class="flex flex-col gap-3 px-1 pb-1">
    <!-- n-input o'zi `width: 100%` oladi, shu sababli kenglik o'ramga beriladi.
         Sig'masa bloklar keyingi qatorga o'tadi (`flex-wrap`), tablar esa o'ng
         chetda qoladi (`ml-auto`). -->
    <div class="flex flex-wrap items-center gap-2">
      <div class="w-full sm:w-[260px] xl:w-[320px] sm:shrink-0">
        <UISearchInput v-model:value="search" :placeholder="$t('report.table.search')" />
      </div>
      <!-- Umumiy ko'rsatkichlar — alohida kartochkalar o'rniga qidiruv qatorida
           ixcham guruh: bitta ramka, bo'limlar ajratgich bilan. -->
      <div
        class="grid grid-cols-4 w-full sm:flex sm:w-auto items-center h-[34px] rounded-xl border border-table-border divide-x divide-table-border"
      >
        <div
          v-for="item in stats"
          :key="item.label"
          class="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 h-full min-w-0 px-1 sm:px-3"
        >
          <!-- Kichik ekranda scroll o'rniga 4 teng ustun, shrift va padding kichrayadi. -->
          <span class="text-[11px] sm:text-xs text-fig-text-tertiary truncate">{{ item.label }}</span>
          <n-skeleton v-if="store.table.loading" height="14px" width="24px" round />
          <span
            v-else
            class="inline-flex items-center justify-center shrink-0 min-w-5 sm:min-w-6 h-5 px-1 sm:px-1.5 rounded-full text-[11px] sm:text-xs font-semibold tabular-nums"
            :class="item.value ? item.cls : 'text-fig-text-disable'"
          >
            {{ item.value }}
          </span>
        </div>
      </div>
      <div class="ml-auto max-w-full">
        <UISegmentTabs v-model="status" :tabs="statusTabs" />
      </div>
    </div>

    <!-- Progress jadval ustida absolute — scroll paytida paydo bo'lib, jadvalni
         pastga surib yubormasin. -->
    <!-- Tahrirdan keyin to'liq qayta yuklanguncha jadval spinner bilan yopiladi —
         eski ma'lumot ustida boshqa tahrir ochib bo'lmaydi. -->
    <n-spin :show="store.table.refreshing" class="relative">
      <n-progress
        v-if="store.table.loading"
        class="!absolute inset-x-3 top-0 z-10"
        type="line"
        :height="3"
        :show-indicator="false"
        :percentage="store.table.total ? (store.table.done / store.table.total) * 100 : 0"
      />
      <div
        ref="sheetRef"
        :style="sheetStyle"
        class="overflow-auto rounded-2xl border border-table-border"
      >
        <table class="report-sheet w-full min-w-[640px] table-fixed text-sm">
          <thead>
            <tr>
              <th class="w-9 md:w-12 text-center">№</th>
              <th class="text-left">{{ $t('report.table.position') }}</th>
              <th v-for="col in gradeCols" :key="col.key" class="w-10 md:w-14 text-center">
                <n-tooltip placement="top">
                  <template #trigger>
                    <span class="cursor-help border-b border-dashed border-fig-text-tertiary">
                      {{ col.short }}
                    </span>
                  </template>
                  {{ $t(col.label) }}
                </n-tooltip>
              </th>
              <th v-for="col in numberCols" :key="col.key" class="w-12 md:w-20 text-center">
                {{ $t(col.label) }}
              </th>
              <th class="w-14 md:w-40 text-left">{{ $t('report.table.occupancy') }}</th>
              <th class="w-10 md:w-12"></th>
            </tr>
          </thead>

          <tbody v-if="!visibleSections.length">
            <tr>
              <td colspan="11" class="py-8 text-center text-xs text-fig-text-tertiary">
                {{ $t('content.no-data') }}
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <template v-for="section in visibleSections" :key="section.dept.id">
              <tr class="report-sheet__dept cursor-pointer" @click="toggleDept(section.dept.id)">
                <td colspan="5">
                  <div
                    class="flex items-center gap-2"
                    :style="{ paddingLeft: `${section.depth * 20}px` }"
                  >
                    <n-icon
                      size="14"
                      class="shrink-0 text-fig-text-tertiary transition-transform"
                      :class="section.open && 'rotate-90'"
                    >
                      <ChevronRight20Regular />
                    </n-icon>
                    <n-icon size="18" class="shrink-0 text-primary"><Folder20Regular /></n-icon>
                    <span class="font-semibold">{{ section.dept.name }}</span>
                    <span
                      v-if="section.loaded"
                      class="shrink-0 px-2 h-5 inline-flex items-center rounded-full bg-surface-section text-[11px] text-fig-text-tertiary"
                    >
                      {{ $t('report.table.positionsCount', { n: section.positions.length }) }}
                    </span>
                  </div>
                </td>
                <td
                  v-for="col in numberCols"
                  :key="col.key"
                  class="text-center font-semibold tabular-nums"
                  :class="valueCls(col.key, valueOf(section.dept, col.key))"
                >
                  <span
                    v-if="badgeCls(col.key, valueOf(section.dept, col.key))"
                    class="inline-flex items-center justify-center min-w-8 h-6 px-2 rounded-full text-xs font-semibold"
                    :class="badgeCls(col.key, valueOf(section.dept, col.key))"
                  >
                    {{ valueOf(section.dept, col.key) }}
                  </span>
                  <template v-else>{{ valueOf(section.dept, col.key) || '' }}</template>
                </td>
                <td>
                  <template v-if="occupancy(section.dept)">
                    <div class="flex items-center gap-2">
                      <div class="hidden md:block flex-1 h-1.5 rounded-full bg-surface-section overflow-hidden">
                        <div
                          class="h-full rounded-full"
                          :class="occupancy(section.dept).cls"
                          :style="{ width: `${Math.min(occupancy(section.dept).pct ?? 100, 100)}%` }"
                        />
                      </div>
                      <span class="md:w-10 text-right text-xs font-semibold tabular-nums">
                        {{ occupancy(section.dept).pct ?? '—' }}%
                      </span>
                    </div>
                  </template>
                </td>
                <td class="text-center" @click.stop>
                  <UITableActionsMenu
                    :options="departmentActions"
                    @select="(key) => onDepartmentAction(key, section.dept)"
                  />
                </td>
              </tr>

              <template v-if="section.open">
                <tr v-if="!section.loaded">
                  <td></td>
                  <td colspan="10">
                    <div :style="{ paddingLeft: `${section.depth * 20 + 8}px` }">
                      <n-skeleton height="14px" width="40%" round />
                    </div>
                  </td>
                </tr>
                <tr v-else-if="!section.positions.length">
                  <td></td>
                  <td colspan="10" class="text-xs text-fig-text-tertiary italic">
                    <span :style="{ paddingLeft: `${section.depth * 20}px` }">
                      {{ $t('report.table.noPositions') }}
                    </span>
                  </td>
                </tr>

                <template v-for="(p, idx) in section.positions" :key="p.id">
                  <tr
                    class="report-sheet__position cursor-pointer"
                    :class="[
                      workers[p.id] && 'is-open',
                      drag.deptId === section.dept.id && drag.from === idx && 'is-dragging',
                      dropCls(section.dept.id, idx)
                    ]"
                    :draggable="canDrag"
                    @click="toggleWorkers(section, p)"
                    @dragstart="onDragStart($event, section.dept.id, idx)"
                    @dragover="onDragOver($event, section.dept.id, idx)"
                    @drop.prevent="onDrop(section.dept.id)"
                    @dragend="resetDrag"
                  >
                    <td class="text-center text-xs text-fig-text-tertiary tabular-nums">
                      <!-- Sudrash mumkin bo'lsa, hover'da raqam o'rnida tutqich chiqadi. -->
                      <span :class="canDrag && 'report-sheet__num'">{{ idx + 1 }}</span>
                      <n-icon v-if="canDrag" size="16" class="report-sheet__handle cursor-move">
                        <ReOrderDotsVertical20Regular />
                      </n-icon>
                    </td>
                    <td>
                      <div
                        class="flex items-center gap-1.5"
                        :style="{ paddingLeft: `${section.depth * 20 + 8}px` }"
                      >
                        <n-icon
                          size="14"
                          class="shrink-0 text-fig-text-tertiary transition-transform"
                          :class="workers[p.id] && 'rotate-90'"
                        >
                          <ChevronRight20Regular />
                        </n-icon>
                        <span>{{ p.position?.name }}</span>
                      </div>
                    </td>
                    <td v-for="col in gradeCols" :key="col.key" class="text-center">
                      <span
                        v-if="gradeOf(p, col.key)"
                        :title="$t(col.label)"
                        class="inline-flex items-center justify-center min-w-7 h-5 px-1.5 rounded-md text-[11px] font-semibold tabular-nums"
                        :class="col.cls"
                      >
                        {{ gradeOf(p, col.key) }}
                      </span>
                    </td>
                    <td
                      v-for="col in numberCols"
                      :key="col.key"
                      class="text-center tabular-nums"
                      :class="valueCls(col.key, valueOf(p, col.key))"
                    >
                      <span
                        v-if="badgeCls(col.key, valueOf(p, col.key))"
                        class="inline-flex items-center justify-center min-w-8 h-6 px-2 rounded-full text-xs font-semibold"
                        :class="badgeCls(col.key, valueOf(p, col.key))"
                      >
                        {{ valueOf(p, col.key) }}
                      </span>
                      <template v-else>{{ valueOf(p, col.key) || '' }}</template>
                    </td>
                    <td>
                      <template v-if="occupancy(p)">
                        <div class="flex items-center gap-2">
                          <div class="hidden md:block flex-1 h-1.5 rounded-full bg-fig-bg-secondary overflow-hidden">
                            <div
                              class="h-full rounded-full"
                              :class="occupancy(p).cls"
                              :style="{ width: `${Math.min(occupancy(p).pct ?? 100, 100)}%` }"
                            />
                          </div>
                          <span class="md:w-10 text-right text-xs tabular-nums text-fig-text-secondary">
                            {{ occupancy(p).pct ?? '—' }}%
                          </span>
                        </div>
                      </template>
                    </td>
                    <td class="text-center" @click.stop>
                      <UITableActionsMenu
                        :options="positionActions"
                        @select="(key) => onPositionAction(key, p, section.dept)"
                      />
                    </td>
                  </tr>

                  <template v-if="workers[p.id]">
                    <tr v-if="workers[p.id].loading" class="report-sheet__worker">
                      <td></td>
                      <td colspan="10"><n-skeleton height="14px" width="40%" round /></td>
                    </tr>
                    <tr v-else-if="!workers[p.id].list.length" class="report-sheet__worker">
                      <td></td>
                      <td colspan="10" class="text-xs text-fig-text-tertiary">
                        <span :style="{ paddingLeft: `${section.depth * 20 + 30}px` }">
                          {{ $t('content.no-data') }}
                        </span>
                      </td>
                    </tr>
                    <tr
                      v-for="(w, wIdx) in workers[p.id].list"
                      v-else
                      :key="`w-${w.id}`"
                      class="report-sheet__worker"
                    >
                      <td></td>
                      <td>
                        <!-- Har ustun qat'iy kenglikda — ism/shartnoma/lavozim qatorlar
                         bo'ylab bir xil joyda turadi. Sig'maganda "..." bilan kesiladi,
                         to'liq matn popupda (n-ellipsis faqat kesilganda ko'rsatadi). -->
                        <div
                          class="report-worker"
                          :style="{ paddingLeft: `${section.depth * 20 + 30}px` }"
                        >
                          <span class="text-xs text-fig-text-tertiary tabular-nums text-right">
                            {{ wIdx + 1 }}.
                          </span>
                          <n-ellipsis
                            class="report-worker__name cursor-pointer hover:text-primary hover:underline"
                            :tooltip="ellipsisTooltip"
                            @click="openWorker(w)"
                          >
                            {{ Utils.combineFullName(w.worker) }}
                          </n-ellipsis>
                          <div class="min-w-0">
                            <span
                              v-if="w.type"
                              class="inline-flex max-w-full h-5 items-center px-2 rounded-full text-[11px] bg-primary/10 text-primary"
                            >
                              <n-ellipsis class="min-w-0" :tooltip="ellipsisTooltip">{{ w.type?.name }}</n-ellipsis>
                            </span>
                          </div>
                          <n-ellipsis class="text-xs text-fig-text-tertiary" :tooltip="ellipsisTooltip">
                            {{ w.post_name }}
                          </n-ellipsis>
                        </div>
                      </td>
                      <!-- Xodimning guruhi va razryadi lavozimdagi G / R ustunlarida;
                           maksimal razryad xodimga tegishli emas. -->
                      <td v-for="col in gradeCols" :key="col.key" class="text-center">
                        <span
                          v-if="col.key !== 'max_rank' && gradeOf(w, col.key)"
                          :title="$t(col.label)"
                          class="inline-flex items-center justify-center min-w-7 h-5 px-1.5 rounded-md text-[11px] font-semibold tabular-nums"
                          :class="col.cls"
                        >
                          {{ gradeOf(w, col.key) }}
                        </span>
                      </td>
                      <td></td>
                      <td class="text-center tabular-nums text-xs">{{ num(w.rate) || '' }}</td>
                      <td colspan="4"></td>
                    </tr>
                  </template>
                </template>
              </template>
            </template>
          </tbody>

          <!-- Jami backend qiymatidan — lavozimlar yuklanmagan bo'lsa ham ko'rinadi. -->
          <tfoot v-if="store.table.ids.length">
            <tr>
              <td></td>
              <td class="font-semibold">{{ $t('report.table.total') }}</td>
              <td v-for="col in gradeCols" :key="col.key"></td>
              <td
                v-for="col in numberCols"
                :key="col.key"
                class="text-center font-semibold tabular-nums"
                :class="valueCls(col.key, visibleTotals[col.key])"
              >
                <span
                  v-if="badgeCls(col.key, visibleTotals[col.key])"
                  class="inline-flex items-center justify-center min-w-8 h-6 px-2 rounded-full text-xs font-semibold"
                  :class="badgeCls(col.key, visibleTotals[col.key])"
                >
                  {{ visibleTotals[col.key] }}
                </span>
                <template v-else>{{ visibleTotals[col.key] || '' }}</template>
              </td>
              <td></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </n-spin>
  </div>
</template>

<style scoped>
  .report-sheet {
    border-collapse: separate;
    border-spacing: 0;
  }

  .report-sheet th,
  .report-sheet td {
    padding: 8px 12px;
    border-bottom: 1px solid var(--table-border);
  }

  /* Tor ekranda ustunlar torayadi — yon padding ham kichrayadi. */
  @media (max-width: 767px) {
    .report-sheet th,
    .report-sheet td {
      padding: 6px;
    }
  }

  .report-sheet th + th,
  .report-sheet td + td {
    border-left: 1px solid var(--table-border);
  }

  .report-sheet thead th {
    position: sticky;
    top: 0;
    z-index: 2;
    height: 42px;
    font-size: 12px;
    font-weight: 600;
    color: var(--fig-text-secondary);
    background: var(--table-header);
  }

  .report-sheet tfoot td {
    position: sticky;
    bottom: 0;
    z-index: 2;
    height: 44px;
    background: var(--table-header);
    border-bottom: none;
  }

  .report-sheet__dept td {
    background: var(--fig-chip-brand-bg);
  }

  .report-sheet__position:hover td,
  .report-sheet__position.is-open td {
    background: var(--fig-bg-secondary);
  }

  .report-sheet__handle {
    display: none;
    vertical-align: middle;
  }

  .report-sheet__position:hover .report-sheet__handle {
    display: inline-flex;
  }

  .report-sheet__position:hover .report-sheet__num {
    display: none;
  }

  .report-sheet__position.is-dragging td {
    opacity: 0.4;
  }

  /* Tushish joyi — qator ustida yoki ostida brand rangli chiziq. */
  .report-sheet__position.drop-before td {
    box-shadow: inset 0 2px 0 var(--fig-bg-brand-fill);
  }

  .report-sheet__position.drop-after td {
    box-shadow: inset 0 -2px 0 var(--fig-bg-brand-fill);
  }

  /* tartib raqami | ism | shartnoma turi | lavozim */
  .report-worker {
    display: grid;
    grid-template-columns: 22px minmax(0, 240px) minmax(0, 210px) minmax(0, 1fr);
    align-items: center;
    column-gap: 10px;
    min-width: 0;
  }

  .report-sheet__worker td {
    padding-top: 6px;
    padding-bottom: 6px;
    font-size: 13px;
  }
</style>
