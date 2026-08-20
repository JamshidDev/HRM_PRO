<script setup>
  import { useMonthReportStore } from '@/store/modules/index.js'
  import { UIYearMonth } from '@/components/index.js'
  import { Add16Filled, Delete16Regular, Calculator24Regular } from '@vicons/fluent'

  const store = useMonthReportStore()
  const uploadBtn = ref()

  const addThreshold = () => {
    if (store.thresholdParams.thresholds.length < 5) {
      store.thresholdParams.thresholds.push(null)
    }
  }
  const removeThreshold = (i) => {
    if (store.thresholdParams.thresholds.length > 1) {
      store.thresholdParams.thresholds.splice(i, 1)
    }
  }

  const onExport = () => {
    const ok = store._vedThresholdExport()
    if (ok) uploadBtn.value?.$el?._triggerFly?.()
  }

  // Istisno uchun — faqat tanlangan oraliqdagi [from..to] real vedlar (shablon nomlari
  // bilan). n-select label bo'yicha filtrlaydi → "456" yozilsa "456 — ..." topiladi.
  const excludeOptions = computed(() => {
    const a = Number(store.thresholdParams.from_code) || 1
    const b = Number(store.thresholdParams.to_code) || 999
    const from = Math.min(a, b)
    const to = Math.max(a, b)
    return store.vedCodeList
      .filter((v) => {
        const n = Number(v.id)
        return n >= from && n <= to
      })
      .map((v) => ({
        label: v.name ? `${v.id} — ${v.name}` : v.id,
        value: v.id
      }))
  })

  const fmt = (v) => Number(v || 0).toLocaleString('ru-RU')

  onMounted(() => {
    store._vedCodes()
  })
</script>

<template>
  <div class="w-full flex flex-col gap-4">
    <!-- Davr (oy) -->
    <div>
      <label class="text-xs text-textColor3 mb-1 font-medium block">{{
        $t('content.year')
      }}</label>
      <UIYearMonth
        v-model:year="store.params.year"
        v-model:month="store.params.month"
        :clearable="false"
      />
    </div>

    <!-- Ved oralig'i -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="text-xs text-textColor3 mb-1 font-medium block">{{
          $t('monthReport.threshold.fromCode')
        }}</label>
        <n-input-number
          class="w-full"
          :min="1"
          :max="999"
          v-model:value="store.thresholdParams.from_code"
        />
      </div>
      <div>
        <label class="text-xs text-textColor3 mb-1 font-medium block">{{
          $t('monthReport.threshold.toCode')
        }}</label>
        <n-input-number
          class="w-full"
          :min="1"
          :max="999"
          v-model:value="store.thresholdParams.to_code"
        />
      </div>
    </div>

    <!-- Istisno kodlar (ko'p tanlov, qidiruv bilan) -->
    <div>
      <label class="text-xs text-textColor3 mb-1 font-medium block">{{
        $t('monthReport.threshold.excludeCodes')
      }}</label>
      <n-select
        class="w-full"
        multiple
        filterable
        clearable
        v-model:value="store.thresholdParams.exclude"
        :max-tag-count="3"
        :options="excludeOptions"
        :loading="store.vedCodesLoading"
        :placeholder="$t('monthReport.threshold.excludePh')"
      />
      <span class="text-[11px] text-textColor3 block mt-1">{{
        $t('monthReport.threshold.excludeHint')
      }}</span>
    </div>

    <!-- Chegara summalar (1..5) -->
    <div>
      <label class="text-xs text-textColor3 mb-1 font-medium block">{{
        $t('monthReport.threshold.amounts')
      }}</label>
      <div class="flex flex-col gap-2">
        <div
          v-for="(_, i) in store.thresholdParams.thresholds"
          :key="i"
          class="flex items-center gap-2"
        >
          <n-input-number
            class="w-full"
            :min="1"
            :step="1000000"
            :show-button="false"
            v-model:value="store.thresholdParams.thresholds[i]"
            :placeholder="$t('monthReport.threshold.amountPh')"
          />
          <n-button
            circle
            secondary
            type="error"
            size="small"
            :disabled="store.thresholdParams.thresholds.length <= 1"
            @click="removeThreshold(i)"
          >
            <template #icon>
              <n-icon><Delete16Regular /></n-icon>
            </template>
          </n-button>
        </div>
      </div>
      <n-button
        v-if="store.thresholdParams.thresholds.length < 5"
        size="tiny"
        dashed
        class="mt-2!"
        @click="addThreshold"
      >
        <template #icon>
          <n-icon><Add16Filled /></n-icon>
        </template>
        {{ $t('monthReport.threshold.addAmount') }}
      </n-button>
    </div>

    <!-- Hisoblash -->
    <n-button
      type="primary"
      :loading="store.thresholdLoading"
      @click="store._vedThresholdCompute()"
    >
      <template #icon>
        <n-icon><Calculator24Regular /></n-icon>
      </template>
      {{ $t('monthReport.threshold.compute') }}
    </n-button>

    <!-- Natija -->
    <div
      v-if="store.thresholdResult"
      class="border border-surface-line rounded-lg p-3 flex flex-col gap-2"
    >
      <div class="flex justify-between text-sm text-textColor3">
        <span>{{ $t('monthReport.threshold.selectedCodes') }}</span>
        <span class="font-medium text-textColor1">{{ store.thresholdResult.selected_codes }}</span>
      </div>
      <div class="flex justify-between text-sm text-textColor3">
        <span>{{ $t('monthReport.threshold.totalWorkers') }}</span>
        <span class="font-medium text-textColor1">{{ store.thresholdResult.total_workers }}</span>
      </div>
      <n-table :single-line="false" size="small" class="mt-1">
        <thead>
          <tr>
            <th>{{ $t('monthReport.threshold.amount') }}</th>
            <th class="text-right!">{{ $t('monthReport.threshold.count') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(b, i) in store.thresholdResult.thresholds" :key="i">
            <td class="tnum">&gt; {{ fmt(b.amount) }}</td>
            <td class="text-right! tnum font-semibold text-primary">{{ b.count }}</td>
          </tr>
        </tbody>
      </n-table>
    </div>

    <!-- Excelga yuklash (fly animatsiya) -->
    <n-button
      ref="uploadBtn"
      v-fly-upload.manual
      type="success"
      :loading="store.thresholdExporting"
      @click="onExport"
    >
      {{ $t('monthReport.threshold.export') }}
    </n-button>
  </div>
</template>

<style scoped></style>
