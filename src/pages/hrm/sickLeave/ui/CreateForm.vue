<script setup>
  import validationRules from '@/utils/validationRules.js'
  import { SuperSelect } from '@/components/index.js'
  import CloseTypePicker from './CloseTypePicker.vue'
  import { useSickLeaveStore, SICK_LEAVE_CLOSE_TYPE } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const formRef = ref(null)
  const store = useSickLeaveStore()

  // `to_date` to'ldirilsa varaqa darhol YOPIQ holatda yaratiladi — shunda
  // yopish turi va uning maydonlari ham kerak bo'ladi.
  const isClosing = computed(() => !!store.payload.to_date)
  const withDocument = computed(
    () => store.payload.close_type === SICK_LEAVE_CLOSE_TYPE.withDocument
  )

  // Yaratishda boshlanish sanasi 4 kundan orqaga tushmaydi (tahrirlashda erkin).
  const fromDisabled = (ts) => {
    const today = new Date().setHours(23, 59, 59, 999)
    const min = new Date()
    min.setDate(min.getDate() - 4)
    min.setHours(0, 0, 0, 0)
    if (ts > today) return true
    return store.visibleType ? ts < min.getTime() : false
  }

  // Yopilish sanasi: boshlanishdan oldin ham, 14 kundan narida ham bo'lmaydi.
  const toDisabled = (ts) => {
    if (!store.payload.from_date) return false
    const from = new Date(`${store.payload.from_date}T00:00:00`).getTime()
    const last = from + 13 * 86400000
    return ts < from || ts > last
  }

  onMounted(() => {
    if (!store.workerList.length) store._workers()
  })

  const onFileChange = ({ file }) => {
    store.payload.file = file?.file ?? null
  }

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (error) return
      if (isClosing.value) {
        const p = store.payload
        if (withDocument.value && (!p.number || !p.issued_date || !p.file)) {
          $Toast.warning(t('sickLeave.close.documentRequired'))
          return
        }
        if (!withDocument.value && !p.close_reason?.trim()) {
          $Toast.warning(t('sickLeave.close.reasonRequired'))
          return
        }
      }
      store.visibleType ? store._create() : store._update()
    })
  }

  defineExpose({ submit: onSubmit })
</script>

<template>
  <div class="px-1">
    <!-- Sanalar bo'yicha qisqa izoh — forma ustida, oddiy tilda. -->
    <div class="mb-4 rounded-xl border border-fig-brand/30 bg-fig-chip-brand p-3">
      <ul
        class="flex list-disc flex-col gap-1 pl-4 text-[12px] leading-[17px] text-fig-chip-brand-text"
      >
        <li>{{ $t('sickLeave.info.fromDate') }}</li>
        <li>{{ $t('sickLeave.info.toDate') }}</li>
        <li>{{ $t('sickLeave.info.maxDays') }}</li>
      </ul>
    </div>

    <n-form ref="formRef" :rules="validationRules.common" :model="store.payload">
      <n-form-item
        :label="$t('sickLeave.form.worker')"
        path="worker_position_id"
        :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <!-- Buyruqlar formasidagi bilan bir xil: server tomonda qidiruv,
             pastga aylantirilganda keyingi sahifa. -->
        <SuperSelect
          v-model:value="store.payload.worker_position_id"
          v-model:search="store.workerParams.search"
          :options="store.workerList"
          :loading="store.workerLoading"
          :total-count="store.workerTotal"
          :per-page="store.workerParams.per_page"
          value-field="id"
          clearable
          @onSearch="store._searchWorker"
          @onScrollEv="store._nextWorkerPage"
        />
      </n-form-item>

      <!-- Ikki sana yonma-yon: `to_date` ixtiyoriy — bo'sh qolsa varaqa ochiq. -->
      <div class="grid grid-cols-1 gap-x-3 md:grid-cols-2">
        <n-form-item
          :label="$t('sickLeave.form.fromDate')"
          path="from_date"
          :rule-path="validationRules.rulesNames.requiredField"
        >
          <n-date-picker
            class="w-full"
            v-model:formatted-value="store.payload.from_date"
            value-format="yyyy-MM-dd"
            format="dd.MM.yyyy"
            type="date"
            clearable
            :is-date-disabled="fromDisabled"
          />
        </n-form-item>

        <n-form-item :label="$t('sickLeave.form.toDateOptional')">
          <n-date-picker
            class="w-full"
            v-model:formatted-value="store.payload.to_date"
            value-format="yyyy-MM-dd"
            format="dd.MM.yyyy"
            type="date"
            clearable
            :disabled="!store.payload.from_date"
            :is-date-disabled="toDisabled"
          />
        </n-form-item>
      </div>
    </n-form>

    <!-- Yopilish sanasi tanlansa — yopish turi va uning maydonlari. -->
    <div v-if="isClosing" class="flex flex-col gap-3 rounded-xl bg-fig-block p-3">
      <CloseTypePicker v-model="store.payload.close_type" />

      <template v-if="withDocument">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label class="text-xs text-fig-text-tertiary">{{ $t('sickLeave.form.number') }}</label>
            <n-input v-model:value="store.payload.number" clearable />
          </div>
          <div>
            <label class="text-xs text-fig-text-tertiary">
              {{ $t('sickLeave.form.issuedDate') }}
            </label>
            <n-date-picker
              class="w-full"
              v-model:formatted-value="store.payload.issued_date"
              value-format="yyyy-MM-dd"
              format="dd.MM.yyyy"
              type="date"
              clearable
            />
          </div>
        </div>
        <div>
          <label class="text-xs text-fig-text-tertiary">{{ $t('sickLeave.form.file') }}</label>
          <n-upload
            accept="application/pdf"
            :max="1"
            :default-upload="false"
            @change="onFileChange"
          >
            <n-button block>{{ $t('sickLeave.form.selectPdf') }}</n-button>
          </n-upload>
        </div>
      </template>

      <div v-else>
        <label class="text-xs text-fig-text-tertiary">{{ $t('sickLeave.form.reason') }}</label>
        <n-input
          v-model:value="store.payload.close_reason"
          type="textarea"
          :rows="3"
          :placeholder="$t('sickLeave.close.reasonPlaceholder')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
