<script setup>
  import { CloudArrowDown24Regular, Eye16Regular, History24Regular, Search24Regular, ArrowDownload24Regular, Calculator24Regular, ArrowSync24Regular } from '@vicons/fluent'
  import { NoDataPicture, UIBadge, UIModal, UIPageContent, UIPagination, UIYearMonth, UISelect } from '@/components/index.js'
  import { useAccountStore, useComponentStore, useSalary1cStore } from '@/store/modules/index.js'
  import { useDebounceFn } from '@vueuse/core'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useSalary1cStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  const activeTab = ref('workers') // 'workers' | 'orgs'

  const fmt = (v) => (v === null || v === undefined ? '—' : Number(v).toLocaleString('ru-RU'))

  // Versiya solishtirish (compare) helperlari
  const fieldLabels = {
    oklad: 'salary1c.oklad',
    hours_worked: 'salary1c.hours',
    position: 'salary1c.position',
    accrual_total: 'salary1c.accrual',
    deduction_total: 'salary1c.deduction',
    net_total: 'salary1c.net'
  }
  const fieldLabel = (k) => (fieldLabels[k] ? t(fieldLabels[k]) : k)
  const isNum = (v) => typeof v === 'number'
  const signed = (n) => (n > 0 ? '+' : '') + Number(n).toLocaleString('ru-RU')
  const diffClass = (n) => (n == null || n === 0 ? '' : n > 0 ? 'text-success' : 'text-error')
  const cmpStatusType = (s) => (s === 'added' ? 'success' : s === 'removed' ? 'error' : 'warning')
  const cmpStatusLabel = (s) =>
    s === 'added' ? t('salary1c.added') : s === 'removed' ? t('salary1c.removed') : t('salary1c.changed')
  const cmpHasChanges = computed(() => {
    const d = store.compareData
    return !!d && (d.fields.length || d.accruals.length || d.deductions.length)
  })

  const pullCodeSet = computed(() => new Set(store.pullCodeIds))

  // Joriy sahifadagi (kodli) vedlar hammasi tanlanganmi — «hammasini tanlash» checkbox holati.
  const allPageVedsSelected = computed(() => {
    const codes = store.vedList.map((v) => v.paying_code).filter((c) => c != null)
    return codes.length > 0 && codes.every((c) => store.selectedVedCodes.includes(c))
  })

  // Solishtirish qatorlari — «faqat farqli» toggle bo'yicha filtrlanadi.
  const reconcileRows = computed(() => {
    const rows = store.reconcile?.rows ?? []
    return store.reconcileOnlyDiff ? rows.filter((r) => r.diff !== 0) : rows
  })

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.economist)) return
    if (componentStore.structureList.length === 0) componentStore._structures()
    store._loadPullCodes()
    store._checkActiveJob() // fon jobiga qayta ulanish (navigatsiya/qayta ochishda)
  })

  const onApply = () => {
    store.params.page = 1
    store.orgTotalsParams.page = 1
    store.vedParams.page = 1
    if (activeTab.value === 'workers') store._index()
    else if (activeTab.value === 'orgs') store._orgTotals()
    else store._veds()
  }
  watch(activeTab, (v) => {
    store.activeTab = v
    if (v === 'orgs') store._orgTotals()
    else if (v === 'veds') store._veds()
    else if (v === 'reconcile') {
      /* foydalanuvchi «Solishtirish» tugmasini bosadi */
    } else store._index()
  })

  // Batch pull (background job) progress
  const pullRunning = computed(() => store.pullJob?.status === 'running')
  const pullFinished = computed(() => store.pullJob?.status === 'finished')
  const pullCancelled = computed(() => store.pullJob?.status === 'cancelled')
  const pullEnded = computed(() => pullFinished.value || pullCancelled.value)
  const pullItems = computed(() => store.pullJob?.items ?? [])
  const pullProcessed = computed(() => store.pullJob?.processed ?? 0)
  const pullTotal = computed(() => store.pullJob?.total ?? 0)
  const pullOkCount = computed(() => pullItems.value.filter((i) => i.status === 'done').length)
  const pullErrCount = computed(() => pullItems.value.filter((i) => i.status === 'error').length)
  const pullPct = computed(() =>
    pullTotal.value ? Math.round((pullProcessed.value / pullTotal.value) * 100) : 0
  )
  const pullSelectedCount = computed(() => store.pullSelectOrgs.filter((o) => o.selected).length)

  // Batch modalда korxona qidiruvi (client-side filtr, 73 element).
  const pullOrgSearch = ref('')
  const pullSelectFiltered = computed(() => {
    const q = pullOrgSearch.value.trim().toLowerCase()
    if (!q) return store.pullSelectOrgs
    return store.pullSelectOrgs.filter(
      (o) =>
        (o.name || '').toLowerCase().includes(q) ||
        (o.ones_org_code || '').toLowerCase().includes(q)
    )
  })
  const allSelected = computed({
    get: () => pullSelectFiltered.value.length > 0 && pullSelectFiltered.value.every((o) => o.selected),
    set: (v) => pullSelectFiltered.value.forEach((o) => (o.selected = v))
  })

  // Tortish tarixi (pull-log) — holat filtri + qidiruv.
  const pullLogStatusOptions = computed(() => [
    { label: t('salary1c.stDone'), value: 'done' },
    { label: t('salary1c.stError'), value: 'error' }
  ])
  const onPullLogStatus = (v) => {
    store.pullLogStatus = v ?? null
    store._reloadPullLog()
  }
  const pullLogSearchLocal = ref('')
  const onPullLogSearch = useDebounceFn((v) => {
    store.pullLogSearch = v || null
    store._reloadPullLog()
  }, 400)
  const fmtDur = (ms) => {
    if (ms == null) return '—'
    if (ms < 1000) return ms + ' ms'
    const s = ms / 1000
    if (s < 60) return s.toFixed(1) + ' s'
    const m = Math.floor(s / 60)
    return `${m}m ${String(Math.round(s % 60)).padStart(2, '0')}s`
  }

  // Qidiruvda yozish/tozalashda avto qidiruv (debounce) — Enter shart emas.
  const autoSearch = useDebounceFn(onApply, 350)
  watch(() => store.params.search, () => {
    if (activeTab.value === 'workers') autoSearch()
  })
</script>

<template>
  <UIPageContent>
    <!-- Filter -->
    <div class="s1-filter">
      <div class="grid grid-cols-12 gap-3 items-end">
        <div class="col-span-12 md:col-span-3">
          <label class="s1-lbl">{{ $t('salary1c.organization') }}</label>
          <UISelect
            :searchable-input="true"
            :options="componentStore.structureList"
            :model-v="store.selectedOrgs"
            @updateModel="store.onChangeStructure"
            :checked-val="store.structureCheck"
            @updateCheck="(v) => (store.structureCheck = v)"
            :loading="componentStore.structureLoading"
            v-model:search="componentStore.structureParams.search"
            @onSearch="componentStore._structures"
            @onSubmit="onApply"
          >
            <template #label="{ data }">
              <span class="text-xs ml-2">{{ componentStore.structureShort ? data.code : data.name }}</span>
              <span v-if="pullCodeSet.has(data.id)" class="s1-1c-dot" :title="$t('salary1c.pullableHint')"></span>
            </template>
          </UISelect>
        </div>
        <div class="col-span-12 md:col-span-2">
          <label class="s1-lbl">{{ $t('salary1c.period') }}</label>
          <UIYearMonth v-model:year="store.params.year" v-model:month="store.params.month"
            :clearable="false" :placeholder="$t('salary1c.selectMonth')" @change="onApply" />
        </div>
        <div class="col-span-12 md:col-span-5">
          <label class="s1-lbl">{{ $t('content.search') }}</label>
          <n-input v-model:value="store.params.search" :placeholder="$t('salary1c.searchPh')" clearable
            :disabled="activeTab !== 'workers'" />
        </div>
        <div class="col-span-12 md:col-span-2">
          <n-button block type="primary" @click="store._openPullModal()">
            <template #icon>
              <n-icon v-if="!pullRunning"><CloudArrowDown24Regular /></n-icon>
              <svg v-else class="s1-dl-svg" viewBox="0 0 24 24" width="18" height="18" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 18a4 4 0 0 1-.5-7.97 5.5 5.5 0 0 1 10.6-1.02A3.5 3.5 0 0 1 17.5 18" />
                <g class="s1-dl-arrow">
                  <line x1="12" y1="9" x2="12" y2="14.5" />
                  <polyline points="9.7 12.2 12 14.5 14.3 12.2" />
                </g>
              </svg>
            </template>
            {{ pullRunning ? `${pullProcessed}/${pullTotal}` : $t('salary1c.pull') }}
          </n-button>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between flex-wrap gap-2">
      <n-tabs type="segment" v-model:value="activeTab" size="small" class="s1-seg">
        <n-tab-pane name="workers" :tab="$t('salary1c.workers')" />
        <n-tab-pane name="orgs" :tab="$t('salary1c.byOrg')" />
        <n-tab-pane name="veds" :tab="$t('salary1c.veds.tab')" />
        <n-tab-pane name="reconcile" :tab="$t('salary1c.reconcile.tab')" />
      </n-tabs>
      <div class="flex items-center gap-2">
        <n-button size="small" tertiary @click="store._openPullLog()">
          <template #icon><n-icon><History24Regular /></n-icon></template>
          {{ $t('salary1c.pullLog') }}
        </n-button>
      </div>
    </div>

    <!-- Xodimlar -->
    <template v-if="activeTab === 'workers'">
      <div v-if="store.report" class="s1-stats">
        <div class="s1-stat">
          <span class="s1-stat-lbl">{{ $t('salary1c.employees') }}</span>
          <span class="s1-stat-val">{{ store.report.employee_count }}</span>
        </div>
        <div class="s1-stat">
          <span class="s1-stat-lbl">{{ $t('salary1c.accrual') }}</span>
          <span class="s1-stat-val">{{ fmt(store.report.accrual_total) }}</span>
        </div>
        <div class="s1-stat">
          <span class="s1-stat-lbl">{{ $t('salary1c.deduction') }}</span>
          <span class="s1-stat-val">{{ fmt(store.report.deduction_total) }}</span>
        </div>
        <div class="s1-stat s1-stat--net">
          <span class="s1-stat-lbl">{{ $t('salary1c.net') }}</span>
          <span class="s1-stat-val text-primary">{{ fmt(store.report.net_total) }}</span>
        </div>
        <div v-if="store.report.unmatched_count" class="s1-stat s1-stat--warn"
          :class="{ 's1-stat--active': store.params.matched === 'out' }"
          role="button" @click="store.toggleUnmatched()">
          <span class="s1-stat-lbl">{{ $t('salary1c.notInSystem') }}</span>
          <span class="s1-stat-val">{{ store.report.unmatched_count }}</span>
        </div>
      </div>

      <div class="s1-scroll">
        <n-spin :show="store.loading" style="min-height: 200px">
          <div class="w-full overflow-x-auto" v-if="store.list.length">
            <n-table :single-line="false" size="small">
              <thead>
                <tr>
                  <th class="text-center! w-[56px]">{{ $t('salary1c.rowNo') }}</th>
                  <th class="min-w-[220px]">{{ $t('salary1c.fio') }}</th>
                  <th class="min-w-[130px]">PINFL</th>
                  <th class="min-w-[100px]">{{ $t('salary1c.tabNo') }}</th>
                  <th class="min-w-[180px]">{{ $t('salary1c.position') }}</th>
                  <th class="min-w-[170px]">{{ $t('salary1c.department') }}</th>
                  <th class="min-w-[200px]">{{ $t('salary1c.organization') }}</th>
                  <th class="text-right! min-w-[120px]">{{ $t('salary1c.oklad') }}</th>
                  <th class="text-right! min-w-[120px]">{{ $t('salary1c.accrual') }}</th>
                  <th class="text-right! min-w-[120px]">{{ $t('salary1c.deduction') }}</th>
                  <th class="text-right! min-w-[120px]">{{ $t('salary1c.net') }}</th>
                  <th class="w-[80px]"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in store.list" :key="r.id" :class="{ 's1-row-out': !r.in_system }">
                  <td class="text-center! text-textColor3">
                    {{ (store.params.page - 1) * store.params.per_page + i + 1 }}
                  </td>
                  <td>
                    <div class="flex items-center gap-2">
                      <span>{{ r.fio }}</span>
                      <UIBadge v-if="!r.in_system" :label="$t('salary1c.notInSystem')"
                        :type="Utils.colorTypes.error" :show-icon="false" paddingY="py-0.5" />
                    </div>
                    <div v-if="r.in_system && r.worker_name" class="text-xs text-textColor3">
                      {{ r.worker_name }}
                    </div>
                  </td>
                  <td>{{ r.pinfl }}</td>
                  <td>{{ r.tab_nomer }}</td>
                  <td>{{ r.position }}</td>
                  <td class="text-textColor2">{{ r.department_name || '—' }}</td>
                  <td class="text-textColor2">{{ r.organization_name || '—' }}</td>
                  <td class="text-right! tnum">{{ fmt(r.oklad) }}</td>
                  <td class="text-right! tnum">{{ fmt(r.accrual_total) }}</td>
                  <td class="text-right! tnum">{{ fmt(r.deduction_total) }}</td>
                  <td class="text-right! tnum font-semibold">{{ fmt(r.net_total) }}</td>
                  <td class="text-center!">
                    <n-button size="tiny" quaternary @click="store._payslip(r.id)" :title="$t('salary1c.payslip')">
                      <template #icon><n-icon><Eye16Regular /></n-icon></template>
                    </n-button>
                    <n-button size="tiny" quaternary @click="store._history(r)" :title="$t('salary1c.history')">
                      <template #icon><n-icon><History24Regular /></n-icon></template>
                    </n-button>
                    <n-button size="tiny" quaternary @click="store._pullOne(r)" :title="$t('salary1c.repull')"
                      :loading="store.repullPinfl === r.pinfl" :disabled="!!store.repullPinfl">
                      <template #icon><n-icon><ArrowSync24Regular /></n-icon></template>
                    </n-button>
                  </td>
                </tr>
              </tbody>
            </n-table>
          </div>
          <NoDataPicture v-if="!store.loading && !store.list.length" />
        </n-spin>
      </div>

      <div v-if="store.total" class="s1-pager">
        <UIPagination :total="store.total" :page="store.params.page" :per_page="store.params.per_page"
          @changePage="store.onChangePage" />
      </div>
    </template>

    <!-- Korxonalar kesimida -->
    <template v-else-if="activeTab === 'orgs'">
      <div v-if="store.orgTotals" class="s1-stats">
        <div class="s1-stat">
          <span class="s1-stat-lbl">{{ $t('salary1c.employees') }}</span>
          <span class="s1-stat-val">{{ store.orgTotals.totals.employee_count }}</span>
        </div>
        <div class="s1-stat s1-stat--net">
          <span class="s1-stat-lbl">{{ $t('salary1c.net') }}</span>
          <span class="s1-stat-val text-primary">{{ fmt(store.orgTotals.totals.net_total) }}</span>
        </div>
      </div>
      <div class="s1-scroll">
        <n-spin :show="store.orgTotalsLoading" style="min-height: 200px">
          <div class="w-full overflow-x-auto" v-if="(store.orgTotals?.data || []).length">
            <n-table :single-line="false" size="small">
              <thead>
                <tr>
                  <th class="text-center! w-[56px]">{{ $t('salary1c.rowNo') }}</th>
                  <th class="min-w-[240px]">{{ $t('salary1c.organization') }}</th>
                  <th class="text-right! min-w-[100px]">{{ $t('salary1c.employees') }}</th>
                  <th class="text-right! min-w-[120px]">{{ $t('salary1c.accrual') }}</th>
                  <th class="text-right! min-w-[120px]">{{ $t('salary1c.deduction') }}</th>
                  <th class="text-right! min-w-[120px]">{{ $t('salary1c.net') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(o, i) in store.orgTotals?.data || []" :key="o.organization_id">
                  <td class="text-center! text-textColor3">
                    {{ (store.orgTotalsParams.page - 1) * store.orgTotalsParams.per_page + i + 1 }}
                  </td>
                  <td>{{ o.organization }}</td>
                  <td class="text-right! tnum">{{ o.employee_count }}</td>
                  <td class="text-right! tnum">{{ fmt(o.accrual_total) }}</td>
                  <td class="text-right! tnum">{{ fmt(o.deduction_total) }}</td>
                  <td class="text-right! tnum font-semibold">{{ fmt(o.net_total) }}</td>
                </tr>
              </tbody>
            </n-table>
          </div>
          <NoDataPicture v-if="!store.orgTotalsLoading && !(store.orgTotals?.data || []).length" />
        </n-spin>
      </div>

      <div v-if="store.orgTotals?.total" class="s1-pager">
        <UIPagination :total="store.orgTotals.total" :page="store.orgTotalsParams.page"
          :per_page="store.orgTotalsParams.per_page" @changePage="store.onOrgTotalsPage" />
      </div>
    </template>

    <!-- Ved kesimida: vedlar ro'yxati (tanlash) → «Hisoblash» → natija modali -->
    <template v-else-if="activeTab === 'veds'">
      <div class="s1-card">
        <div class="s1-card-hd s1-ved-hd">
          <span class="s1-card-title">{{ $t('salary1c.veds.listTitle') }}</span>
          <div class="s1-ved-tools">
            <n-input v-model:value="store.vedParams.search" size="small" clearable class="skip-format"
              :style="{ width: '240px', flex: '0 0 auto' }"
              :placeholder="$t('salary1c.veds.searchPh')" @keyup.enter="store.onVedsSearch()" />
            <n-button size="small" secondary @click="store.onVedsSearch()">{{ $t('content.search') }}</n-button>
            <n-button type="primary" size="small" :disabled="!store.selectedVedCodes.length"
              @click="store.openVedMatrix()">
              <template #icon><n-icon><Calculator24Regular /></n-icon></template>
              {{ $t('salary1c.veds.compute') }} ({{ store.selectedVedCodes.length }})
            </n-button>
          </div>
        </div>

        <!-- Tanlangan vedlar chiplari -->
        <div v-if="store.selectedVedCodes.length" class="s1-chips">
          <n-tag v-for="code in store.selectedVedCodes" :key="code" size="small" round closable
            @close="store.toggleVed(code)">{{ code }}</n-tag>
        </div>

        <n-spin :show="store.vedLoading">
          <div class="s1-ved-box" v-if="store.vedList.length">
            <n-table :single-line="false" size="small">
              <thead>
                <tr>
                  <th class="w-[40px] text-center!">
                    <n-checkbox :checked="allPageVedsSelected" @update:checked="store.toggleAllVeds()" />
                  </th>
                  <th class="w-[90px]">{{ $t('salary1c.veds.code') }}</th>
                  <th class="min-w-[320px]">{{ $t('salary1c.veds.name') }}</th>
                  <th class="w-[100px] text-center!">{{ $t('salary1c.veds.type') }}</th>
                  <th class="text-right! min-w-[150px]">{{ $t('salary1c.veds.summa') }}</th>
                  <th class="text-center! w-[80px]">{{ $t('salary1c.veds.workers') }}</th>
                  <th class="text-center! w-[80px]">{{ $t('salary1c.veds.orgs') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="v in store.vedList" :key="(v.paying_code ?? 'null') + '-' + v.type"
                  class="s1-ved-row" :class="{ 's1-ved-row--sel': store.selectedVedCodes.includes(v.paying_code) }"
                  @click="v.paying_code != null && store.toggleVed(v.paying_code)">
                  <td class="text-center!" @click.stop>
                    <n-checkbox :checked="store.selectedVedCodes.includes(v.paying_code)"
                      :disabled="v.paying_code == null" @update:checked="store.toggleVed(v.paying_code)" />
                  </td>
                  <td class="font-mono text-xs">{{ v.paying_code ?? '—' }}</td>
                  <td class="text-xs">{{ v.paying_name || '—' }}</td>
                  <td class="text-center!">
                    <n-tag :type="v.type === 2 ? 'error' : 'success'" size="tiny" round>
                      {{ v.type === 2 ? $t('salary1c.veds.deduction') : $t('salary1c.veds.accrual') }}
                    </n-tag>
                  </td>
                  <td class="text-right! tnum">{{ fmt(v.total_summa) }}</td>
                  <td class="text-center! text-textColor3">{{ v.worker_count }}</td>
                  <td class="text-center! text-textColor3">{{ v.org_count }}</td>
                </tr>
              </tbody>
            </n-table>
          </div>
          <div v-if="!store.vedLoading && !store.vedList.length" class="s1-empty">
            <NoDataPicture />
          </div>
        </n-spin>
        <div v-if="store.vedTotal > store.vedParams.per_page" class="s1-pager s1-pager--pad">
          <UIPagination :total="store.vedTotal" :page="store.vedParams.page" :per_page="store.vedParams.per_page"
            @changePage="store.onVedsPage" />
        </div>
      </div>

      <!-- Natija modali: korxona × ved matritsasi (to'liq kenglik, thead+banner qotib turadi) -->
      <UIModal :width="'94%'" :height="'86vh'" :visible="store.vedMatrixVisible"
        @update:visible="(v) => (store.vedMatrixVisible = v)" :title="$t('salary1c.veds.resultTitle')">
        <div class="s1-matrix-wrap">
          <div v-if="store.vedMatrix && store.vedMatrix.data.length" class="s1-net shrink-0">
            <span>{{ $t('salary1c.veds.grandTotal') }}
              ({{ store.vedMatrix.total }} {{ $t('salary1c.organization').toLowerCase() }})</span>
            <span class="text-primary">{{ fmt(store.vedMatrix.grand_total) }}</span>
          </div>

          <n-spin :show="store.vedMatrixLoading" class="s1-spin-fill">
            <div class="s1-matrix-box" v-if="store.vedMatrix && store.vedMatrix.data.length">
              <n-table :single-line="false" size="small">
                <thead>
                  <tr>
                    <th class="min-w-[240px] s1-sticky-col">{{ $t('salary1c.organization') }}</th>
                    <th v-for="c in store.vedMatrix.columns" :key="c.paying_code" class="text-right! min-w-[140px]"
                      :title="c.paying_name || ''">
                      <div class="font-mono">{{ c.paying_code }}</div>
                      <div class="s1-col-name">{{ (c.paying_name || '').slice(0, 26) }}</div>
                    </th>
                    <th class="text-right! min-w-[150px]">{{ $t('salary1c.veds.rowTotal') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="o in store.vedMatrix.data" :key="o.organization_id">
                    <td class="s1-sticky-col">{{ o.organization || '—' }}</td>
                    <td v-for="c in store.vedMatrix.columns" :key="c.paying_code" class="text-right! tnum">
                      {{ o.cells[c.paying_code] ? fmt(o.cells[c.paying_code]) : '—' }}
                    </td>
                    <td class="text-right! tnum font-semibold">{{ fmt(o.row_total) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="s1-ved-foot">
                    <td class="s1-sticky-col">{{ $t('salary1c.veds.total') }}</td>
                    <td v-for="c in store.vedMatrix.columns" :key="c.paying_code" class="text-right! tnum">
                      {{ fmt(store.vedMatrix.column_totals[c.paying_code] || 0) }}
                    </td>
                    <td class="text-right! tnum text-primary">{{ fmt(store.vedMatrix.grand_total) }}</td>
                  </tr>
                </tfoot>
              </n-table>
            </div>
            <div v-if="!store.vedMatrixLoading && !(store.vedMatrix && store.vedMatrix.data.length)" class="s1-empty">
              <n-icon size="40" class="text-textColor3"><Calculator24Regular /></n-icon>
              <p>{{ $t('salary1c.noData') }}</p>
            </div>
          </n-spin>

          <div v-if="store.vedMatrix && store.vedMatrix.total > store.vedMatrixParams.per_page"
            class="shrink-0 flex justify-end pt-2">
            <UIPagination :total="store.vedMatrix.total" :page="store.vedMatrixParams.page"
              :per_page="store.vedMatrixParams.per_page" @changePage="store.onVedMatrixPage" />
          </div>
        </div>
      </UIModal>
    </template>

    <!-- Solishtirish (1C AccruedByType ↔ bizning hisob) -->
    <template v-else>
      <div class="s1-card">
        <div class="s1-card-hd s1-ved-hd">
          <span class="s1-card-title">{{ $t('salary1c.reconcile.tab') }}</span>
          <div class="s1-ved-tools">
            <n-checkbox v-model:checked="store.reconcileOnlyDiff" v-if="store.reconcile">
              {{ $t('salary1c.reconcile.onlyDiff') }}
            </n-checkbox>
            <n-button type="primary" size="small" :loading="store.reconcileLoading"
              @click="store._reconcile()">
              <template #icon><n-icon><Calculator24Regular /></n-icon></template>
              {{ $t('salary1c.reconcile.run') }}
            </n-button>
          </div>
        </div>

        <n-spin :show="store.reconcileLoading">
          <div v-if="store.reconcile" class="p-3">
            <!-- Xulosa kartalar -->
            <div class="s1-rec-info">
              <span>{{ store.reconcile.organization }}
                <b v-if="store.reconcile.ones_org_code">({{ store.reconcile.ones_org_code }})</b></span>
              <n-tag :type="store.reconcile.has_diff ? 'warning' : 'success'" round size="small">
                {{ store.reconcile.has_diff ? $t('salary1c.reconcile.hasDiff') : $t('salary1c.reconcile.match') }}
              </n-tag>
            </div>
            <div class="s1-stats mb-3">
              <div class="s1-stat">
                <span class="s1-stat-lbl">{{ $t('salary1c.veds.accrual') }} — {{ $t('salary1c.reconcile.ours') }}</span>
                <span class="s1-stat-val">{{ fmt(store.reconcile.totals.ours_accrual) }}</span>
              </div>
              <div class="s1-stat">
                <span class="s1-stat-lbl">{{ $t('salary1c.veds.accrual') }} — 1C</span>
                <span class="s1-stat-val">{{ fmt(store.reconcile.totals.ones_accrual) }}</span>
              </div>
              <div class="s1-stat" :class="store.reconcile.totals.diff_accrual !== 0 && 's1-stat--warn'">
                <span class="s1-stat-lbl">{{ $t('salary1c.veds.accrual') }} — {{ $t('salary1c.reconcile.diff') }}</span>
                <span class="s1-stat-val">{{ signed(store.reconcile.totals.diff_accrual) }}</span>
              </div>
              <div class="s1-stat">
                <span class="s1-stat-lbl">{{ $t('salary1c.veds.deduction') }} — {{ $t('salary1c.reconcile.ours') }}</span>
                <span class="s1-stat-val">{{ fmt(store.reconcile.totals.ours_deduction) }}</span>
              </div>
              <div class="s1-stat">
                <span class="s1-stat-lbl">{{ $t('salary1c.veds.deduction') }} — 1C</span>
                <span class="s1-stat-val">{{ fmt(store.reconcile.totals.ones_deduction) }}</span>
              </div>
              <div class="s1-stat" :class="store.reconcile.totals.diff_deduction !== 0 && 's1-stat--warn'">
                <span class="s1-stat-lbl">{{ $t('salary1c.veds.deduction') }} — {{ $t('salary1c.reconcile.diff') }}</span>
                <span class="s1-stat-val">{{ signed(store.reconcile.totals.diff_deduction) }}</span>
              </div>
            </div>

            <div class="s1-ved-box">
              <n-table :single-line="false" size="small">
                <thead>
                  <tr>
                    <th class="w-[90px]">{{ $t('salary1c.veds.code') }}</th>
                    <th class="min-w-[300px]">{{ $t('salary1c.veds.name') }}</th>
                    <th class="w-[100px] text-center!">{{ $t('salary1c.veds.type') }}</th>
                    <th class="text-right! min-w-[150px]">{{ $t('salary1c.reconcile.ours') }}</th>
                    <th class="text-right! min-w-[150px]">1C</th>
                    <th class="text-right! min-w-[140px]">{{ $t('salary1c.reconcile.diff') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, i) in reconcileRows" :key="i" :class="{ 's1-rec-diff': r.diff !== 0 }">
                    <td class="font-mono text-xs">{{ r.code || '—' }}</td>
                    <td class="text-xs">{{ r.name || '—' }}</td>
                    <td class="text-center!">
                      <n-tag :type="r.type === 2 ? 'error' : 'success'" size="tiny" round>
                        {{ r.type === 2 ? $t('salary1c.veds.deduction') : $t('salary1c.veds.accrual') }}
                      </n-tag>
                    </td>
                    <td class="text-right! tnum">
                      <span v-if="r.ours" class="s1-drill" @click="store.openVedWorkers(r)"
                        :title="$t('salary1c.workers')">{{ fmt(r.ours) }}</span>
                      <span v-else>{{ fmt(r.ours) }}</span>
                    </td>
                    <td class="text-right! tnum">{{ fmt(r.ones) }}</td>
                    <td class="text-right! tnum" :class="r.diff > 0 ? 'text-success' : r.diff < 0 ? 'text-error' : 'text-textColor3'">
                      {{ r.diff === 0 ? '0' : signed(r.diff) }}
                    </td>
                  </tr>
                </tbody>
              </n-table>
            </div>
          </div>
          <div v-else class="s1-empty">
            <n-icon size="40" class="text-textColor3"><Calculator24Regular /></n-icon>
            <p>{{ $t('salary1c.reconcile.hint') }}</p>
          </div>
        </n-spin>
      </div>

      <!-- Ved drill-down modal: bir ved summasi qaysi xodimlardan -->
      <UIModal :width="'1040px'" :visible="store.vedWorkersVisible"
        @update:visible="(v) => (store.vedWorkersVisible = v)"
        :title="$t('salary1c.workers')">
        <div v-if="store.vedWorkersRow" class="mb-2 text-sm text-textColor2">
          <b>{{ store.vedWorkersRow.code || '—' }}</b>
          {{ store.vedWorkersRow.name }}
        </div>
        <div class="flex items-center gap-2 mb-2">
          <n-input v-model:value="store.vedWorkersParams.search" size="small" clearable class="skip-format max-w-[260px]"
            :placeholder="$t('salary1c.searchPh')" @keyup.enter="store.onVedWorkersSearch()" />
          <n-button size="small" secondary @click="store.onVedWorkersSearch()">{{ $t('content.search') }}</n-button>
          <span v-if="store.vedWorkers" class="text-xs text-textColor3 ml-auto">
            {{ $t('salary1c.veds.total') }}: <b class="text-primary">{{ fmt(store.vedWorkers.total_summa) }}</b>
            ({{ store.vedWorkers.total }})
          </span>
        </div>
        <n-spin :show="store.vedWorkersLoading" style="min-height: 200px">
          <div class="s1-ved-box" v-if="store.vedWorkers && store.vedWorkers.data.length">
            <n-table :single-line="false" size="small">
              <thead>
                <tr>
                  <th class="w-[56px] text-center!">{{ $t('salary1c.rowNo') }}</th>
                  <th class="min-w-[200px]">{{ $t('salary1c.fio') }}</th>
                  <th class="min-w-[130px]">PINFL</th>
                  <th class="w-[90px]">{{ $t('salary1c.tabNo') }}</th>
                  <th class="min-w-[180px]">{{ $t('salary1c.position') }}</th>
                  <th class="min-w-[160px]">{{ $t('salary1c.department') }}</th>
                  <th class="min-w-[170px]">{{ $t('salary1c.organization') }}</th>
                  <th class="text-right! min-w-[130px]">{{ $t('salary1c.veds.summa') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(w, i) in store.vedWorkers.data" :key="i">
                  <td class="text-center! text-textColor3">
                    {{ (store.vedWorkersParams.page - 1) * store.vedWorkersParams.per_page + i + 1 }}
                  </td>
                  <td>{{ w.fio || '—' }}</td>
                  <td>{{ w.pinfl || '—' }}</td>
                  <td>{{ w.tab_nomer || '—' }}</td>
                  <td class="text-xs">{{ w.position || '—' }}</td>
                  <td class="text-xs text-textColor2">{{ w.department || '—' }}</td>
                  <td class="text-xs text-textColor2">{{ w.organization || '—' }}</td>
                  <td class="text-right! tnum">{{ fmt(w.summa) }}</td>
                </tr>
              </tbody>
            </n-table>
          </div>
          <div v-if="!store.vedWorkersLoading && !(store.vedWorkers && store.vedWorkers.data.length)" class="s1-empty">
            <NoDataPicture />
          </div>
        </n-spin>
        <div v-if="store.vedWorkers && store.vedWorkers.total > store.vedWorkersParams.per_page"
          class="mt-3 flex justify-end">
          <UIPagination :total="store.vedWorkers.total" :page="store.vedWorkersParams.page"
            :per_page="store.vedWorkersParams.per_page" short @changePage="store.onVedWorkersPage" />
        </div>
      </UIModal>
    </template>

    <!-- Payslip modal -->
    <UIModal :width="'640px'" :visible="store.payslipVisible" @update:visible="(v) => (store.payslipVisible = v)"
      :title="$t('salary1c.payslip')">
      <n-spin :show="store.payslipLoading">
        <div v-if="store.payslip" class="min-h-[100px]">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="font-semibold text-base">{{ store.payslip.fio }}</p>
              <p class="text-xs text-textColor3 mb-3">
                {{ store.payslip.position }} · PINFL {{ store.payslip.pinfl }} · {{ $t('salary1c.tabNo') }} {{ store.payslip.tab_nomer }} · {{ store.payslip.year }}/{{ store.payslip.month }}
              </p>
            </div>
            <n-button size="small" secondary @click="store._pullOne(store.payslip)"
              :loading="store.repullPinfl === store.payslip.pinfl" :disabled="!!store.repullPinfl">
              <template #icon><n-icon><ArrowSync24Regular /></n-icon></template>
              {{ $t('salary1c.repull') }}
            </n-button>
          </div>

          <div class="s1-pinfo">
            <div><span class="s1-pinfo-lbl">{{ $t('salary1c.oklad') }}</span><b class="tnum">{{ fmt(store.payslip.oklad) }}</b></div>
            <div><span class="s1-pinfo-lbl">{{ $t('salary1c.hours') }}</span><b class="tnum">{{ fmt(store.payslip.hours_worked) }}</b></div>
          </div>

          <p class="s1-grp">{{ $t('salary1c.accruals') }}</p>
          <n-table :single-line="false" size="small">
            <thead><tr>
              <th class="w-[80px]">{{ $t('salary1c.code') }}</th>
              <th>{{ $t('salary1c.rowName') }}</th>
              <th class="text-right! w-[140px]">{{ $t('salary1c.amount') }}</th>
            </tr></thead>
            <tbody>
              <tr v-for="(a, i) in store.payslip.accruals" :key="'a' + i">
                <td>{{ a.paying_code || '—' }}</td>
                <td>{{ a.paying_name }}</td>
                <td class="text-right! tnum">{{ fmt(a.summa) }}</td>
              </tr>
              <tr>
                <td colspan="2" class="font-semibold">{{ $t('salary1c.accrual') }}</td>
                <td class="text-right! tnum font-semibold">{{ fmt(store.payslip.accrual_total) }}</td>
              </tr>
            </tbody>
          </n-table>

          <p class="s1-grp mt-4">{{ $t('salary1c.deductions') }}</p>
          <n-table :single-line="false" size="small">
            <thead><tr>
              <th class="w-[80px]">{{ $t('salary1c.code') }}</th>
              <th>{{ $t('salary1c.rowName') }}</th>
              <th class="text-right! w-[140px]">{{ $t('salary1c.amount') }}</th>
            </tr></thead>
            <tbody>
              <tr v-for="(d, i) in store.payslip.deductions" :key="'d' + i">
                <td>{{ d.paying_code || 'НДФЛ' }}</td>
                <td>{{ d.paying_name }}</td>
                <td class="text-right! tnum">{{ fmt(d.summa) }}</td>
              </tr>
              <tr>
                <td colspan="2" class="font-semibold">{{ $t('salary1c.deduction') }}</td>
                <td class="text-right! tnum font-semibold">{{ fmt(store.payslip.deduction_total) }}</td>
              </tr>
            </tbody>
          </n-table>

          <div class="s1-net"><span>{{ $t('salary1c.net') }}</span><b class="text-primary">{{ fmt(store.payslip.net_total) }}</b></div>
        </div>
      </n-spin>
    </UIModal>

    <!-- Tarix modal -->
    <UIModal :width="'720px'" :visible="store.historyVisible" @update:visible="(v) => (store.historyVisible = v)"
      :title="$t('salary1c.history')">
      <n-spin :show="store.historyLoading">
        <div v-if="store.historyEmp" class="min-h-[100px]">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs text-textColor3">PINFL {{ store.historyEmp.pinfl }} · {{ store.params.year }}/{{ store.params.month }}</p>
            <div class="flex items-center gap-2">
              <span class="text-xs text-textColor3">{{ $t('salary1c.compareHint') }}</span>
              <n-button size="small" type="primary" :disabled="store.compareSelection.length !== 2"
                @click="store._compareHistory()">
                {{ $t('salary1c.compare') }}
              </n-button>
            </div>
          </div>
          <p class="font-semibold text-base -mt-1 mb-2">{{ store.historyEmp.fio }}</p>

          <n-table :single-line="false" size="small">
            <thead><tr>
              <th class="w-[40px]"></th>
              <th class="w-[70px]">{{ $t('salary1c.version') }}</th>
              <th class="w-[90px]">{{ $t('salary1c.status') }}</th>
              <th>{{ $t('salary1c.syncedAt') }}</th>
              <th class="text-right! w-[140px]">{{ $t('salary1c.net') }}</th>
              <th class="w-[60px]"></th>
            </tr></thead>
            <tbody>
              <tr v-for="v in store.history" :key="v.id">
                <td class="text-center!">
                  <n-checkbox :checked="store.compareSelection.includes(v.id)"
                    :disabled="store.compareSelection.length >= 2 && !store.compareSelection.includes(v.id)"
                    @update:checked="store._toggleCompareSelect(v.id)" />
                </td>
                <td>v{{ v.version }}</td>
                <td>
                  <n-tag :type="v.is_current ? 'success' : 'default'" size="tiny" round>
                    {{ v.is_current ? $t('salary1c.current') : $t('salary1c.archived') }}
                  </n-tag>
                </td>
                <td class="text-xs">
                  <span class="tnum">{{ (v.valid_from || v.first_synced_at || '').slice(0, 16) }}</span>
                  <span v-if="v.valid_to" class="text-textColor3">
                    → {{ $t('salary1c.until') }} {{ (v.valid_to || '').slice(0, 16) }}
                  </span>
                </td>
                <td class="text-right! tnum">{{ fmt(v.net_total) }}</td>
                <td class="text-center!">
                  <n-button size="tiny" quaternary @click="store._payslip(v.id)" :title="$t('salary1c.payslip')">
                    <template #icon><n-icon><Eye16Regular /></n-icon></template>
                  </n-button>
                </td>
              </tr>
              <tr v-if="!store.historyLoading && !store.history.length">
                <td colspan="6" class="text-center! text-textColor3">{{ $t('salary1c.noData') }}</td>
              </tr>
            </tbody>
          </n-table>
        </div>
      </n-spin>
    </UIModal>

    <!-- Versiya solishtirish (v1 → v2 farqi) -->
    <UIModal :width="'760px'" :visible="store.compareVisible"
      @update:visible="(v) => (store.compareVisible = v)" :title="$t('salary1c.compareTitle')">
      <n-spin :show="store.compareLoading">
        <div v-if="store.compareData" class="min-h-[100px]">
          <p class="font-semibold text-base">{{ store.compareData.fio }}</p>
          <p class="text-xs text-textColor3 mb-3">
            PINFL {{ store.compareData.pinfl }} ·
            <span class="font-semibold">v{{ store.compareData.from.version }}</span> →
            <span class="font-semibold">v{{ store.compareData.to.version }}</span>
          </p>

          <!-- Skalyar (umumiy) maydonlar -->
          <template v-if="store.compareData.fields.length">
            <p class="s1-cmp-sec">{{ $t('salary1c.generalFields') }}</p>
            <n-table :single-line="false" size="small" class="mb-3">
              <thead><tr>
                <th>{{ $t('salary1c.field') }}</th>
                <th class="text-right!">v{{ store.compareData.from.version }}</th>
                <th class="text-right!">v{{ store.compareData.to.version }}</th>
                <th class="text-right! w-[140px]">{{ $t('salary1c.diff') }}</th>
              </tr></thead>
              <tbody>
                <tr v-for="(f, i) in store.compareData.fields" :key="'f' + i">
                  <td>{{ fieldLabel(f.field) }}</td>
                  <td class="text-right! tnum">{{ isNum(f.from) ? fmt(f.from) : (f.from || '—') }}</td>
                  <td class="text-right! tnum">{{ isNum(f.to) ? fmt(f.to) : (f.to || '—') }}</td>
                  <td class="text-right! tnum font-semibold" :class="diffClass(f.diff)">
                    {{ f.diff == null ? '—' : signed(f.diff) }}
                  </td>
                </tr>
              </tbody>
            </n-table>
          </template>

          <!-- Hisoblangan (accruals) farqi -->
          <template v-if="store.compareData.accruals.length">
            <p class="s1-cmp-sec">{{ $t('salary1c.accruals') }}</p>
            <n-table :single-line="false" size="small" class="mb-3">
              <thead><tr>
                <th class="w-[80px]">{{ $t('salary1c.code') }}</th>
                <th>{{ $t('salary1c.rowName') }}</th>
                <th class="text-right!">v{{ store.compareData.from.version }}</th>
                <th class="text-right!">v{{ store.compareData.to.version }}</th>
                <th class="text-right! w-[130px]">{{ $t('salary1c.diff') }}</th>
                <th class="w-[100px]">{{ $t('salary1c.status') }}</th>
              </tr></thead>
              <tbody>
                <tr v-for="(a, i) in store.compareData.accruals" :key="'ca' + i">
                  <td class="tnum">{{ a.paying_code || '—' }}</td>
                  <td class="text-xs">{{ a.paying_name || '—' }}</td>
                  <td class="text-right! tnum">{{ fmt(a.from) }}</td>
                  <td class="text-right! tnum">{{ fmt(a.to) }}</td>
                  <td class="text-right! tnum font-semibold" :class="diffClass(a.diff)">{{ signed(a.diff) }}</td>
                  <td><n-tag :type="cmpStatusType(a.status)" size="tiny" round>{{ cmpStatusLabel(a.status) }}</n-tag></td>
                </tr>
              </tbody>
            </n-table>
          </template>

          <!-- Ushlangan (deductions) farqi -->
          <template v-if="store.compareData.deductions.length">
            <p class="s1-cmp-sec">{{ $t('salary1c.deductions') }}</p>
            <n-table :single-line="false" size="small" class="mb-3">
              <thead><tr>
                <th class="w-[80px]">{{ $t('salary1c.code') }}</th>
                <th>{{ $t('salary1c.rowName') }}</th>
                <th class="text-right!">v{{ store.compareData.from.version }}</th>
                <th class="text-right!">v{{ store.compareData.to.version }}</th>
                <th class="text-right! w-[130px]">{{ $t('salary1c.diff') }}</th>
                <th class="w-[100px]">{{ $t('salary1c.status') }}</th>
              </tr></thead>
              <tbody>
                <tr v-for="(d, i) in store.compareData.deductions" :key="'cd' + i">
                  <td class="tnum">{{ d.paying_code || '—' }}</td>
                  <td class="text-xs">{{ d.paying_name || '—' }}</td>
                  <td class="text-right! tnum">{{ fmt(d.from) }}</td>
                  <td class="text-right! tnum">{{ fmt(d.to) }}</td>
                  <td class="text-right! tnum font-semibold" :class="diffClass(d.diff)">{{ signed(d.diff) }}</td>
                  <td><n-tag :type="cmpStatusType(d.status)" size="tiny" round>{{ cmpStatusLabel(d.status) }}</n-tag></td>
                </tr>
              </tbody>
            </n-table>
          </template>

          <div v-if="!cmpHasChanges" class="text-center! text-textColor3 py-4">
            {{ $t('salary1c.noChanges') }}
          </div>
        </div>
      </n-spin>
    </UIModal>

    <!-- Ko'p korxonadan 1C tortish (fon job) -->
    <UIModal :width="'720px'" :visible="store.pullModalVisible"
      @update:visible="(v) => (store.pullModalVisible = v)" :title="$t('salary1c.pullTitle')">
      <n-spin :show="store.pullSelectLoading">
        <div class="min-h-[220px]">
          <!-- Davr: job ketyotgan bo'lsa job davri, aks holda modal ichida tanlanadi -->
          <div v-if="store.pullJob" class="text-xs text-textColor3 mb-3">
            {{ $t('salary1c.period') }}: {{ store.pullJob.year }}/{{ store.pullJob.month }} · {{ $t('salary1c.pullableHint') }}
          </div>
          <div v-else class="flex items-center gap-2 mb-3">
            <span class="text-xs text-textColor3 shrink-0">{{ $t('salary1c.period') }}:</span>
            <div class="w-44 shrink-0">
              <UIYearMonth v-model:year="store.pullPeriod.year" v-model:month="store.pullPeriod.month"
                :clearable="false" />
            </div>
            <span class="text-xs text-textColor3">· {{ $t('salary1c.pullableHint') }}</span>
          </div>

          <!-- JOB ko'rinishi (jarayonda / tugagan) -->
          <template v-if="store.pullJob">
            <div class="mb-3">
              <div class="flex justify-between text-xs mb-1">
                <span>{{ pullProcessed }} / {{ pullTotal }}</span>
                <span>
                  <span class="text-success">✓ {{ pullOkCount }}</span>
                  <span v-if="pullErrCount" class="text-error ml-3">✕ {{ pullErrCount }}</span>
                </span>
              </div>
              <n-progress type="line" :percentage="pullPct" :processing="pullRunning"
                :status="pullErrCount ? 'warning' : 'success'" :height="8" />
              <p v-if="pullRunning" class="text-xs text-textColor3 mt-1">{{ $t('salary1c.pullBg') }}</p>
            </div>
            <div class="s1-pull-list">
              <div v-for="it in pullItems" :key="it.organization_id" class="s1-pull-row"
                :class="{ 's1-pull-row--err': it.status === 'error', 's1-pull-row--done': it.status === 'done' }">
                <div class="flex-1 min-w-0">
                  <div class="truncate text-sm">{{ it.name }}</div>
                  <div class="text-xs text-textColor3">{{ it.ones_org_code }}</div>
                </div>
                <div class="s1-pull-status">
                  <n-spin v-if="it.status === 'loading'" :size="14" />
                  <span v-else-if="it.status === 'done'" class="text-xs text-success tnum">
                    +{{ it.added ?? 0 }} · ~{{ it.changed ?? 0 }} · ={{ it.unchanged ?? 0 }}
                  </span>
                  <n-tooltip v-else-if="it.status === 'error'" trigger="hover">
                    <template #trigger><span class="text-xs text-error cursor-help">✕ {{ $t('salary1c.pullErr') }}</span></template>
                    {{ it.error }}
                  </n-tooltip>
                  <n-tooltip v-else-if="it.status === 'cancelled'" trigger="hover">
                    <template #trigger><span class="text-xs text-textColor3 cursor-help">⊘ {{ $t('salary1c.pullCancelled') }}</span></template>
                    {{ it.error }}
                  </n-tooltip>
                  <span v-else class="text-xs text-textColor3">{{ $t('salary1c.pullPending') }}</span>
                </div>
              </div>
            </div>
          </template>

          <!-- TANLASH ko'rinishi -->
          <template v-else>
            <n-input v-model:value="pullOrgSearch" clearable size="small" class="mb-2"
              :placeholder="$t('salary1c.searchOrg')">
              <template #prefix><n-icon><Search24Regular /></n-icon></template>
            </n-input>
            <div class="flex items-center justify-between mb-2">
              <n-checkbox v-model:checked="allSelected">
                {{ $t('content.selectAll') }} ({{ pullSelectFiltered.length }})
              </n-checkbox>
              <span class="text-xs text-textColor3">{{ $t('salary1c.selected') }}: {{ pullSelectedCount }}</span>
            </div>
            <div class="s1-pull-list">
              <div v-for="o in pullSelectFiltered" :key="o.organization_id" class="s1-pull-row">
                <n-checkbox v-model:checked="o.selected" />
                <div class="flex-1 min-w-0">
                  <div class="truncate text-sm">{{ o.name }}</div>
                  <div class="text-xs text-textColor3">{{ o.ones_org_code }}</div>
                </div>
              </div>
              <div v-if="!pullSelectFiltered.length" class="s1-pull-row text-textColor3 text-xs justify-center">
                {{ $t('salary1c.noData') }}
              </div>
            </div>
          </template>
        </div>
      </n-spin>
      <template #footer>
        <div class="flex items-center justify-between px-4 py-3">
          <span v-if="pullFinished" class="text-sm font-medium"
            :class="pullErrCount ? 'text-warning' : 'text-success'">
            {{ $t('salary1c.pullFinished') }}
          </span>
          <span v-else-if="pullCancelled" class="text-sm font-medium text-textColor3">
            {{ $t('salary1c.pullCancelledMsg') }}
          </span>
          <span v-else></span>
          <div class="flex gap-2">
            <n-button @click="store.pullModalVisible = false">{{ $t('content.close') }}</n-button>
            <n-button v-if="pullEnded && pullErrCount" :loading="store.pullLogExporting"
              @click="store._exportPullLog(store.pullJob?.year, store.pullJob?.month, 'error')">
              <template #icon><n-icon><ArrowDownload24Regular /></n-icon></template>
              {{ $t('salary1c.export') }}
            </n-button>
            <n-button v-if="pullEnded" type="primary" @click="store._resetPullJob()">
              {{ $t('salary1c.pullAgain') }}
            </n-button>
            <n-button v-else-if="!store.pullJob" type="primary" :disabled="!pullSelectedCount"
              @click="store._runBatchPull()">
              <template #icon><n-icon><CloudArrowDown24Regular /></n-icon></template>
              {{ $t('salary1c.pull') }}
            </n-button>
            <n-button v-else type="error" ghost :loading="store.pullCancelling"
              @click="store._cancelJob()">
              {{ $t('salary1c.pullCancel') }}
            </n-button>
          </div>
        </div>
      </template>
    </UIModal>

    <!-- Tortish tarixi (pull-log) -->
    <UIModal :width="'900px'" :visible="store.pullLogModalVisible"
      @update:visible="(v) => (store.pullLogModalVisible = v)" :title="$t('salary1c.pullLog')">
      <n-spin :show="store.pullLogLoading">
        <div class="min-h-[220px]">
          <div class="flex items-center flex-wrap gap-2 mb-3">
            <n-select size="small" class="w-40" :value="store.pullLogStatus" :options="pullLogStatusOptions"
              clearable :placeholder="$t('salary1c.all')" @update:value="onPullLogStatus" />
            <n-input size="small" class="w-56" v-model:value="pullLogSearchLocal" clearable
              :placeholder="$t('salary1c.searchOrg')" @update:value="onPullLogSearch">
              <template #prefix><n-icon><Search24Regular /></n-icon></template>
            </n-input>
            <n-button size="small" secondary type="primary" class="ml-auto" :loading="store.pullLogExporting"
              :disabled="!store.pullLogRows.length" @click="store._exportPullLog()">
              <template #icon><n-icon><ArrowDownload24Regular /></n-icon></template>
              {{ $t('salary1c.export') }}
            </n-button>
          </div>
          <div class="w-full overflow-x-auto" v-if="store.pullLogRows.length">
            <n-table :single-line="false" size="small">
              <thead>
                <tr>
                  <th class="text-center! w-[56px]">{{ $t('salary1c.rowNo') }}</th>
                  <th class="min-w-[220px]">{{ $t('salary1c.organization') }}</th>
                  <th class="w-[110px]">{{ $t('salary1c.orgCode') }}</th>
                  <th class="text-center! w-[80px]">{{ $t('salary1c.period') }}</th>
                  <th class="text-center! w-[90px]">{{ $t('salary1c.statusLabel') }}</th>
                  <th class="w-[140px]">{{ $t('salary1c.pulledAt') }}</th>
                  <th class="text-right! w-[100px]">{{ $t('salary1c.duration') }}</th>
                  <th class="min-w-[240px]">{{ $t('salary1c.errorMsg') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(e, i) in store.pullLogRows" :key="e.id">
                  <td class="text-center! text-textColor3">
                    {{ (store.pullLogParams.page - 1) * store.pullLogParams.per_page + i + 1 }}
                  </td>
                  <td>{{ e.organization_name || ('#' + e.organization_id) }}</td>
                  <td>{{ e.ones_org_code }}</td>
                  <td class="text-center! tnum">{{ e.year }}/{{ e.month }}</td>
                  <td class="text-center!">
                    <UIBadge :label="e.status === 'done' ? $t('salary1c.stDone') : $t('salary1c.stError')"
                      :type="e.status === 'done' ? Utils.colorTypes.success : Utils.colorTypes.error"
                      :show-icon="false" paddingY="py-0.5" />
                  </td>
                  <td class="text-xs text-textColor3">{{ (e.created_at || '').slice(0, 16) }}</td>
                  <td class="text-right! tnum text-xs">{{ fmtDur(e.duration_ms) }}</td>
                  <td class="text-xs" :class="e.status === 'error' ? 'text-error' : 'text-textColor3'">
                    <template v-if="e.status === 'done'">
                      +{{ e.added_count ?? 0 }} · ~{{ e.changed_count ?? 0 }} · ={{ e.unchanged_count ?? 0 }}
                    </template>
                    <template v-else>{{ e.error_message }}</template>
                  </td>
                </tr>
              </tbody>
            </n-table>
          </div>
          <NoDataPicture v-if="!store.pullLogLoading && !store.pullLogRows.length" />

          <div v-if="store.pullLogTotal > store.pullLogParams.per_page" class="mt-3">
            <UIPagination :total="store.pullLogTotal" :page="store.pullLogParams.page"
              :per_page="store.pullLogParams.per_page" @changePage="store.onPullLogPage" />
          </div>
        </div>
      </n-spin>
    </UIModal>
  </UIPageContent>
</template>

<style scoped>
  .s1-filter {
    background: var(--surface-ground, rgba(148, 163, 184, 0.06));
    border: 1px solid var(--surface-line, #e5e7eb); border-radius: 16px; padding: 14px 16px;
  }
  .s1-lbl { display: block; font-size: 11px; color: var(--textColor3, #98a2b3); margin-bottom: 3px; }
  .s1-seg { max-width: 560px; }

  /* «1C dan tortish» tugmasi jarayonда — strelka bulutga «tushib» yo'qoladi (download) */
  .s1-dl-arrow {
    animation: s1-dl-arrow 1.15s cubic-bezier(0.45, 0, 0.55, 1) infinite;
    transform-box: fill-box;
    transform-origin: center;
  }
  @keyframes s1-dl-arrow {
    0% { transform: translateY(-3.5px); opacity: 0; }
    30% { opacity: 1; }
    70% { opacity: 1; }
    100% { transform: translateY(3.5px); opacity: 0; }
  }

  /* Summary — statistik kartalar */
  .s1-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
  .s1-stat {
    display: flex; flex-direction: column; gap: 4px; padding: 12px 14px;
    border: 1px solid var(--surface-line, #e5e7eb); border-radius: 12px;
    background: var(--surface-section, #ffffff);
  }
  .s1-stat--net { background: var(--color-brand-surface, #eff8ff); border-color: transparent; }
  .s1-stat--warn { cursor: pointer; background: rgba(231, 0, 10, 0.10); border-color: rgba(231, 0, 10, 0.30); transition: box-shadow .15s; }
  .s1-stat--warn .s1-stat-val { color: var(--danger-color, #dc2626); }
  .s1-stat--warn:hover { box-shadow: 0 0 0 2px rgba(231, 0, 10, 0.30) inset; }
  .s1-stat--active { box-shadow: 0 0 0 2px var(--danger-color, #dc2626) inset; }
  .s1-stat-lbl { font-size: 11px; color: var(--textColor3, #98a2b3); }
  .s1-stat-val { font-size: 16px; font-weight: 700; color: var(--textColor1, #101828); font-variant-numeric: tabular-nums; }
  /* Tizimda yo'q xodim qatori */
  :deep(.s1-row-out > td) { background: rgba(231, 0, 10, 0.08); }

  /* Daraxtda «1C kodi bor» belgisi */
  .s1-1c-dot {
    display: inline-block; width: 7px; height: 7px; border-radius: 50%;
    background: var(--primary-color, #1279f0); margin-left: 6px; vertical-align: middle;
    box-shadow: 0 0 0 2px var(--color-brand-surface, #eff8ff);
  }

  /* Batch pull ro'yxati */
  .s1-pull-list { max-height: 360px; overflow-y: auto; border: 1px solid var(--surface-line, #e5e7eb); border-radius: 10px; }
  .s1-pull-row { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-bottom: 1px solid var(--surface-line, #eef0f3); }
  .s1-pull-row:last-child { border-bottom: none; }
  .s1-pull-row--done { background: rgba(45, 203, 115, 0.12); }
  .s1-pull-row--err { background: rgba(231, 0, 10, 0.10); }
  .s1-pull-status { min-width: 130px; text-align: right; }

  /* Jadval maydoni scroll bo'lib, pagination pastda qotib turadi */
  .s1-scroll { flex: 1 1 auto; min-height: 0; overflow-y: auto; }
  .s1-pager { border-top: 1px solid var(--surface-line, #e5e7eb); padding-top: 4px; }
  .tnum { font-variant-numeric: tabular-nums; }
  .s1-grp { font-size: 12px; font-weight: 700; color: var(--textColor2, #475467); margin-bottom: 4px; }
  .s1-net { display: flex; justify-content: space-between; padding: 8px 12px; margin-top: 10px; background: var(--color-brand-surface, #eff8ff); border-radius: 10px; font-weight: 700; }
  .s1-pinfo { display: flex; gap: 10px; margin-bottom: 14px; }
  .s1-pinfo > div { flex: 1; display: flex; flex-direction: column; gap: 2px; padding: 8px 12px; border: 1px solid var(--surface-line, #e5e7eb); border-radius: 10px; }
  .s1-pinfo-lbl { font-size: 11px; color: var(--textColor3, #98a2b3); }
  .s1-pinfo b { font-size: 15px; color: var(--textColor1, #101828); }
  .s1-cmp-sec { font-size: 13px; font-weight: 600; margin: 6px 0 4px; color: var(--textColor2, #475467); }

  /* Ved kesimida — kartalar (tizim dizayni) */
  .s1-ved-wrap { align-items: start; }
  .s1-card {
    display: flex; flex-direction: column; overflow: hidden;
    border: 1px solid var(--surface-line, #e5e7eb); border-radius: 16px;
    background: var(--surface-section, #ffffff);
    box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
  }
  .s1-card-hd {
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
    padding: 10px 14px; border-bottom: 1px solid var(--surface-line, #e5e7eb);
    background: var(--surface-ground, rgba(148, 163, 184, 0.04));
  }
  .s1-card-title { font-size: 13px; font-weight: 700; color: var(--textColor2, #475467); }
  /* Ved ro'yxati sarlavha paneli — tor ekranda toza o'raladi (input+tugmalar birga) */
  .s1-ved-hd { flex-wrap: wrap; row-gap: 8px; }
  .s1-ved-tools { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
  /* Jadval — cheklangan balandlik + ichki scroll + sticky sarlavha */
  .s1-ved-box { max-height: 560px; overflow: auto; }
  .s1-ved-box :deep(thead th) {
    position: sticky; top: 0; z-index: 2;
    background: var(--surface-section, #ffffff);
  }
  .s1-ved-row { cursor: pointer; transition: background .12s; }
  .s1-ved-row:hover > :deep(td) { background: var(--surface-ground, #f6f8fb); }
  .s1-ved-row--sel > :deep(td) { background: var(--color-brand-surface, #eff8ff) !important; }
  .s1-ved-foot > :deep(td) {
    position: sticky; bottom: 0; z-index: 2; font-weight: 700;
    background: var(--surface-ground, #f2f6fc); border-top: 2px solid var(--surface-line, #e5e7eb);
  }
  .s1-chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 14px; border-bottom: 1px solid var(--surface-line, #eef0f3); }
  .s1-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 10px; min-height: 260px; padding: 30px 20px; text-align: center;
    color: var(--textColor3, #98a2b3); font-size: 13px;
  }
  .s1-pager--pad { padding: 8px 14px; }

  /* Natija modali — matritsa: to'liq balandlik, faqat jadval scroll (banner+thead qotadi) */
  .s1-matrix-wrap { display: flex; flex-direction: column; height: 100%; gap: 12px; }
  .s1-spin-fill { flex: 1 1 auto; min-height: 0; }
  .s1-spin-fill :deep(.n-spin-container),
  .s1-spin-fill :deep(.n-spin-content) { height: 100%; }
  .s1-matrix-box { height: 100%; overflow: auto; border: 1px solid var(--surface-line, #e5e7eb); border-radius: 12px; }
  .s1-matrix-box :deep(thead th) {
    position: sticky; top: 0; z-index: 2; background: var(--surface-ground, #f6f8fb);
  }
  .s1-sticky-col { position: sticky; left: 0; z-index: 1; background: var(--surface-section, #ffffff); }
  .s1-matrix-box :deep(thead th.s1-sticky-col) { z-index: 3; }
  .s1-matrix-box :deep(.s1-ved-foot .s1-sticky-col) { background: var(--surface-ground, #f2f6fc); }
  .s1-col-name { font-size: 10px; font-weight: 400; color: var(--textColor3, #98a2b3); line-height: 1.1; }

  /* Solishtirish */
  .s1-rec-info { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; font-size: 14px; font-weight: 600; color: var(--textColor1, #101828); }
  .s1-rec-diff > :deep(td) { background: rgba(253, 199, 0, 0.14); }
  /* «Bizniki» drill-down — bosiladigan summa */
  .s1-drill { color: var(--primary-color, #1279f0); cursor: pointer; text-decoration: underline dotted; text-underline-offset: 3px; }
  .s1-drill:hover { text-decoration: underline; }
</style>
