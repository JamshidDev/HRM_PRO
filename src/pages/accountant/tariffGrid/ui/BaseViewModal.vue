<script setup>
  // Bazaviy summa KO'RISH + qiymat tahriri (yangi versiya) + versiya tarixi (sana oralig'i) + tasdiqlash.
  import { Edit16Filled } from '@vicons/fluent'
  import { useAccountStore, useTariffBaseStore } from '@/store/modules/index.js'

  const store = useTariffBaseStore()
  const accStore = useAccountStore()

  const shownVersion = computed(() =>
    store.detailEditing ? store.detail?.version : (store.viewVersion ?? store.detail?.version)
  )

  // Tasdiqlangan versiyaning amal muddati: shu sanadan → keyingi tasdiqlangan versiya sanasigacha.
  const rangeUntil = (v) => {
    if (v.status !== 3) return null
    const confirmed = store.versions.filter((x) => x.status === 3)
    const idx = confirmed.findIndex((x) => x.id === v.id)
    return idx > 0 ? confirmed[idx - 1].effective_date : null
  }
  const onEdit = () => {
    if (!accStore.checkAction(accStore.pn.economist)) return
    store.startValueEdit()
  }
  const onConfirm = (v) => {
    if (!accStore.checkAction(accStore.pn.economist)) return
    store._confirmVersion(v.id)
  }

  const fmtNum = (v) => (v === null || v === undefined ? '—' : Number(v).toLocaleString('ru-RU'))
  const fmtInput = (v) => (v === null || v === undefined ? '' : String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' '))
  const parseInput = (s) => {
    const n = (s ?? '').replace(/\s/g, '')
    return n === '' ? null : Number(n)
  }
</script>

<template>
  <n-spin :show="store.detailLoading">
    <div v-if="store.detail" class="min-h-[120px]">
      <!-- Amallar -->
      <div class="flex flex-wrap items-center justify-end gap-2 mb-3">
        <template v-if="!store.detailEditing">
          <n-button size="small" type="primary" @click="onEdit">
            <template #icon><n-icon><Edit16Filled /></n-icon></template>
            {{ $t('tariffBase.action.newValue') }}
          </n-button>
        </template>
        <template v-else>
          <n-button size="small" quaternary @click="store.cancelValueEdit()">{{ $t('content.cancel') }}</n-button>
          <n-button size="small" type="primary" :loading="store.versionSaveLoading" @click="store._storeVersion()">
            {{ $t('content.save') }}
          </n-button>
        </template>
      </div>

      <!-- Meta / tahrir -->
      <div class="tb-meta">
        <div class="tb-meta-item">
          <p class="tb-meta-lbl">{{ $t('tariffBase.form.baseAmount') }}</p>
          <n-input-number v-if="store.detailEditing" class="w-full" size="small"
            v-model:value="store.versionPayload.base_amount" :show-button="false" :min="0"
            :format="fmtInput" :parse="parseInput">
            <template #suffix><span class="text-surface-400 text-xs">so'm</span></template>
          </n-input-number>
          <p v-else class="tb-meta-val">{{ fmtNum(shownVersion?.base_amount) }} <span class="tb-unit">so'm</span></p>
        </div>
        <div class="tb-meta-item">
          <p class="tb-meta-lbl">{{ $t('tariffBase.form.minFloor') }}</p>
          <n-input-number v-if="store.detailEditing" class="w-full" size="small"
            v-model:value="store.versionPayload.min_floor" :show-button="false" :min="0"
            :format="fmtInput" :parse="parseInput">
            <template #suffix><span class="text-surface-400 text-xs">so'm</span></template>
          </n-input-number>
          <p v-else class="tb-meta-val">{{ fmtNum(shownVersion?.min_floor) }} <span v-if="shownVersion?.min_floor" class="tb-unit">so'm</span></p>
        </div>
        <div class="tb-meta-item">
          <p class="tb-meta-lbl">{{ $t('tariffBase.form.effectiveDate') }}</p>
          <n-date-picker v-if="store.detailEditing" class="w-full" size="small" type="date"
            v-model:formatted-value="store.versionPayload.effective_date" value-format="yyyy-MM-dd" />
          <p v-else class="tb-meta-val">{{ shownVersion?.effective_date ?? '—' }}</p>
        </div>
        <div class="tb-meta-item">
          <p class="tb-meta-lbl">{{ $t('tariffGrid.table.version') }}</p>
          <p class="tb-meta-val">v{{ shownVersion?.version ?? '—' }}</p>
        </div>
      </div>

      <div v-if="store.detailEditing" class="mb-3">
        <p class="tb-meta-lbl mb-1">{{ $t('tariffBase.form.note') }}</p>
        <n-input v-model:value="store.versionPayload.note" type="textarea" :rows="2" :placeholder="$t('tariffBase.form.note')" />
      </div>

      <!-- Versiya tarixi (sana oralig'i + tasdiqlash) -->
      <div v-if="store.viewMode === 'history' && !store.detailEditing && store.versions.length" class="mb-2">
        <div class="flex items-center gap-2 mb-1.5">
          <p class="text-xs font-semibold text-surface-600">{{ $t('tariffGrid.versions') }}</p>
          <n-button v-if="store.viewVersion" size="tiny" quaternary @click="store._show(store.elementId)">
            ← {{ $t('tariffGrid.action.backToActive') }}
          </n-button>
        </div>
        <n-spin :show="store.versionsLoading">
          <div class="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto pr-1">
            <div v-for="v in store.versions" :key="v.id"
              class="tb-ver" :class="{ 'tb-ver-active': shownVersion && shownVersion.version === v.version }"
              @click="store._version(store.elementId, v.id)">
              <div class="flex items-center gap-2 min-w-0">
                <span class="font-semibold shrink-0">v{{ v.version }}</span>
                <n-tag v-if="v.status === 1" type="warning" size="tiny" round>{{ $t('tariffGrid.status.pending') }}</n-tag>
                <n-tag v-else-if="v.is_active" type="success" size="tiny" round>{{ $t('content.active') }}</n-tag>
                <n-tag v-else type="default" size="tiny" round>{{ $t('tariffGrid.status.confirmed') }}</n-tag>
                <span class="text-xs text-surface-600 shrink-0 font-medium">{{ fmtNum(v.base_amount) }} so'm</span>
                <span class="text-xs text-surface-500 truncate">
                  <template v-if="v.status === 1">{{ $t('tariffGrid.form.effectiveDate') }}: {{ v.effective_date }}</template>
                  <template v-else>{{ v.effective_date }} → {{ rangeUntil(v) ?? $t('tariffGrid.tillNow') }}</template>
                </span>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <n-button v-if="v.status === 1" size="tiny" type="primary" @click.stop="onConfirm(v)">
                  {{ $t('tariffGrid.action.confirm') }}
                </n-button>
              </div>
            </div>
          </div>
        </n-spin>
      </div>
    </div>
  </n-spin>
</template>

<style scoped>
  .tb-meta {
    display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-bottom: 14px;
  }
  @media (min-width: 768px) { .tb-meta { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
  .tb-meta-item {
    background: var(--surface-ground, rgba(148, 163, 184, 0.06));
    border: 1px solid var(--surface-line, #e5e7eb); border-radius: 12px; padding: 10px 12px;
  }
  .tb-meta-lbl { font-size: 11px; color: var(--textColor3, #98a2b3); margin-bottom: 4px; }
  .tb-meta-val { font-weight: 600; color: var(--textColor1, #101828); font-variant-numeric: tabular-nums; }
  .tb-unit { font-size: 11px; font-weight: 400; color: var(--textColor3, #98a2b3); }
  .tb-ver {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    background: var(--surface-ground, rgba(148, 163, 184, 0.06));
    border: 1px solid transparent; border-radius: 10px; padding: 7px 11px; cursor: pointer; transition: background 0.15s;
  }
  .tb-ver:hover { background: var(--surface-ground); }
  .tb-ver-active { border-color: var(--primary-color); background: var(--color-brand-surface); }
</style>
