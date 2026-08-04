<script setup>
  // Versiya tarixi — ALOHIDA modal. Ikki holat: LIST (sahifalangan jadval) / MATRIX (versiya matritsasi).
  import { Eye16Regular, Attach16Regular, ArrowLeft16Regular, EyeOff16Regular } from '@vicons/fluent'
  import { UIPagination, NoDataPicture } from '@/components/index.js'
  import { useAccountStore, useTariffGridStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import DocMatrix from './DocMatrix.vue'

  const { t } = i18n.global
  const store = useTariffGridStore()
  const accStore = useAccountStore()

  const showCoef = ref(false)

  const fmtNum = (v) => (v === null || v === undefined ? '—' : Number(v).toLocaleString('ru-RU'))
  const yearOptions = computed(() => store.versionYears.map((y) => ({ label: String(y), value: y })))
  const shownAnnexes = computed(() => store.viewVersion?.annexes ?? [])

  const onConfirm = (v) => {
    if (!accStore.checkAction(accStore.pn.economist)) return
    store._confirmVersion(v.id)
  }
</script>

<template>
  <div class="min-h-[240px]">
    <!-- ===== LIST (versiyalar jadvali) ===== -->
    <template v-if="store.historyView === 'list'">
      <div class="flex items-center gap-2 mb-3">
        <n-select size="small" class="w-40" :value="store.versionsParams.year" :options="yearOptions"
          clearable :placeholder="$t('tariffGrid.allYears')" @update:value="store.onVersionsYear" />
      </div>
      <n-spin :show="store.versionsLoading" style="min-height: 180px">
        <div class="w-full overflow-x-auto" v-if="store.versions.length">
          <n-table :single-line="false" size="small">
            <thead>
              <tr>
                <th class="text-center! w-[56px]">{{ $t('salary1c.rowNo') }}</th>
                <th class="w-[70px]">{{ $t('tariffGrid.table.version') }}</th>
                <th class="w-[120px]">{{ $t('tariffGrid.statusLabel') }}</th>
                <th class="min-w-[180px]">{{ $t('tariffGrid.effectivePeriod') }}</th>
                <th class="w-[140px]">{{ $t('tariffGrid.changedAt') }}</th>
                <th class="min-w-[150px]">{{ $t('tariffGrid.changedBy') }}</th>
                <th class="text-right! min-w-[120px]">{{ $t('tariffGrid.table.baseAmount') }}</th>
                <th class="min-w-[160px]">{{ $t('tariffGrid.form.note') }}</th>
                <th class="text-center! w-[130px]"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(v, i) in store.versions" :key="v.id">
                <td class="text-center! text-textColor3">
                  {{ (store.versionsParams.page - 1) * store.versionsParams.per_page + i + 1 }}
                </td>
                <td class="font-semibold">v{{ v.version }}</td>
                <td>
                  <n-tag v-if="v.status === 1" type="warning" size="tiny" round>{{ $t('tariffGrid.status.pending') }}</n-tag>
                  <n-tag v-else-if="v.is_active" type="success" size="tiny" round>{{ $t('content.active') }}</n-tag>
                  <n-tag v-else type="default" size="tiny" round>{{ $t('tariffGrid.status.confirmed') }}</n-tag>
                </td>
                <td class="text-xs">
                  <template v-if="v.status === 1">{{ v.effective_date }}</template>
                  <template v-else>{{ v.effective_from }} → {{ v.effective_to ?? $t('tariffGrid.tillNow') }}</template>
                </td>
                <td class="text-xs text-textColor3">{{ (v.created_at || '').replace('T', ' ').slice(0, 16) || '—' }}</td>
                <td class="text-xs">
                  <div>{{ v.created_by_name || $t('tariffGrid.table.system') }}</div>
                  <div v-if="v.confirmed_by_name" class="text-textColor3">
                    {{ $t('tariffGrid.status.confirmed') }}: {{ v.confirmed_by_name }}
                  </div>
                </td>
                <td class="text-right! tnum">{{ fmtNum(v.base_amount) }}</td>
                <td class="text-xs text-textColor2 truncate max-w-[220px]">{{ v.note || '—' }}</td>
                <td class="text-center!">
                  <div class="flex items-center justify-center gap-1.5">
                    <a v-if="v.document" :href="v.document" target="_blank" class="tg-doc"
                      :title="$t('tariffGrid.action.download')">
                      <n-icon size="16"><Attach16Regular /></n-icon>
                    </a>
                    <n-button size="tiny" quaternary @click="store._version(store.elementId, v.id)"
                      :title="$t('content.view')">
                      <template #icon><n-icon><Eye16Regular /></n-icon></template>
                    </n-button>
                    <n-button v-if="v.status === 1" size="tiny" type="primary" @click="onConfirm(v)">
                      {{ $t('tariffGrid.action.confirm') }}
                    </n-button>
                  </div>
                </td>
              </tr>
            </tbody>
          </n-table>
        </div>
        <NoDataPicture v-if="!store.versionsLoading && !store.versions.length" />
      </n-spin>
      <div v-if="store.versionsTotal > store.versionsParams.per_page" class="mt-3 flex justify-end">
        <UIPagination :total="store.versionsTotal" :page="store.versionsParams.page"
          :per_page="store.versionsParams.per_page" @changePage="store.onVersionsPage" />
      </div>
    </template>

    <!-- ===== MATRIX (tanlangan versiya jadvali) ===== -->
    <template v-else>
      <n-spin :show="store.versionsLoading">
        <div v-if="store.viewVersion" class="min-h-[160px]">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
            <n-button size="small" quaternary @click="store.backToVersionList()">
              <template #icon><n-icon><ArrowLeft16Regular /></n-icon></template>
              {{ $t('content.back') }}
            </n-button>
            <n-button size="small" tertiary @click="showCoef = !showCoef">
              <template #icon><n-icon><component :is="showCoef ? EyeOff16Regular : Eye16Regular" /></n-icon></template>
              {{ showCoef ? $t('tariffGrid.action.hideCoef') : $t('tariffGrid.action.showCoef') }}
            </n-button>
          </div>

          <div class="tg-meta mb-3">
            <div class="tg-meta-item">
              <p class="tg-meta-lbl">{{ $t('tariffGrid.table.version') }}</p>
              <p class="tg-meta-val">v{{ store.viewVersion.version }}</p>
            </div>
            <div class="tg-meta-item">
              <p class="tg-meta-lbl">{{ $t('tariffGrid.form.baseAmount') }}</p>
              <p class="tg-meta-val">{{ fmtNum(store.viewVersion.base_amount) }} <span class="tg-unit">so'm</span></p>
            </div>
            <div class="tg-meta-item">
              <p class="tg-meta-lbl">{{ $t('tariffGrid.form.effectiveDate') }}</p>
              <p class="tg-meta-val">{{ store.viewVersion.effective_date ?? '—' }}</p>
            </div>
          </div>

          <n-tabs v-if="shownAnnexes.length" type="line" animated size="small">
            <n-tab-pane v-for="a in shownAnnexes" :key="a.code" :name="a.code" :tab="a.name">
              <DocMatrix :annex="a" :base-amount="store.currentBase" :editable="false" :show-coef="showCoef" />
            </n-tab-pane>
          </n-tabs>
          <n-empty v-else :description="$t('tariffGrid.noData')" class="py-8" />
        </div>
      </n-spin>
    </template>
  </div>
</template>

<style scoped>
  .tg-doc { color: var(--primary-color); display: inline-flex; }
  .tnum { font-variant-numeric: tabular-nums; }
  .tg-meta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  .tg-meta-item {
    background: var(--surface-ground, rgba(148, 163, 184, 0.06));
    border: 1px solid var(--surface-line, #e5e7eb);
    border-radius: 12px;
    padding: 10px 12px;
  }
  .tg-meta-lbl { font-size: 11px; color: var(--textColor3, #98a2b3); margin-bottom: 4px; }
  .tg-meta-val { font-weight: 600; color: var(--textColor1, #101828); }
  .tg-unit { font-size: 11px; font-weight: 400; color: var(--textColor3, #98a2b3); }
</style>
