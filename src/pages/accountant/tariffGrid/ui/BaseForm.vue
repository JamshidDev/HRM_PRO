<script setup>
  import { useTariffBaseStore } from '@/store/modules/index.js'

  const store = useTariffBaseStore()
  const isCreate = computed(() => store.formType)

  const fmtNum = (v) => (v === null || v === undefined ? '' : String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' '))
  const parseNum = (s) => {
    const n = (s ?? '').replace(/\s/g, '')
    return n === '' ? null : Number(n)
  }
  const onSubmit = () => (isCreate.value ? store._store() : store._update())
</script>

<template>
  <n-form :model="store.payload" class="flex flex-col">
    <div class="tb-body">
      <div class="tb-card">
        <p class="tb-card-title">{{ $t('tariffBase.form.metaTitle') }}</p>
        <div class="grid grid-cols-12 gap-x-4 gap-y-1">
          <n-form-item class="col-span-12 md:col-span-6" :label="$t('tariffBase.form.name')">
            <n-input v-model:value="store.payload.name" :placeholder="$t('tariffBase.form.name')" />
          </n-form-item>
          <n-form-item class="col-span-12 md:col-span-6" :label="$t('tariffBase.form.note')">
            <n-input v-model:value="store.payload.note" :placeholder="$t('tariffBase.form.note')" />
          </n-form-item>
          <template v-if="isCreate">
            <n-form-item class="col-span-12 md:col-span-4" :label="$t('tariffBase.form.baseAmount')">
              <n-input-number class="w-full" v-model:value="store.payload.base_amount"
                :show-button="false" :min="0" :format="fmtNum" :parse="parseNum" placeholder="1 155 000">
                <template #suffix><span class="text-surface-400 text-xs">so'm</span></template>
              </n-input-number>
            </n-form-item>
            <n-form-item class="col-span-12 md:col-span-4" :label="$t('tariffBase.form.minFloor')">
              <n-input-number class="w-full" v-model:value="store.payload.min_floor"
                :show-button="false" :min="0" :format="fmtNum" :parse="parseNum" placeholder="3 236 092">
                <template #suffix><span class="text-surface-400 text-xs">so'm</span></template>
              </n-input-number>
            </n-form-item>
            <n-form-item class="col-span-12 md:col-span-4" :label="$t('tariffBase.form.effectiveDate')">
              <n-date-picker class="w-full" type="date"
                v-model:formatted-value="store.payload.effective_date" value-format="yyyy-MM-dd" />
            </n-form-item>
          </template>
          <n-form-item v-else class="col-span-12 md:col-span-4" :label="$t('tariffGrid.table.active')">
            <n-switch v-model:value="store.payload.active" />
          </n-form-item>
        </div>
      </div>
    </div>

    <div class="tb-footer">
      <n-button @click="store.formVisible = false" quaternary>{{ $t('content.cancel') }}</n-button>
      <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">{{ $t('content.save') }}</n-button>
    </div>
  </n-form>
</template>

<style scoped>
  .tb-card {
    background: var(--surface-ground, rgba(148, 163, 184, 0.06));
    border: 1px solid var(--surface-line, #e5e7eb); border-radius: 16px; padding: 14px 16px 4px; margin-bottom: 4px;
  }
  .tb-card-title { font-size: 13px; font-weight: 600; color: var(--textColor2, #475467); margin-bottom: 10px; }
  .tb-footer {
    display: flex; justify-content: flex-end; gap: 10px; padding-top: 14px; margin-top: 8px;
    border-top: 1px solid var(--surface-line, #e5e7eb);
  }
</style>
