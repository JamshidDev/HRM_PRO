<script setup>
  // Tavsifdan (backend schema) chiziladigan forma maydonlari: sana, oraliq, vaqt, variant, son, matn, hafta kunlari.
  import { selectWrap } from '@/utils/selectWrap.js'
  import { useAppSetting } from '@/utils/index.js'
  import i18n from '@/i18n/index.js'

  const props = defineProps({
    fields: { type: Array, default: () => [] },
    data: { type: Object, required: true }
  })

  const { t } = i18n.global
  const OTHER = 0
  const DATE_FMT = 'yyyy-MM-dd'
  const errors = ref({})
  // Ota formaning reaktiv `data` obyekti (store) — maydonlar shu obyektga yoziladi.
  const form = computed(() => props.data)

  const isShown = (f) =>
    !f.show_if || f.show_if.in.some((v) => String(v) === String(form.value[f.show_if.key]))
  const visible = computed(() => props.fields.filter(isShown))

  const rangeValue = (f) => {
    const [a, b] = f.keys
    return form.value[a] && form.value[b] ? [form.value[a], form.value[b]] : null
  }
  const setRange = (f, v) => {
    const [a, b] = f.keys
    form.value[a] = v?.[0] ?? null
    form.value[b] = v?.[1] ?? null
  }
  const daysOf = (f) => {
    const [a, b] = f.keys
    if (!form.value[a] || !form.value[b]) return null
    return Math.round((Date.parse(form.value[b]) - Date.parse(form.value[a])) / 86400000) + 1
  }
  const selectOptions = (f) =>
    f.other ? [...f.options, { value: OTHER, label: t('applicationPage.schema.other') }] : f.options

  const isBlank = (v) => v === undefined || v === null || (typeof v === 'string' && !v.trim())

  // Majburiy maydonlar (faqat ko'rinayotganlari) — xato shu maydon ostida.
  const validate = () => {
    const e = {}
    for (const f of visible.value) {
      if (!f.required) continue
      if (f.kind === 'weekdays') {
        if (!Array.isArray(form.value[f.key]) || !form.value[f.key].length) e[f.key] = true
        continue
      }
      const keys = f.keys ?? [f.key]
      if (keys.some((k) => isBlank(form.value[k]))) e[f.key] = true
      else if (f.kind === 'select' && f.other && Number(form.value[f.key]) === OTHER && isBlank(form.value[`${f.key}_text`]))
        e[`${f.key}_text`] = true
    }
    errors.value = e
    return Object.keys(e).length === 0
  }
  defineExpose({ validate })

  watch(
    () => props.data,
    () => {
      if (Object.keys(errors.value).length) validate()
    },
    { deep: true }
  )
  watch(
    () => props.fields,
    () => (errors.value = {})
  )

  const status = (key) => (errors.value[key] ? 'error' : undefined)
  const feedback = (key) => (errors.value[key] ? t('rules.requiredField') : undefined)
</script>

<template>
  <div class="grid grid-cols-12 gap-x-4">
    <div v-for="f in visible" :key="f.key" class="col-span-12" :class="f.kind === 'textarea' ? '' : 'md:col-span-6'">
      <n-form-item :label="f.label" :show-require-mark="f.required" :validation-status="status(f.key)" :feedback="feedback(f.key)">
        <!-- Sana oralig'i (+ kunlar soni) -->
        <div v-if="f.kind === 'daterange'" class="w-full flex flex-col gap-1">
          <n-date-picker
            class="w-full"
            type="daterange"
            :formatted-value="rangeValue(f)"
            @update:formatted-value="(v) => setRange(f, v)"
            :value-format="DATE_FMT"
            :format="useAppSetting.datePicketFormat"
          />
          <span v-if="f.days_key && daysOf(f)" class="text-xs text-textColor3">
            {{ $t('applicationPage.schema.days', { n: daysOf(f) }) }}
          </span>
        </div>
        <!-- Vaqt oralig'i -->
        <div v-else-if="f.kind === 'timerange'" class="w-full grid grid-cols-2 gap-2">
          <n-time-picker
            v-for="k in f.keys"
            :key="k"
            class="w-full"
            v-model:formatted-value="form[k]"
            value-format="HH:mm"
            format="HH:mm"
          />
        </div>
        <!-- Sana -->
        <n-date-picker
          v-else-if="f.kind === 'date'"
          class="w-full"
          type="date"
          v-model:formatted-value="form[f.key]"
          :value-format="DATE_FMT"
          :format="useAppSetting.datePicketFormat"
        />
        <!-- Variantlar (+ «Boshqa» → matn) -->
        <div v-else-if="f.kind === 'select'" class="w-full flex flex-col gap-2">
          <n-select v-bind="selectWrap" v-model:value="form[f.key]" :options="selectOptions(f)" />
          <n-input
            v-if="f.other && form[f.key] === OTHER"
            v-model:value="form[`${f.key}_text`]"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 4 }"
            :status="status(`${f.key}_text`)"
            :placeholder="$t('applicationPage.schema.otherText')"
          />
        </div>
        <!-- Hafta kunlari -->
        <n-checkbox-group v-else-if="f.kind === 'weekdays'" :value="form[f.key] ?? []" @update:value="(v) => (form[f.key] = v)">
          <div class="flex flex-wrap gap-x-4 gap-y-2">
            <n-checkbox v-for="d in 7" :key="d" :value="d" :label="$t(`applicationPage.schema.weekdays.${d}`)" />
          </div>
        </n-checkbox-group>
        <!-- Son -->
        <n-input-number v-else-if="f.kind === 'number'" class="w-full" v-model:value="form[f.key]" :min="0" :show-button="false" />
        <!-- Matn -->
        <n-input
          v-else
          v-model:value="form[f.key]"
          :type="f.kind === 'textarea' ? 'textarea' : 'text'"
          :autosize="f.kind === 'textarea' ? { minRows: 2, maxRows: 6 } : undefined"
        />
      </n-form-item>
    </div>
  </div>
</template>
