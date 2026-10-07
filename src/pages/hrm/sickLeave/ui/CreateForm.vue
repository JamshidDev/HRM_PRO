<script setup>
  import validationRules from '@/utils/validationRules.js'
  import { SuperSelect } from '@/components/index.js'
  import CloseTypePicker from './CloseTypePicker.vue'
  import PdfPicker from './PdfPicker.vue'
  import { useSickLeaveStore, SICK_LEAVE_CLOSE_TYPE } from '@/store/modules/index.js'
  import { LockClosed16Regular, LockOpen16Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const formRef = ref(null)
  const store = useSickLeaveStore()

  const DAY = 86400000
  const dayTs = (date) => new Date(`${date}T00:00:00`).getTime()

  // `to_date` to'ldirilsa varaqa darhol YOPIQ holatda yaratiladi — shunda
  // yopish turi va uning maydonlari ham kerak bo'ladi.
  const isClosing = computed(() => !!store.payload.to_date)
  const withDocument = computed(
    () => store.payload.close_type === SICK_LEAVE_CLOSE_TYPE.withDocument
  )

  const days = computed(() => {
    const { from_date, to_date } = store.payload
    if (!from_date || !to_date) return 0
    return Math.round((dayTs(to_date) - dayTs(from_date)) / DAY) + 1
  })

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
    const from = dayTs(store.payload.from_date)
    return ts < from || ts > from + 13 * DAY
  }

  const issuedDisabled = (ts) => ts > Date.now()

  // Boshlanish sanasi o'zgarib, tanlangan yopilish sanasi oraliqdan chiqib qolsa —
  // jimgina noto'g'ri sana yuborilmasin, tozalab qo'yamiz.
  watch(
    () => store.payload.from_date,
    (from) => {
      const to = store.payload.to_date
      if (to && (!from || toDisabled(dayTs(to)))) store.payload.to_date = null
    }
  )

  // PDF uchun alohida qoida: qiymat — `File` obyekti, umumiy qoidalar unga mos emas.
  const fileRule = {
    key: 'file',
    required: true,
    trigger: 'change',
    validator: () => (store.payload.file ? true : new Error(t('rules.requiredField')))
  }

  onMounted(() => {
    if (!store.workerList.length) store._workers()
  })

  // Fayl tanlansa yoki olib tashlansa — faqat PDF maydonining xatosini yangilaymiz.
  watch(
    () => store.payload.file,
    () => formRef.value?.validate(undefined, (rule) => rule?.key === 'file')
  )

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (error) return
      store.visibleType ? store._create() : store._update()
    })
  }

  defineExpose({ submit: onSubmit })
</script>

<template>
  <div class="px-1">
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

      <!-- Ikki sana yonma-yon; cheklovlar katta izoh bloki o'rniga har maydon ostida. -->
      <div class="grid grid-cols-1 gap-x-3 md:grid-cols-2 items-start">
        <n-form-item
          :label="$t('sickLeave.form.fromDate')"
          path="from_date"
          :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <div class="w-full">
            <n-date-picker
              class="w-full"
              v-model:formatted-value="store.payload.from_date"
              value-format="yyyy-MM-dd"
              format="dd.MM.yyyy"
              type="date"
              clearable
              :is-date-disabled="fromDisabled"
            />
            <div v-if="store.visibleType" class="mt-1 text-[11px] text-fig-text-muted">
              {{ $t('sickLeave.hint.fromDate') }}
            </div>
          </div>
        </n-form-item>

        <n-form-item :label="$t('sickLeave.form.toDateOptional')">
          <div class="w-full">
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
            <div class="mt-1 text-[11px] text-fig-text-muted">
              {{ $t('sickLeave.hint.toDate') }}
            </div>
          </div>
        </n-form-item>
      </div>

      <!-- Natija oldindan ko'rinadi: varaqa ochiq qoladimi yoki darhol yopiladimi. -->
      <div
        v-if="store.payload.from_date"
        class="mb-4 flex items-start gap-2 rounded-lg px-3 py-2 text-[12px] leading-[17px]"
        :class="
          isClosing
            ? 'border border-fig-br-secondary text-fig-text-primary'
            : 'bg-fig-chip-brand text-fig-chip-brand-text'
        "
      >
        <n-icon size="16" class="mt-px shrink-0">
          <LockClosed16Regular v-if="isClosing" />
          <LockOpen16Regular v-else />
        </n-icon>
        <span v-if="isClosing">{{ $t('sickLeave.summary.closed', { days }) }}</span>
        <span v-else>{{ $t('sickLeave.summary.open') }}</span>
      </div>

      <!-- Yopilish sanasi tanlansa — yopish turi va uning maydonlari. Xatolar toast
           emas, aynan maydon ostida ko'rsatiladi. -->
      <Transition name="close-section">
        <section v-if="isClosing" class="border-t border-fig-br-secondary pt-4">
          <div class="mb-3 text-[13px] font-semibold text-fig-text-primary">
            {{ $t('sickLeave.close.section') }}
          </div>

          <CloseTypePicker v-model="store.payload.close_type" class="mb-4" />

          <template v-if="withDocument">
            <div class="grid grid-cols-1 gap-x-3 md:grid-cols-2">
              <n-form-item
                :label="$t('sickLeave.form.number')"
                path="number"
                :rule-path="validationRules.rulesNames.requiredStringField"
              >
                <n-input v-model:value="store.payload.number" clearable />
              </n-form-item>
              <n-form-item
                :label="$t('sickLeave.form.issuedDate')"
                path="issued_date"
                :rule-path="validationRules.rulesNames.requiredStringField"
              >
                <n-date-picker
                  class="w-full"
                  v-model:formatted-value="store.payload.issued_date"
                  value-format="yyyy-MM-dd"
                  format="dd.MM.yyyy"
                  type="date"
                  clearable
                  :is-date-disabled="issuedDisabled"
                />
              </n-form-item>
            </div>

            <n-form-item :label="$t('sickLeave.form.file')" path="file" :rule="fileRule">
              <PdfPicker v-model="store.payload.file" />
            </n-form-item>
          </template>

          <n-form-item
            v-else
            :label="$t('sickLeave.form.reason')"
            path="close_reason"
            :rule-path="validationRules.rulesNames.requiredStringField"
          >
            <n-input
              v-model:value="store.payload.close_reason"
              type="textarea"
              :rows="3"
              :placeholder="$t('sickLeave.close.reasonPlaceholder')"
            />
          </n-form-item>
        </section>
      </Transition>
    </n-form>
  </div>
</template>

<style scoped>
  .close-section-enter-active,
  .close-section-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  .close-section-enter-from,
  .close-section-leave-to {
    opacity: 0;
    transform: translateY(-6px);
  }
</style>
