<script>
  // Forma qayta chizilsa ham so'rov takrorlanmasin — lavozim id bo'yicha kesh.
  const experienceCache = new Map()
</script>

<script setup>
  // 81 — kelishuv asosida moddiy yordam: har xodim uchun uzluksiz staji (yil, oy), kelishuv bandi.
  import { useCommandFormStore } from '@/pages/docFlow/document/command/commandFormStore.js'
  import { useComponentStore } from '@/store/modules/index.js'
  import { Dismiss16Regular } from '@vicons/fluent'
  import Utils from '../../../../../utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import { useEmptyFieldMarks } from '../useEmptyFieldMarks.js'

  const store = useCommandFormStore()
  const componentStore = useComponentStore()
  const { t } = i18n.global
  const { showErrors } = useEmptyFieldMarks()

  // Hujjatdagi kelishuv nomi (1 — tarmoq, 2 — jamoa); «Asos» namunasi shundan tuziladi.
  const AGREEMENT_NAME = { 1: 'Tarmoq jamoa kelishuvi', 2: 'Jamoa shartnomasi' }
  const MONTH_KEYS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  const monthOptions = computed(() => MONTH_KEYS.map((k, i) => ({ label: t(`month.${k}`), value: i + 1 })))
  const autoBase = (type, clause) =>
    `Xodimning arizasi, ${AGREEMENT_NAME[type] || AGREEMENT_NAME[1]}ning ${clause || '___'}-bandi`

  // Profildagi temir yo'l staji sanasidan tavsiya: bo'sh inputlarga qo'yiladi, qo'lda o'zgartirish mumkin.
  const suggestions = reactive({})
  const applyToRow = (id, d) => {
    suggestions[id] = d
    const row = store.workerData.find((v) => v.id === id)
    if (!row || row.experience_year != null || row.experience_month != null) return
    if (d.year == null && d.month == null) return
    row.experience_year = d.year
    row.experience_month = d.month
  }
  // Yangi tanlangan xodimlar 300 ms ichida yig'ilib, bitta so'rov bilan olinadi.
  const pending = new Set()
  let timer = null
  const flush = () => {
    const ids = [...pending]
    pending.clear()
    if (!ids.length) return
    $ApiService.commandService
      ._railwayExperience({ ids })
      .then((res) => {
        const list = res?.data?.data || []
        const empty = { year: null, month: null, start: null }
        ids.forEach((id) => {
          const d = list.find((v) => v.id === id) || empty
          experienceCache.set(id, d)
          applyToRow(id, d)
        })
      })
      .catch(() => ids.forEach((id) => delete suggestions[id]))
  }
  const fillExperience = (item) => {
    if (suggestions[item.id] !== undefined) return
    if (experienceCache.has(item.id)) return applyToRow(item.id, experienceCache.get(item.id))
    suggestions[item.id] = null
    pending.add(item.id)
    clearTimeout(timer)
    timer = setTimeout(flush, 300)
  }
  const suggestionText = (id) => {
    const d = suggestions[id]
    if (!d) return null
    if (!d.start) return t('documentPage.command.form.experienceNoDate')
    return t('documentPage.command.form.experienceSuggest', {
      date: Utils.timeOnlyDate(d.start),
      year: d.year,
      month: d.month
    })
  }
  const isSuggested = (item) => {
    const d = suggestions[item.id]
    return d?.start && Number(item.experience_year) === d.year && Number(item.experience_month) === d.month
  }
  const applySuggestion = (item) => {
    const d = suggestions[item.id]
    if (!d?.start) return
    item.experience_year = d.year
    item.experience_month = d.month
  }
  // Ko'pi bilan 30 xodim — ortig'i olib tashlanadi (backend ham tekshiradi).
  const MAX_WORKERS = 30
  watch(
    () => store.payload.workers?.length || 0,
    (n) => {
      if (n > MAX_WORKERS) {
        store.payload.workers = store.payload.workers.slice(0, MAX_WORKERS)
        $Alert.validation(t('commandPage.form_26.max_workers', { max: MAX_WORKERS }))
      }
    }
  )
  watch(
    () => store.workerData.map((v) => v.id),
    () => store.workerData.forEach(fillExperience),
    { immediate: true }
  )
  // «Asos» qo'lda o'zgartirilmagan bo'lsa — kelishuv/band o'zgarganda namuna yangilanadi.
  const syncBase = (prevType, prevClause) => {
    const prev = autoBase(prevType, prevClause)
    if (!store.commandBase || store.commandBase === prev) {
      store.commandBase = autoBase(store.agreementType, store.clauseNumber)
    }
  }
  const onAgreementChange = (type) => {
    const prev = store.agreementType
    store.agreementType = type
    syncBase(prev, store.clauseNumber)
  }
  const onClauseChange = (v) => {
    const prev = store.clauseNumber
    store.clauseNumber = v
    syncBase(store.agreementType, prev)
  }
  const clauseInvalid = computed(() => showErrors.value && !store.clauseNumber)

  const onRemoveWorker = (id) => {
    store.workerData = store.workerData.filter((v) => v.id !== id)
    store.payload.workers = store.payload.workers.filter((workerId) => workerId !== id)
  }

  // Yil (0–50) va oy (0–11) ixtiyoriy, lekin kamida bittasi 0 dan katta bo'lishi shart.
  const hasExperience = (v) => Number(v.experience_year) > 0 || Number(v.experience_month) > 0
  const isInvalid = (v) => showErrors.value && !hasExperience(v)
  const fullName = (v) => v.worker?.name || Utils.combineFullName(v.worker?.worker)

  const onSubmit = (mainData) => {
    const valid = store.workerData.every(hasExperience)
    showErrors.value = !valid || !store.clauseNumber
    if (!valid) {
      $Alert.validation(t('documentPage.command.form.experienceZero'))
      return { data: null, isValid: false }
    }
    if (!store.clauseNumber) {
      $Alert.validation(t('documentPage.command.form.clauseRequired'))
      return { data: null, isValid: false }
    }
    return {
      data: {
        ...mainData,
        worker_positions: store.workerData.map((v) => ({
          id: v.id,
          experience_year: Number(v.experience_year) || 0,
          experience_month: Number(v.experience_month) || 0
        })),
        command_additional: {
          base: store.commandBase || null,
          agreement_type: store.agreementType || 1,
          month: store.aidMonth || null,
          clause_number: store.clauseNumber
        }
      },
      isValid: true
    }
  }

  defineExpose({ onSubmit })

  onMounted(() => {
    componentStore._enums()
    if (!store.agreementType) store.agreementType = 1
    if (!store.aidMonth) store.aidMonth = new Date().getMonth() + 1
    if (!store.commandBase) store.commandBase = autoBase(store.agreementType, store.clauseNumber)
  })
</script>

<template>
  <div
    v-if="store.workerData.length"
    class="mb-4 rounded-md border border-surface-line bg-surface-ground p-2"
  >
    <div class="mb-2 flex items-center justify-between px-1">
      <span class="text-xs font-medium text-textColor2">
        {{ $t('documentPage.command.form.selectedWorkers') }} · {{ store.workerData.length }}
      </span>
      <div class="hidden @xl:flex items-center gap-2 pr-2.5">
        <span class="w-[110px] text-xs font-medium text-textColor2">
          {{ $t('documentPage.command.form.experienceYear') }}
        </span>
        <span class="w-[110px] text-xs font-medium text-textColor2">
          {{ $t('documentPage.command.form.experienceMonth') }}
        </span>
        <span v-if="!store.fromApplication" class="w-7" />
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <div
        v-for="(item, idx) in store.workerData"
        :key="item.id"
        class="flex flex-col gap-2 rounded-lg border bg-surface-section p-2 transition-colors @xl:flex-row @xl:items-center @xl:gap-3"
        :class="isInvalid(item) ? 'border-fig-text-red' : 'border-surface-line'"
      >
        <div class="flex min-w-0 flex-1 items-center gap-2.5">
          <span
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fig-chip-brand text-[11px] font-semibold text-fig-chip-brand-text"
          >
            {{ idx + 1 }}
          </span>
          <n-avatar
            round
            :size="36"
            class="shrink-0"
            :src="item.worker?.photo || Utils.noAvailableImage"
            :fallback-src="Utils.noAvailableImage"
          />
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-medium leading-5 text-textColor1" :title="fullName(item)">
              {{ fullName(item) }}
            </div>
            <div
              v-if="item.worker?.position"
              class="truncate text-xs leading-4 text-textColor2"
              :title="item.worker.position"
            >
              {{ item.worker.position }}
            </div>
            <button
              v-if="suggestionText(item.id)"
              type="button"
              class="block truncate text-left text-xs leading-4"
              :class="isSuggested(item) || !suggestions[item.id]?.start ? 'text-textColor2 cursor-default' : 'text-primary hover:underline'"
              :title="suggestionText(item.id)"
              @click="applySuggestion(item)"
            >
              {{ suggestionText(item.id) }}
            </button>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <n-input-number
            class="w-[110px]"
            v-model:value="item.experience_year"
            :min="0"
            :max="50"
            :precision="0"
            :show-button="false"
            :status="isInvalid(item) ? 'error' : undefined"
            placeholder="0"
          >
            <template #suffix>
              <span class="text-xs text-textColor2">{{ $t('documentPage.command.form.experienceYearUnit') }}</span>
            </template>
          </n-input-number>
          <n-input-number
            class="w-[110px]"
            v-model:value="item.experience_month"
            :min="0"
            :max="11"
            :precision="0"
            :show-button="false"
            :status="isInvalid(item) ? 'error' : undefined"
            placeholder="0"
          >
            <template #suffix>
              <span class="text-xs text-textColor2">{{ $t('documentPage.command.form.experienceMonthUnit') }}</span>
            </template>
          </n-input-number>
          <n-button
            v-if="!store.fromApplication"
            quaternary
            circle
            size="small"
            class="remove-btn"
            :aria-label="$t('documentPage.command.form.removeWorker')"
            @click="onRemoveWorker(item.id)"
          >
            <template #icon>
              <n-icon><Dismiss16Regular /></n-icon>
            </template>
          </n-button>
        </div>
      </div>
    </div>
  </div>

  <div
    class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line p-2 rounded-md bg-surface-ground"
  >
    <div class="col-span-12 @xl:col-span-3">
      <n-form-item
        :show-feedback="false"
        :label="$t('documentPage.command.form.agreementType')"
        path="agreementType"
      >
        <n-select
          :value="store.agreementType"
          :options="componentStore.agreementTypes"
          label-field="name"
          value-field="id"
          :loading="componentStore.enumLoading"
          @update:value="onAgreementChange"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-2">
      <n-form-item :show-feedback="false" :label="$t('documentPage.command.form.aidMonth')" path="aidMonth">
        <n-select v-model:value="store.aidMonth" :options="monthOptions" />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-2">
      <n-form-item :show-feedback="false" :label="$t('documentPage.command.form.clauseNumber')" path="clauseNumber">
        <n-input-number
          class="w-full"
          :value="store.clauseNumber"
          :min="1"
          :max="999"
          :precision="0"
          :show-button="false"
          :status="clauseInvalid ? 'error' : undefined"
          :placeholder="$t('documentPage.command.form.clausePlaceholder')"
          @update:value="onClauseChange"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-5">
      <n-form-item :show-feedback="false" :label="$t(`documentPage.command.form.base`)" path="base">
        <n-input
          class="w-full"
          type="textarea"
          :autosize="true"
          :rows="1"
          v-model:value="store.commandBase"
          clearable
        />
      </n-form-item>
    </div>
  </div>
</template>

<style scoped>
  .remove-btn {
    color: var(--color-textColor2);
  }
  .remove-btn:hover {
    color: var(--color-fig-text-red);
  }
</style>
