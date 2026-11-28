<script setup>
  // Havola formasi: ariza turi tavsifidan chiziladi (qiymatlar tizimdagi ariza formasi bilan bir xil formatda).
  import { selectWrap } from '@/utils/selectWrap.js'
  import { UIDayPicker } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import Utils from '@/utils/Utils.js'

  const props = defineProps({
    def: { type: Object, default: null },
    data: { type: Object, required: true },
    loadChildren: { type: Function, required: true },
    loadNotices: { type: Function, required: true }
  })

  const { t } = i18n.global
  const OTHER = 0
  const DATE_FMT = 'yyyy-MM-dd'
  const data = props.data

  const isShown = (f) => !f.show_if || f.show_if.in.some((v) => String(v) === String(data[f.show_if.key]))
  const allFields = computed(() => props.def?.fields ?? [])
  const fields = computed(() => {
    const visible = allFields.value.filter(isShown)
    return [...visible.filter((f) => !f.record), ...visible.filter((f) => f.record)]
  })
  const firstRecordKey = computed(() => fields.value.find((f) => f.record)?.key ?? null)
  const errors = ref({})

  // ---- Farzand: ro'yxatdan yoki qo'lda ----
  const children = ref([])
  const childMode = ref('list')
  const onChild = (id) => {
    const c = children.value.find((v) => v.id === id)
    data.child_relative_id = id
    data.child_full_name = c?.full_name ?? null
    data.child_birthday = c?.birthday ? String(c.birthday).slice(0, 10) : null
  }
  const childHasBirthday = computed(() => !!children.value.find((v) => v.id === data.child_relative_id)?.birthday)
  const onChildMode = (mode) => {
    if (childMode.value === mode) return
    childMode.value = mode
    data.child_relative_id = null
    data.child_full_name = null
    data.child_birthday = null
  }

  // ---- Tushuntirish xati: xodimga kelgan talabnoma ----
  const notices = ref([])
  const noticesLoading = ref(false)

  // ---- Oraliqlar ----
  const rangeValue = (f) => {
    const [a, b] = f.keys
    return data[a] && data[b] ? [data[a], data[b]] : null
  }
  const setRange = (f, v) => {
    const [a, b] = f.keys
    data[a] = v?.[0] ?? null
    data[b] = v?.[1] ?? null
  }
  const countOf = (f) => {
    const [a, b] = f.keys
    if (!data[a] || !data[b]) return null
    if (f.days_key) return Math.round((Date.parse(data[b]) - Date.parse(data[a])) / 86400000) + 1
    const [fy, fm] = data[a].split('-').map(Number)
    const [ty, tm] = data[b].split('-').map(Number)
    return (ty - fy) * 12 + (tm - fm) + 1
  }

  const selectOptions = (f) =>
    f.other ? [...f.options, { value: OTHER, label: t('applicationPage.schema.other') }] : f.options
  const isBlank = (v) => v === undefined || v === null || (typeof v === 'string' && !v.trim())

  // Majburiy maydonlar ro'yxati (xato ko'rsatmasdan) — «Tasdiqlash» tugmasi holati uchun.
  const collectErrors = () => {
    const e = {}
    for (const f of fields.value) {
      if (f.kind === 'child') {
        if (isBlank(data.child_full_name)) e.child_full_name = true
        if (isBlank(data.child_birthday)) e.child_birthday = true
        continue
      }
      if (!f.required) continue
      if (f.kind === 'weekdays') {
        if (!Array.isArray(data[f.key]) || !data[f.key].length) e[f.key] = true
        continue
      }
      const keys = f.keys ?? [f.key]
      if (keys.some((k) => isBlank(data[k]))) e[f.key] = true
      else if (f.kind === 'select' && f.other && Number(data[f.key]) === OTHER && isBlank(data[`${f.key}_text`]))
        e[`${f.key}_text`] = true
    }
    return e
  }
  const validate = () => {
    errors.value = collectErrors()
    return Object.keys(errors.value).length === 0
  }
  const isComplete = computed(() => Object.keys(collectErrors()).length === 0)
  defineExpose({ validate, isComplete })

  watch(
    () => ({ ...data }),
    () => {
      if (Object.keys(errors.value).length) validate()
    },
    { deep: true }
  )
  const status = (key) => (errors.value[key] ? 'error' : undefined)
  const feedback = (key) => (errors.value[key] ? t('rules.requiredField') : undefined)

  watch(
    () => props.def?.id,
    async () => {
      errors.value = {}
      children.value = []
      notices.value = []
      if (allFields.value.some((f) => f.kind === 'child')) {
        children.value = (await props.loadChildren()) ?? []
        childMode.value = children.value.length ? 'list' : 'manual'
      }
      const noticeF = allFields.value.find((f) => f.kind === 'notice_ref')
      if (noticeF) {
        noticesLoading.value = true
        const rows = (await props.loadNotices((noticeF.notice_types ?? []).join(','))) ?? []
        notices.value = rows.map((v) => ({
          id: v.id,
          name: [v.date ? Utils.timeOnlyDate(v.date) : null, v.number ? `№${v.number}` : null, v.title]
            .filter(Boolean)
            .join(' · ')
        }))
        noticesLoading.value = false
      }
    },
    { immediate: true }
  )
</script>

<template>
  <div class="grid grid-cols-12 gap-x-4" v-if="def">
    <template v-for="f in fields" :key="f.key">
      <div v-if="f.key === firstRecordKey" class="col-span-12 mb-1 mt-2 border-t border-surface-line pt-3 text-sm text-textColor2">
        {{ $t('applicationPage.schema.recordTitle') }}
      </div>

      <!-- Farzand -->
      <div class="col-span-12" v-if="f.kind === 'child'">
        <n-form-item :label="f.label" :show-require-mark="true" :validation-status="status('child_full_name')" :feedback="feedback('child_full_name')">
          <div class="flex w-full flex-col gap-2">
            <n-radio-group v-if="children.length" :value="childMode" @update:value="onChildMode" size="small">
              <n-radio-button value="list">{{ $t('applicationPage.schema.childFromList') }}</n-radio-button>
              <n-radio-button value="manual">{{ $t('applicationPage.schema.childManual') }}</n-radio-button>
            </n-radio-group>
            <n-select
              v-if="childMode === 'list'"
              v-bind="selectWrap"
              :value="data.child_relative_id"
              :options="children.map((c) => ({ value: c.id, label: c.full_name }))"
              @update:value="onChild"
            />
            <n-input v-else v-model:value="data.child_full_name" />
          </div>
        </n-form-item>
        <n-form-item :label="$t('applicationPage.schema.childBirthday')" :show-require-mark="true" :validation-status="status('child_birthday')" :feedback="feedback('child_birthday')">
          <UIDayPicker class="w-full" v-model:formatted-value="data.child_birthday" mode="day" :value-format="DATE_FMT" :disabled="childMode === 'list' && childHasBirthday" />
        </n-form-item>
      </div>

      <!-- Talabnoma (tushuntirish xati) -->
      <div class="col-span-12" v-else-if="f.kind === 'notice_ref'">
        <n-form-item :label="f.label" :show-require-mark="f.required" :validation-status="status(f.key)" :feedback="feedback(f.key)">
          <n-select v-bind="selectWrap" v-model:value="data[f.key]" :options="notices" label-field="name" value-field="id" :loading="noticesLoading" />
        </n-form-item>
      </div>

      <!-- Sana oralig'i -->
      <div class="col-span-12" v-else-if="f.kind === 'daterange'">
        <n-form-item :label="f.label" :show-require-mark="f.required" :validation-status="status(f.key)" :feedback="feedback(f.key)">
          <div class="flex w-full flex-col gap-1">
            <UIDayPicker class="w-full" :formatted-value="rangeValue(f)" mode="period" @update:formatted-value="(v) => setRange(f, v)" :value-format="DATE_FMT" />
            <span v-if="(f.days_key || f.months_key) && countOf(f)" class="text-xs text-textColor3">
              {{ f.days_key ? $t('applicationPage.schema.days', { n: countOf(f) }) : $t('applicationPage.schema.months', { n: countOf(f) }) }}
            </span>
          </div>
        </n-form-item>
      </div>

      <!-- Vaqt oralig'i -->
      <div class="col-span-12" v-else-if="f.kind === 'timerange'">
        <n-form-item :label="f.label" :show-require-mark="f.required" :validation-status="status(f.key)" :feedback="feedback(f.key)">
          <div class="grid w-full grid-cols-2 gap-2">
            <n-time-picker v-for="k in f.keys" :key="k" class="w-full" v-model:formatted-value="data[k]" value-format="HH:mm" format="HH:mm" />
          </div>
        </n-form-item>
      </div>

      <!-- Sana -->
      <div class="col-span-12 md:col-span-6" v-else-if="f.kind === 'date'">
        <n-form-item :label="f.label" :show-require-mark="f.required" :validation-status="status(f.key)" :feedback="feedback(f.key)">
          <UIDayPicker class="w-full" v-model:formatted-value="data[f.key]" mode="day" :value-format="DATE_FMT" />
        </n-form-item>
      </div>

      <!-- Variantlar (+ «Boshqa» → matn) -->
      <div class="col-span-12" v-else-if="f.kind === 'select'">
        <n-form-item :label="f.label" :show-require-mark="f.required" :validation-status="status(f.key)" :feedback="feedback(f.key)">
          <div class="flex w-full flex-col gap-2">
            <n-select v-bind="selectWrap" v-model:value="data[f.key]" :options="selectOptions(f)" />
            <n-input
              v-if="f.other && data[f.key] === OTHER"
              v-model:value="data[`${f.key}_text`]"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 4 }"
              :status="status(`${f.key}_text`)"
              :placeholder="$t('applicationPage.schema.otherText')"
            />
          </div>
        </n-form-item>
      </div>

      <!-- Hafta kunlari -->
      <div class="col-span-12" v-else-if="f.kind === 'weekdays'">
        <n-form-item :label="f.label" :show-require-mark="f.required" :validation-status="status(f.key)" :feedback="feedback(f.key)">
          <n-checkbox-group :value="data[f.key] ?? []" @update:value="(v) => (data[f.key] = v)">
            <div class="flex flex-wrap gap-x-4 gap-y-2">
              <n-checkbox v-for="d in 7" :key="d" :value="d" :label="$t(`applicationPage.schema.weekdays.${d}`)" />
            </div>
          </n-checkbox-group>
        </n-form-item>
      </div>

      <!-- Son -->
      <div class="col-span-12 md:col-span-6" v-else-if="f.kind === 'number'">
        <n-form-item :label="f.label" :show-require-mark="f.required" :validation-status="status(f.key)" :feedback="feedback(f.key)">
          <n-input-number class="w-full" v-model:value="data[f.key]" :min="1" :show-button="false" />
        </n-form-item>
      </div>

      <!-- Matn -->
      <div class="col-span-12" v-else>
        <n-form-item :label="f.label" :show-require-mark="f.required" :validation-status="status(f.key)" :feedback="feedback(f.key)">
          <n-input
            v-model:value="data[f.key]"
            :type="f.kind === 'textarea' ? 'textarea' : 'text'"
            :autosize="f.kind === 'textarea' ? { minRows: 2, maxRows: 6 } : undefined"
          />
        </n-form-item>
      </div>
    </template>
  </div>
</template>
