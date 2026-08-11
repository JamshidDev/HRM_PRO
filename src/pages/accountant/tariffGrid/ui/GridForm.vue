<script setup>
  import { useTariffGridStore, useTariffBaseStore } from '@/store/modules/index.js'
  import ColumnsMatrix from './ColumnsMatrix.vue'

  const store = useTariffGridStore()
  const baseStore = useTariffBaseStore()
  const isCreate = computed(() => store.gridVisibleType)
  const formTab = ref('meta')

  onMounted(() => baseStore._all())
  // Modal ochilganda doim "Ma'lumotlar" tabidan boshlanadi.
  watch(
    () => store.gridVisible,
    (v) => {
      if (v) formTab.value = 'meta'
    }
  )

  const baseOptions = computed(() =>
    baseStore.allBases.map((b) => ({
      label: `${b.name} — ${b.base_amount ? Number(b.base_amount).toLocaleString('ru-RU') : '—'} so'm`,
      value: b.id
    }))
  )
  // Baza tanlanganda jonli oklad preview uchun base_amount/min_floor ni o'rnatamiz.
  const onBaseChange = (id) => {
    const b = baseStore.allBases.find((x) => x.id === id)
    store.gridPayload.base_amount = b ? Number(b.base_amount) : null
    store.gridPayload.min_floor = b && b.min_floor != null ? Number(b.min_floor) : null
  }

  const onSubmit = () => (isCreate.value ? store._store() : store._update())
</script>

<template>
  <n-form :model="store.gridPayload" class="flex flex-col">
    <!-- CREATE: ikki tab — ma'lumotlar / koeffitsientlar -->
    <div v-if="isCreate" class="tg-body">
      <n-tabs type="line" animated size="small" v-model:value="formTab">
        <n-tab-pane name="meta" :tab="$t('tariffGrid.form.metaTitle')">
          <div class="grid grid-cols-12 gap-x-4 gap-y-1 pt-1">
            <n-form-item class="col-span-12 md:col-span-6" :label="$t('tariffGrid.form.name')">
              <n-input v-model:value="store.gridPayload.name" :placeholder="$t('tariffGrid.form.name')" />
            </n-form-item>
            <n-form-item class="col-span-12 md:col-span-6" :label="$t('tariffGrid.form.note')">
              <n-input v-model:value="store.gridPayload.note" :placeholder="$t('tariffGrid.form.note')" />
            </n-form-item>
            <n-form-item class="col-span-12 md:col-span-8" :label="$t('tariffGrid.form.baseSelect')">
              <n-select v-model:value="store.gridPayload.tariff_base_id" :options="baseOptions"
                :placeholder="$t('tariffGrid.form.baseSelect')" filterable @update:value="onBaseChange" />
            </n-form-item>
            <n-form-item class="col-span-12 md:col-span-4" :label="$t('tariffGrid.form.effectiveDate')">
              <n-date-picker class="w-full" type="date"
                v-model:formatted-value="store.gridPayload.effective_date" value-format="yyyy-MM-dd" />
            </n-form-item>
          </div>
        </n-tab-pane>
        <n-tab-pane name="coef" :tab="$t('tariffGrid.form.columnsTitle')">
          <p class="text-xs text-surface-500 mb-3 pt-1">{{ $t('tariffGrid.form.columnsHint') }}</p>
          <ColumnsMatrix />
        </n-tab-pane>
      </n-tabs>
    </div>

    <!-- EDIT-META: faqat ma'lumotlar -->
    <div v-else class="tg-body">
      <div class="tg-card">
        <p class="tg-card-title">{{ $t('tariffGrid.form.metaTitle') }}</p>
        <div class="grid grid-cols-12 gap-x-4 gap-y-1">
          <n-form-item class="col-span-12 md:col-span-6" :label="$t('tariffGrid.form.name')">
            <n-input v-model:value="store.gridPayload.name" :placeholder="$t('tariffGrid.form.name')" />
          </n-form-item>
          <n-form-item class="col-span-12 md:col-span-6" :label="$t('tariffGrid.form.note')">
            <n-input v-model:value="store.gridPayload.note" :placeholder="$t('tariffGrid.form.note')" />
          </n-form-item>
          <n-form-item class="col-span-12 md:col-span-4" :label="$t('tariffGrid.table.active')">
            <n-switch v-model:value="store.gridPayload.active" />
          </n-form-item>
        </div>
      </div>
    </div>

    <div class="tg-footer">
      <n-button @click="store.gridVisible = false" quaternary>{{ $t('content.cancel') }}</n-button>
      <n-button @click="onSubmit" :loading="store.gridSaveLoading" type="primary">{{ $t('content.save') }}</n-button>
    </div>
  </n-form>
</template>

<style scoped>
  .tg-body { max-height: calc(92vh - 170px); overflow-y: auto; padding-right: 4px; }
  .tg-card {
    background: var(--surface-ground, rgba(148, 163, 184, 0.06));
    border: 1px solid var(--surface-line, #e5e7eb); border-radius: 16px; padding: 14px 16px 4px; margin-bottom: 4px;
  }
  .tg-card-title { font-size: 13px; font-weight: 600; color: var(--textColor2, #475467); margin-bottom: 10px; }
  .tg-footer {
    display: flex; justify-content: flex-end; gap: 10px; padding-top: 14px; margin-top: 8px;
    border-top: 1px solid var(--surface-line, #e5e7eb);
  }
</style>
