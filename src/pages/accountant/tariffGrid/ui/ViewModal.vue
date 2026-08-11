<script setup>
  // Setka KO'RISH + TAHRIR (hujjat ko'rinishida) + versiya tarixi — modalda.
  import { ArrowDownload16Filled, Edit16Filled, Eye16Regular, EyeOff16Regular } from '@vicons/fluent'
  import { useAccountStore, useTariffGridStore } from '@/store/modules/index.js'
  import DocMatrix from './DocMatrix.vue'
  import SaveVersionModal from './SaveVersionModal.vue'

  const store = useTariffGridStore()
  const accStore = useAccountStore()

  // Koeffitsient bloki default yashirin — ko'z-ikonka bilan ochiladi (faqat ko'rishda).
  const showCoef = ref(false)

  const shownVersion = computed(() =>
    store.detailEditing
      ? store.detail?.version
      : (store.viewVersion ?? store.detail?.version)
  )
  const shownAnnexes = computed(() => shownVersion.value?.annexes ?? [])

  const onEdit = () => {
    if (!accStore.checkAction(accStore.pn.economist)) return
    store.startCoefEdit()
  }

  const fmtNum = (v) => (v === null || v === undefined ? '—' : Number(v).toLocaleString('ru-RU'))
</script>

<template>
  <n-spin :show="store.detailLoading">
    <div v-if="store.detail" class="min-h-[120px]">
      <!-- Amallar -->
      <div class="flex flex-wrap items-center justify-end gap-2 mb-3">
        <template v-if="!store.detailEditing">
          <n-button size="small" tertiary @click="showCoef = !showCoef">
            <template #icon><n-icon><component :is="showCoef ? EyeOff16Regular : Eye16Regular" /></n-icon></template>
            {{ showCoef ? $t('tariffGrid.action.hideCoef') : $t('tariffGrid.action.showCoef') }}
          </n-button>
          <n-button size="small" tertiary type="info" @click="store._excel(store.elementId)">
            <template #icon><n-icon><ArrowDownload16Filled /></n-icon></template>
            {{ $t('tariffGrid.action.excel') }}
          </n-button>
          <n-button size="small" type="primary" @click="onEdit">
            <template #icon><n-icon><Edit16Filled /></n-icon></template>
            {{ $t('content.edit') }}
          </n-button>
        </template>
        <template v-else>
          <n-button size="small" quaternary @click="store.cancelCoefEdit()">{{ $t('content.cancel') }}</n-button>
          <n-button size="small" type="primary" @click="store.openSaveVersion()">{{ $t('content.save') }}</n-button>
        </template>
      </div>

      <!-- To'liq nom (description) -->
      <p v-if="store.detail?.note" class="tg-desc">{{ store.detail.note }}</p>

      <!-- Meta -->
      <div v-if="shownVersion" class="tg-meta">
        <div class="tg-meta-item">
          <p class="tg-meta-lbl">{{ $t('tariffGrid.form.baseAmount') }}</p>
          <p class="tg-meta-val">{{ fmtNum(shownVersion.base_amount) }} <span class="tg-unit">so'm</span></p>
        </div>
        <div class="tg-meta-item">
          <p class="tg-meta-lbl">{{ $t('tariffGrid.form.minFloor') }}</p>
          <p class="tg-meta-val">{{ fmtNum(shownVersion.min_floor) }} <span v-if="shownVersion.min_floor" class="tg-unit">so'm</span></p>
        </div>
        <div class="tg-meta-item">
          <p class="tg-meta-lbl">{{ $t('tariffGrid.form.effectiveDate') }}</p>
          <p class="tg-meta-val">{{ shownVersion.effective_date ?? '—' }}</p>
        </div>
        <div class="tg-meta-item">
          <p class="tg-meta-lbl">{{ $t('tariffGrid.table.version') }}</p>
          <p class="tg-meta-val">v{{ shownVersion.version ?? '—' }}</p>
        </div>
      </div>

      <p v-if="store.detailEditing" class="text-xs text-surface-500 mb-2">{{ $t('tariffGrid.matrix.legend') }}</p>

      <!-- Ilovalar -->
      <n-tabs v-if="shownAnnexes.length" type="line" animated size="small">
        <n-tab-pane v-for="a in shownAnnexes" :key="a.code" :name="a.code" :tab="a.name">
          <DocMatrix :annex="a" :base-amount="store.currentBase" :editable="store.detailEditing" :show-coef="showCoef" />
        </n-tab-pane>
      </n-tabs>
      <n-empty v-else :description="$t('tariffGrid.noData')" class="py-8" />
    </div>

    <SaveVersionModal />
  </n-spin>
</template>

<style scoped>
  .tg-desc {
    font-size: 13px;
    color: var(--textColor2, #475467);
    margin-bottom: 12px;
    line-height: 1.4;
  }
  .tg-meta {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 14px;
  }
  @media (min-width: 768px) {
    .tg-meta { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }
  .tg-meta-item {
    background: var(--surface-ground, rgba(148, 163, 184, 0.06));
    border: 1px solid var(--surface-line, #e5e7eb);
    border-radius: 12px;
    padding: 10px 12px;
  }
  .tg-meta-lbl { font-size: 11px; color: var(--textColor3, #98a2b3); margin-bottom: 4px; }
  .tg-meta-val { font-weight: 600; color: var(--textColor1, #101828); font-variant-numeric: tabular-nums; }
  .tg-unit { font-size: 11px; font-weight: 400; color: var(--textColor3, #98a2b3); }
  .tg-ver {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    background: var(--surface-ground, rgba(148, 163, 184, 0.06));
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 7px 11px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .tg-ver:hover { background: var(--surface-ground); }
  .tg-ver-active { border-color: var(--primary-color); background: var(--color-brand-surface); }
  .tg-doc { color: var(--primary-color); display: inline-flex; }
</style>
