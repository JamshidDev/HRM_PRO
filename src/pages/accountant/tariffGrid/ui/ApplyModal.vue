<script setup>
  // Setka/bazani lavozimlarga qo'llash: ta'sir preview (joriy vs yangi + farq + foiz) +
  // lavozim tanlash (checkbox) + qidiruv + faqat-o'zgaradiganlar + sabab + ixtiyoriy hujjat.
  import { UIUpload, NoDataPicture } from '@/components/index.js'
  import { useTariffGridStore } from '@/store/modules/index.js'

  const store = useTariffGridStore()

  const fmtNum = (v) => (v === null || v === undefined ? '—' : Number(v).toLocaleString('ru-RU'))
  const allRows = computed(() => store.applyData?.data ?? [])
  // O'zgaradigan (mos katak + farq ≠ 0) lavozimlar — tanlash mumkin bo'lganlar.
  const changedRows = computed(() => allRows.value.filter((p) => p.matched && (p.diff ?? 0) !== 0))

  // Ko'rsatiladigan (filtrlangan) qatorlar: qidiruv + faqat-o'zgaradiganlar.
  const rows = computed(() => {
    const q = (store.applySearch || '').trim().toLowerCase()
    return allRows.value.filter((p) => {
      if (store.applyOnlyChanged && !(p.matched && (p.diff ?? 0) !== 0)) return false
      if (!q) return true
      return (
        (p.position_name || '').toLowerCase().includes(q) ||
        (p.department_name || '').toLowerCase().includes(q)
      )
    })
  })

  // Qo'llanadigan to'plam: tanlangan bo'lsa — tanlangan o'zgaradiganlar, aks holda barcha o'zgaradiganlar.
  const effectiveRows = computed(() => {
    if (store.applySelectedIds.length) {
      const set = new Set(store.applySelectedIds)
      return changedRows.value.filter((p) => set.has(p.id))
    }
    return changedRows.value
  })
  const sum = (arr, key) => arr.reduce((s, p) => s + Number(p[key] || 0), 0)
  const sumCurrent = computed(() => sum(effectiveRows.value, 'current_salary'))
  const sumNew = computed(() => sum(effectiveRows.value, 'new_salary'))
  const sumDiff = computed(() => sumNew.value - sumCurrent.value)

  const isSelected = (id) => store.applySelectedIds.includes(id)
  const toggle = (id) => {
    const i = store.applySelectedIds.indexOf(id)
    if (i >= 0) store.applySelectedIds.splice(i, 1)
    else store.applySelectedIds.push(id)
  }
  const allChangedSelected = computed(
    () => changedRows.value.length > 0 && store.applySelectedIds.length === changedRows.value.length
  )
  const toggleAll = () => {
    store.applySelectedIds = allChangedSelected.value ? [] : changedRows.value.map((p) => p.id)
  }
  const pct = (p) =>
    p.current_salary > 0 && p.diff !== null ? Math.round((p.diff / p.current_salary) * 1000) / 10 : null
  const canSubmit = computed(() => effectiveRows.value.length > 0)
</script>

<template>
  <div class="min-h-[240px]">
    <n-spin :show="store.applyPreviewLoading" style="min-height: 200px">
      <!-- Xulosa -->
      <div class="flex flex-wrap items-center gap-2 mb-3">
        <n-tag type="info" round>{{ $t('tariffGrid.apply.totalLabel') }}: {{ store.applyData?.total ?? 0 }}</n-tag>
        <n-tag type="warning" round>{{ $t('tariffGrid.apply.changedLabel') }}: {{ store.applyData?.changed ?? 0 }}</n-tag>
        <n-tag v-if="store.applyData?.base_amount != null" type="default" round>
          {{ $t('tariffGrid.table.baseAmount') }}: {{ fmtNum(store.applyData?.base_amount) }} so'm
        </n-tag>
      </div>

      <n-alert type="info" :bordered="false" class="mb-3" style="border-radius: 12px">
        {{ $t('tariffGrid.apply.hint') }}
      </n-alert>

      <!-- Filtrlar -->
      <div class="flex flex-wrap items-center gap-2 mb-2" v-if="allRows.length">
        <n-input v-model:value="store.applySearch" size="small" clearable class="max-w-[280px]"
          :placeholder="$t('tariffGrid.apply.searchPh')" />
        <n-checkbox v-model:checked="store.applyOnlyChanged">{{ $t('tariffGrid.apply.onlyChanged') }}</n-checkbox>
        <span class="text-xs text-textColor3 ml-auto" v-if="store.applySelectedIds.length">
          {{ $t('tariffGrid.apply.selected') }}: {{ store.applySelectedIds.length }}
        </span>
      </div>

      <!-- Jadval -->
      <div class="w-full overflow-x-auto" v-if="rows.length">
        <n-table :single-line="false" size="small">
          <thead>
            <tr>
              <th class="w-[40px] text-center!">
                <n-checkbox :checked="allChangedSelected" :disabled="!changedRows.length" @update:checked="toggleAll" />
              </th>
              <th class="min-w-[200px]">{{ $t('tariffGrid.apply.position') }}</th>
              <th class="w-[100px]">{{ $t('tariffGrid.matrix.rank') }} / {{ $t('tariffGrid.matrix.group') }}</th>
              <th class="text-right! min-w-[110px]">{{ $t('tariffGrid.apply.current') }}</th>
              <th class="text-right! min-w-[110px]">{{ $t('tariffGrid.apply.new') }}</th>
              <th class="text-right! min-w-[120px]">{{ $t('tariffGrid.apply.diff') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in rows" :key="p.id">
              <td class="text-center!">
                <n-checkbox :checked="isSelected(p.id)" :disabled="!(p.matched && (p.diff ?? 0) !== 0)"
                  @update:checked="toggle(p.id)" />
              </td>
              <td>
                <div class="font-medium">{{ p.position_name || '—' }}</div>
                <div class="text-xs text-textColor3">{{ p.department_name || '—' }}</div>
              </td>
              <td class="text-xs">
                {{ p.rank ?? '—' }} / {{ p.group }}
                <n-tag v-if="!p.matched" type="error" size="tiny" round class="ml-1">
                  {{ $t('tariffGrid.apply.notMatched') }}
                </n-tag>
              </td>
              <td class="text-right! tnum">{{ fmtNum(p.current_salary) }}</td>
              <td class="text-right! tnum">{{ fmtNum(p.new_salary) }}</td>
              <td class="text-right! tnum" :class="p.diff > 0 ? 'text-green-600' : p.diff < 0 ? 'text-red-600' : ''">
                {{ p.diff === null ? '—' : (p.diff > 0 ? '+' : '') + fmtNum(p.diff) }}
                <span v-if="pct(p) !== null" class="text-xs text-textColor3">
                  ({{ (pct(p) > 0 ? '+' : '') + pct(p) }}%)
                </span>
              </td>
            </tr>
          </tbody>
          <tfoot v-if="effectiveRows.length">
            <tr class="font-semibold">
              <td></td>
              <td colspan="2" class="text-right!">{{ $t('tariffGrid.apply.sumLabel') }} ({{ effectiveRows.length }})</td>
              <td class="text-right! tnum">{{ fmtNum(sumCurrent) }}</td>
              <td class="text-right! tnum">{{ fmtNum(sumNew) }}</td>
              <td class="text-right! tnum" :class="sumDiff > 0 ? 'text-green-600' : sumDiff < 0 ? 'text-red-600' : ''">
                {{ (sumDiff > 0 ? '+' : '') + fmtNum(sumDiff) }}
              </td>
            </tr>
          </tfoot>
        </n-table>
      </div>
      <NoDataPicture v-if="!store.applyPreviewLoading && !rows.length" :description="$t('tariffGrid.apply.noAffected')" />

      <!-- Sabab + hujjat -->
      <n-form class="flex flex-col gap-1 mt-4 pt-4 border-t border-surface-line">
        <n-form-item :label="$t('tariffGrid.apply.reason')">
          <div class="w-full">
            <n-input v-model:value="store.applyPayload.reason" type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }" :placeholder="$t('tariffGrid.apply.reasonHint')" />
            <p class="text-xs text-textColor3 mt-1">{{ $t('tariffGrid.apply.reasonHint') }}</p>
          </div>
        </n-form-item>

        <n-form-item :label="$t('tariffGrid.form.effectiveDate')">
          <n-date-picker class="w-full" type="date" clearable
            v-model:formatted-value="store.applyPayload.effective_date" value-format="yyyy-MM-dd" />
        </n-form-item>

        <n-form-item :label="$t('tariffGrid.apply.file')">
          <UIUpload v-model:files="store.applyFiles" :multiple="false"
            accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx" />
        </n-form-item>

        <div class="flex justify-end gap-2 pt-2">
          <n-button quaternary @click="store.applyVisible = false">{{ $t('content.cancel') }}</n-button>
          <n-button type="primary" :disabled="!canSubmit" :loading="store.applySubmitLoading"
            @click="store._applyToPositions()">
            {{ $t('tariffGrid.apply.submit') }} ({{ effectiveRows.length }})
          </n-button>
        </div>
      </n-form>
    </n-spin>
  </div>
</template>

<style scoped>
  .tnum { font-variant-numeric: tabular-nums; }
</style>
