<script setup>
  import { History24Regular, Link24Regular, Money24Regular, ReceiptMoney24Regular } from '@vicons/fluent'
  import { UIMenuButton, UIModal, UIPageContent, UIPageFilter, UIPagination } from '@/components/index.js'
  import { useAccountStore, useTariffGridStore, useTariffBaseStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import GridForm from './ui/GridForm.vue'
  import ViewModal from './ui/ViewModal.vue'
  import HistoryModal from './ui/HistoryModal.vue'
  import CompareModal from './ui/CompareModal.vue'
  import ScopeModal from './ui/ScopeModal.vue'
  import ApplyModal from './ui/ApplyModal.vue'
  import ApplyLogsModal from './ui/ApplyLogsModal.vue'
  import BaseForm from './ui/BaseForm.vue'
  import BaseViewModal from './ui/BaseViewModal.vue'
  import Utils from '@/utils/Utils.js'

  const { t } = i18n.global
  const store = useTariffGridStore()
  const baseStore = useTariffBaseStore()
  const accStore = useAccountStore()

  const activeTab = ref('grids') // 'grids' | 'bases'
  // Setka tabi uchun — qo'shimcha "Lavozimlarga qo'llash" + "Qo'llash tarixi".
  const gridExtraOptions = computed(() => [
    { label: t('tariffGrid.action.scope'), key: 'scope', icon: Link24Regular },
    { label: t('tariffGrid.action.history'), key: 'history', icon: History24Regular },
    { label: t('tariffGrid.apply.title'), key: 'apply', icon: Money24Regular },
    { label: t('tariffGrid.applyLog.title'), key: 'apply-logs', icon: ReceiptMoney24Regular }
  ])
  // Baza tabi uchun — tarix + "Lavozimlarga qo'llash" + "Qo'llash tarixi".
  const baseExtraOptions = computed(() => [
    { label: t('tariffGrid.action.history'), key: 'history', icon: History24Regular },
    { label: t('tariffGrid.apply.title'), key: 'apply', icon: Money24Regular },
    { label: t('tariffGrid.applyLog.title'), key: 'apply-logs', icon: ReceiptMoney24Regular }
  ])

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.economist)) return
    store._index()
    baseStore._index()
  })

  // --- Setkalar ---
  const filterEvent = () => {
    store.params.page = 1
    store._index()
  }
  const onChangePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }
  const openView = (id) => {
    if (!accStore.checkAction(accStore.pn.economist)) return
    store.openView(id)
  }
  const onSelect = (v) => {
    const row = v.data
    if (v.key === Utils.ActionTypes.view) openView(row.id)
    else if (v.key === 'scope') store.openScope(row.id, row.name)
    else if (v.key === 'history') store.openHistory(row.id, row.name)
    else if (v.key === 'apply') {
      if (!accStore.checkAction(accStore.pn.economist)) return
      store.openApply(row.id, row.name, 'grid')
    } else if (v.key === 'apply-logs') {
      if (!accStore.checkAction(accStore.pn.economist)) return
      store.openApplyLogs(row.id, row.name, 'grid')
    } else if (v.key === Utils.ActionTypes.download) store._excel(row.id)
    else if (v.key === Utils.ActionTypes.delete) store._delete(row.id)
  }

  // --- Bazalar ---
  const baseFilterEvent = () => {
    baseStore.params.page = 1
    baseStore._index()
  }
  const onBaseChangePage = (v) => {
    baseStore.params.page = v.page
    baseStore.params.per_page = v.per_page
    baseStore._index()
  }
  const openBaseView = (id) => {
    if (!accStore.checkAction(accStore.pn.economist)) return
    baseStore.openView(id)
  }
  const onBaseSelect = (v) => {
    const row = v.data
    if (v.key === Utils.ActionTypes.view) openBaseView(row.id)
    else if (v.key === 'history') baseStore.openHistory(row.id)
    else if (v.key === 'apply') {
      if (!accStore.checkAction(accStore.pn.economist)) return
      store.openApply(row.id, row.name, 'base')
    } else if (v.key === 'apply-logs') {
      if (!accStore.checkAction(accStore.pn.economist)) return
      store.openApplyLogs(row.id, row.name, 'base')
    } else if (v.key === Utils.ActionTypes.edit) baseStore.startEditMeta(row)
    else if (v.key === Utils.ActionTypes.delete) baseStore._delete(row.id)
  }

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.economist)) return
    if (activeTab.value === 'grids') store.startCreate()
    else baseStore.startCreate()
  }

  const fmtNum = (v) => (v === null || v === undefined ? '—' : Number(v).toLocaleString('ru-RU'))
  const fmtDT = (s) => {
    if (!s) return '—'
    return String(s).replace('T', ' ').slice(0, 16)
  }
  const viewTitle = computed(() => store.detail?.name ?? t('tariffGrid.detailTitle'))
  const historyTitle = computed(
    () => `${store.historyGridName || t('tariffGrid.detailTitle')} — ${t('tariffGrid.action.history')}`
  )
  const scopeTitle = computed(
    () => `${store.scopeGridName || t('tariffGrid.detailTitle')} — ${t('tariffGrid.action.scope')}`
  )
  const applyTitle = computed(
    () => `${store.applyGridName || t('tariffGrid.detailTitle')} — ${t('tariffGrid.apply.title')}`
  )
  const applyLogsTitle = computed(
    () => `${store.applyLogsName || t('tariffGrid.detailTitle')} — ${t('tariffGrid.applyLog.title')}`
  )
  const baseViewTitle = computed(() => {
    const name = baseStore.detail?.name ?? t('tariffBase.title')
    return baseStore.viewMode === 'history' ? `${name} — ${t('tariffGrid.action.history')}` : name
  })
</script>

<template>
  <UIPageContent>
    <div class="mb-3">
      <n-tabs type="segment" v-model:value="activeTab" size="small" class="tg-seg">
        <n-tab-pane name="grids" :tab="$t('tariffBase.tab.grids')" />
        <n-tab-pane name="bases" :tab="$t('tariffBase.tab.bases')" />
      </n-tabs>
    </div>

    <!-- ============ SETKALAR ============ -->
    <template v-if="activeTab === 'grids'">
      <UIPageFilter :show-filter-button="false" v-model:search="store.params.search" @onSearch="filterEvent" @onAdd="onAdd" />
      <n-spin :show="store.loading">
        <div class="flex flex-col gap-3 mt-4">
          <div v-for="g in store.list" :key="g.id" class="tg-card">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-base font-semibold text-primary cursor-pointer" @click="openView(g.id)">{{ g.name }}</span>
                  <n-tag :type="g.active ? 'success' : 'default'" size="small" round>
                    {{ g.active ? $t('content.active') : $t('tariffGrid.inactive') }}
                  </n-tag>
                  <n-tag v-if="g.pending" type="warning" size="small" round>{{ $t('tariffGrid.status.pending') }}</n-tag>
                </div>
                <p v-if="g.note" class="text-xs text-surface-500 mt-0.5 line-clamp-1">{{ g.note }}</p>
                <div class="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm">
                  <span class="text-surface-500">{{ $t('tariffGrid.table.baseAmount') }}:
                    <b class="text-surface-800">{{ fmtNum(g.base_amount) }}</b> <span class="text-xs">so'm</span></span>
                  <span class="text-surface-500">{{ $t('tariffGrid.table.version') }}:
                    <b class="text-surface-800">v{{ g.version ?? '—' }}</b></span>
                  <span class="text-surface-500">{{ $t('tariffGrid.table.effectiveDate') }}:
                    <b class="text-surface-800">{{ g.effective_date ?? '—' }}</b></span>
                </div>
                <div class="text-xs text-surface-400 mt-1.5">
                  {{ $t('tariffGrid.table.createdBy') }}:
                  <b class="text-surface-600">{{ g.created_by_name || $t('tariffGrid.table.system') }}</b>
                  <span v-if="g.created_at"> · {{ fmtDT(g.created_at) }}</span>
                </div>
              </div>
              <UIMenuButton @selectEv="onSelect" show-view show-download :extra-options="gridExtraOptions" :data="g" />
            </div>
          </div>
          <n-empty v-if="!store.loading && !store.list.length" :description="$t('tariffGrid.noData')" class="py-10" />
        </div>
      </n-spin>
      <div v-if="store.totalItems > store.params.per_page" class="mt-4 flex justify-end">
        <UIPagination :total="store.totalItems" :page="store.params.page" :per_page="store.params.per_page" @changePage="onChangePage" />
      </div>
    </template>

    <!-- ============ BAZA MIQDORLARI ============ -->
    <template v-else>
      <UIPageFilter :show-filter-button="false" v-model:search="baseStore.params.search" @onSearch="baseFilterEvent" @onAdd="onAdd" />
      <n-spin :show="baseStore.loading">
        <div class="flex flex-col gap-3 mt-4">
          <div v-for="b in baseStore.list" :key="b.id" class="tg-card">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-base font-semibold text-primary cursor-pointer" @click="openBaseView(b.id)">{{ b.name }}</span>
                  <n-tag :type="b.active ? 'success' : 'default'" size="small" round>
                    {{ b.active ? $t('content.active') : $t('tariffGrid.inactive') }}
                  </n-tag>
                  <n-tag v-if="b.pending" type="warning" size="small" round>{{ $t('tariffGrid.status.pending') }}</n-tag>
                </div>
                <p v-if="b.note" class="text-xs text-surface-500 mt-0.5 line-clamp-1">{{ b.note }}</p>
                <div class="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm">
                  <span class="text-surface-500">{{ $t('tariffBase.form.baseAmount') }}:
                    <b class="text-surface-800">{{ fmtNum(b.base_amount) }}</b> <span class="text-xs">so'm</span></span>
                  <span class="text-surface-500">{{ $t('tariffBase.form.minFloor') }}:
                    <b class="text-surface-800">{{ fmtNum(b.min_floor) }}</b></span>
                  <span class="text-surface-500">{{ $t('tariffGrid.table.version') }}:
                    <b class="text-surface-800">v{{ b.version ?? '—' }}</b></span>
                  <span class="text-surface-500">{{ $t('tariffGrid.table.effectiveDate') }}:
                    <b class="text-surface-800">{{ b.effective_date ?? '—' }}</b></span>
                </div>
              </div>
              <UIMenuButton @selectEv="onBaseSelect" show-view show-edit :extra-options="baseExtraOptions" :data="b" />
            </div>
          </div>
          <n-empty v-if="!baseStore.loading && !baseStore.list.length" :description="$t('tariffGrid.noData')" class="py-10" />
        </div>
      </n-spin>
      <div v-if="baseStore.totalItems > baseStore.params.per_page" class="mt-4 flex justify-end">
        <UIPagination :total="baseStore.totalItems" :page="baseStore.params.page" :per_page="baseStore.params.per_page" @changePage="onBaseChangePage" />
      </div>
    </template>

    <!-- Setka: yaratish -->
    <UIModal :width="'94%'" :visible="store.gridVisible" @update:visible="(v) => (store.gridVisible = v)" :title="$t('tariffGrid.createTitle')">
      <GridForm />
    </UIModal>
    <!-- Setka: ko'rish (faqat joriy versiya) -->
    <UIModal :width="'92%'" :visible="store.viewVisible" @update:visible="(v) => (store.viewVisible = v)" :title="viewTitle">
      <ViewModal />
    </UIModal>
    <!-- Setka: versiya tarixi (alohida modal — jadval ro'yxat + sahifalash) -->
    <UIModal :width="'92%'" :visible="store.historyVisible" @update:visible="(v) => (store.historyVisible = v)" :title="historyTitle">
      <HistoryModal />
    </UIModal>

    <UIModal :width="'860px'" :visible="store.compareVisible" @update:visible="(v) => (store.compareVisible = v)" :title="$t('tariffGrid.cmp.title')">
      <CompareModal />
    </UIModal>
    <!-- Setka: korxona/bo'limlarga biriktirish -->
    <UIModal :width="'780px'" :visible="store.scopeVisible" @update:visible="(v) => (store.scopeVisible = v)" :title="scopeTitle">
      <ScopeModal />
    </UIModal>
    <!-- Setka/baza: lavozimlarga qo'llash (ta'sir preview + sabab + hujjat) -->
    <UIModal :width="'92%'" :visible="store.applyVisible" @update:visible="(v) => (store.applyVisible = v)" :title="applyTitle">
      <ApplyModal />
    </UIModal>
    <!-- Setka/baza: qo'llash tarixi (audit jurnali) -->
    <UIModal :width="'820px'" :visible="store.applyLogsVisible" @update:visible="(v) => (store.applyLogsVisible = v)" :title="applyLogsTitle">
      <ApplyLogsModal />
    </UIModal>

    <!-- Baza: yaratish / meta tahrir -->
    <UIModal :width="'640px'" :visible="baseStore.formVisible" @update:visible="(v) => (baseStore.formVisible = v)" :title="$t('tariffBase.title')">
      <BaseForm />
    </UIModal>
    <!-- Baza: ko'rish / tarix -->
    <UIModal :width="'720px'" :visible="baseStore.viewVisible" @update:visible="(v) => (baseStore.viewVisible = v)" :title="baseViewTitle">
      <BaseViewModal />
    </UIModal>
  </UIPageContent>
</template>

<style scoped>
  .tg-seg { max-width: 420px; }
  .tg-card {
    background: var(--surface-section, #fff);
    border: 1px solid var(--surface-line, #e5e7eb);
    border-radius: 16px;
    padding: 14px 18px;
    box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .tg-card:hover {
    border-color: var(--primary-color);
    box-shadow: 0 2px 8px rgba(16, 24, 40, 0.08);
  }
</style>
