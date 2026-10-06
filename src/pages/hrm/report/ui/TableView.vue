<script setup>
  import { UISearchInput, UISegmentTabs, UITableActionsMenu } from '@/components/index.js'
  import { useReport2Store } from '@/store/modules/index.js'
  import {
    AddCircle24Regular,
    ChevronRight20Regular,
    Delete20Regular,
    Edit32Regular,
    Folder20Regular
  } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'
  import { useReportActions } from '../useReportActions.js'

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

  const search = ref('')
  const status = ref('all')

  const num = (v) => Math.round((Number(v) || 0) * 100) / 100
  // Lavozimda bitta shtat birligi — ayirma to'g'ri. Bo'linmada esa API'ning
  // `vacant`/`over` maydonlari olinadi (Indicator.vue dagi izohga qarang).
  const vacantOf = (d) => num(d.vacant ?? Math.max(num(d.rate) - num(d.real_rate), 0))
  const overOf = (d) => num(d.over ?? Math.max(num(d.real_rate) - num(d.rate), 0))

  const sections = computed(() => {
    const result = []
    const walk = (list, depth) =>
      list.forEach((dept) => {
        result.push({ dept, depth, positions: store.table.positions[dept.id] || [] })
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
  // Vakant/sverx structure javobida bo'lmasa — lavozimlar yig'indisi olinadi.
  const totals = computed(() => {
    const sum = sumOf(allPositions.value)
    const org = store.department.params.organization_id?.[0]
    if (!org) return sum
    return {
      rate: num(org.rate),
      real_rate: num(org.real_rate),
      vacant: org.vacant !== undefined ? num(org.vacant) : sum.vacant,
      over: org.over !== undefined ? num(org.over) : sum.over
    }
  })

  const statusTabs = computed(() => [
    { id: 'all', name: t('report.table.all'), badge: allPositions.value.length },
    {
      id: 'vacant',
      name: t('report.tooltip.V'),
      badge: allPositions.value.filter((p) => vacantOf(p) > 0).length
    },
    {
      id: 'over',
      name: t('report.tooltip.S'),
      badge: allPositions.value.filter((p) => overOf(p) > 0).length
    }
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
    { label: t('report.tooltip.V'), value: totals.value.vacant, cls: 'text-fig-chip-green-text' },
    { label: t('report.tooltip.S'), value: totals.value.over, cls: 'text-fig-text-red' }
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

  const workerTags = (w) =>
    [
      {
        key: 'group',
        label: 'report.tooltip.G',
        value: w.group,
        cls: 'bg-fig-bg-secondary text-fig-text-primary'
      },
      {
        key: 'rank',
        label: 'report.tooltip.R',
        value: w.rank,
        cls: 'bg-fig-chip-amber text-fig-chip-amber-text'
      }
    ].filter((tag) => tag.value)

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
    <!-- Umumiy ko'rsatkichlar (barcha lavozimlar yig'indisi) -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
      <div
        v-for="item in stats"
        :key="item.label"
        class="flex flex-col gap-1 px-4 py-3 rounded-2xl border border-table-border"
      >
        <span class="text-xs text-fig-text-tertiary">{{ item.label }}</span>
        <n-skeleton v-if="store.table.loading" height="24px" width="60%" round />
        <span v-else class="text-xl font-semibold tabular-nums" :class="item.cls">
          {{ item.value }}
        </span>
      </div>
    </div>

    <!-- n-input o'zi `width: 100%` oladi, shu sababli kenglik o'ramga beriladi;
         tablar `shrink-0` bilan siqilmaydi va to'liq ko'rinadi. -->
    <div class="flex flex-col md:flex-row md:items-center gap-2">
      <div class="w-full md:w-[320px] md:shrink-0">
        <UISearchInput v-model:value="search" :placeholder="$t('report.table.search')" />
      </div>
      <div class="md:ml-auto md:shrink-0 max-w-full">
        <UISegmentTabs v-model="status" :tabs="statusTabs" />
      </div>
    </div>

    <n-progress
      v-if="store.table.loading"
      type="line"
      :height="4"
      :show-indicator="false"
      :percentage="store.table.total ? (store.table.done / store.table.total) * 100 : 0"
    />

    <div class="overflow-auto max-h-[calc(100vh-320px)] rounded-2xl border border-table-border">
      <table class="report-sheet w-full min-w-[820px] text-sm">
        <thead>
          <tr>
            <th class="w-12 text-center">№</th>
            <th class="text-left">{{ $t('report.table.position') }}</th>
            <th v-for="col in numberCols" :key="col.key" class="w-20 text-center">
              {{ $t(col.label) }}
            </th>
            <th class="w-40 text-left">{{ $t('report.table.occupancy') }}</th>
            <th class="w-12"></th>
          </tr>
        </thead>

        <tbody v-if="store.table.loading && !allPositions.length">
          <tr v-for="i in 8" :key="i">
            <td v-for="j in 8" :key="j"><n-skeleton height="14px" round /></td>
          </tr>
        </tbody>

        <tbody v-else-if="!visibleSections.length">
          <tr>
            <td colspan="8" class="py-8 text-center text-xs text-fig-text-tertiary">
              {{ $t('content.no-data') }}
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <template v-for="section in visibleSections" :key="section.dept.id">
            <tr class="report-sheet__dept">
              <td colspan="2">
                <div
                  class="flex items-center gap-2"
                  :style="{ paddingLeft: `${section.depth * 20}px` }"
                >
                  <n-icon size="18" class="shrink-0 text-primary"><Folder20Regular /></n-icon>
                  <span class="font-semibold">{{ section.dept.name }}</span>
                  <span
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
                    <div class="flex-1 h-1.5 rounded-full bg-surface-section overflow-hidden">
                      <div
                        class="h-full rounded-full"
                        :class="occupancy(section.dept).cls"
                        :style="{ width: `${Math.min(occupancy(section.dept).pct ?? 100, 100)}%` }"
                      />
                    </div>
                    <span class="w-10 text-right text-xs font-semibold tabular-nums">
                      {{ occupancy(section.dept).pct ?? '—' }}%
                    </span>
                  </div>
                </template>
              </td>
              <td class="text-center">
                <UITableActionsMenu
                  :options="departmentActions"
                  @select="(key) => onDepartmentAction(key, section.dept)"
                />
              </td>
            </tr>

            <tr v-if="!section.positions.length && !store.table.loading">
              <td></td>
              <td colspan="7" class="text-xs text-fig-text-tertiary italic">
                <span :style="{ paddingLeft: `${section.depth * 20}px` }">
                  {{ $t('report.table.noPositions') }}
                </span>
              </td>
            </tr>

            <template v-for="(p, idx) in section.positions" :key="p.id">
              <tr
                class="report-sheet__position cursor-pointer"
                :class="workers[p.id] && 'is-open'"
                @click="toggleWorkers(section, p)"
              >
                <td class="text-center text-xs text-fig-text-tertiary tabular-nums">
                  {{ idx + 1 }}
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
                      <div class="flex-1 h-1.5 rounded-full bg-fig-bg-secondary overflow-hidden">
                        <div
                          class="h-full rounded-full"
                          :class="occupancy(p).cls"
                          :style="{ width: `${Math.min(occupancy(p).pct ?? 100, 100)}%` }"
                        />
                      </div>
                      <span class="w-10 text-right text-xs tabular-nums text-fig-text-secondary">
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
                  <td colspan="7"><n-skeleton height="14px" width="40%" round /></td>
                </tr>
                <tr v-else-if="!workers[p.id].list.length" class="report-sheet__worker">
                  <td></td>
                  <td colspan="7" class="text-xs text-fig-text-tertiary">
                    <span :style="{ paddingLeft: `${section.depth * 20 + 30}px` }">
                      {{ $t('content.no-data') }}
                    </span>
                  </td>
                </tr>
                <tr
                  v-for="w in workers[p.id].list"
                  v-else
                  :key="`w-${w.id}`"
                  class="report-sheet__worker"
                >
                  <td></td>
                  <td>
                    <div
                      class="flex items-center gap-2 min-w-0"
                      :style="{ paddingLeft: `${section.depth * 20 + 30}px` }"
                    >
                      <span
                        class="truncate cursor-pointer hover:text-primary hover:underline"
                        @click="openWorker(w)"
                      >
                        {{ Utils.combineFullName(w.worker) }}
                      </span>
                      <n-tag v-if="w.type" size="tiny" round :bordered="false" type="warning">
                        {{ w.type?.name }}
                      </n-tag>
                      <span class="text-xs text-fig-text-tertiary truncate">
                        {{ w.post_name }}
                      </span>
                      <!-- Guruh va razryad — ro'yxat ko'rinishidagi WorkerCard'dagi G/R bilan bir xil. -->
                      <span class="ml-auto flex items-center gap-1 shrink-0">
                        <span
                          v-for="tag in workerTags(w)"
                          :key="tag.key"
                          class="inline-flex items-center gap-1 h-5 px-2 rounded-full text-[11px] font-semibold tabular-nums"
                          :class="tag.cls"
                        >
                          <span class="font-normal opacity-70">{{ $t(tag.label) }}</span>
                          {{ tag.value }}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td></td>
                  <td class="text-center tabular-nums text-xs">{{ num(w.rate) || '' }}</td>
                  <td colspan="4"></td>
                </tr>
              </template>
            </template>
          </template>
        </tbody>

        <tfoot v-if="allPositions.length">
          <tr>
            <td></td>
            <td class="font-semibold">{{ $t('report.table.total') }}</td>
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

  .report-sheet__worker td {
    padding-top: 6px;
    padding-bottom: 6px;
    font-size: 13px;
  }
</style>
