<script setup>
  // Ariza turi tavsifidan (backend application_schema) chiziladigan umumiy forma.
  import { useComponentStore, useConfApplicationStore } from '@/store/modules/index.js'
  import { UIDepartmentSelect, UISelect } from '@/components/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useConfApplicationStore()
  const componentStore = useComponentStore()
  const OTHER = 0
  const DATE_FMT = 'yyyy-MM-dd'

  const def = computed(() => store.schemaDef())
  const fields = computed(() => def.value?.fields ?? [])
  const data = computed(() => store.payload.data)
  const errors = ref({})

  // Bo'lim qaysi korxonadan: tanlangan korxona (1), formadagi korxona (11) yoki o'z lavozimi.
  const deptOrg = computed(() => {
    if (fields.value.some((f) => f.kind === 'organization' && f.key === 'organization_id')) {
      return data.value.organization_id || null
    }
    if (def.value?.place === 'organization') {
      return store.organization_id?.[0]?.id ?? null
    }
    return store.confirmParams.organization_id ?? null
  })

  // ---- Korxona (daraxt) ----
  const orgModel = ref({})
  const orgCheck = ref({})
  // Tahrirda faqat ID saqlangan — daraxtdan nomini topib tanlovni tiklaymiz.
  const findOrg = (list, id) => {
    for (const o of list || []) {
      if (o.id === id) return o
      const hit = findOrg(o.children, id)
      if (hit) return hit
    }
    return null
  }
  const restoreOrgs = () => {
    for (const f of fields.value.filter((x) => x.kind === 'organization')) {
      const id = Number(data.value[f.key])
      if (id > 0 && !orgModel.value[f.key]?.length) {
        const o = findOrg(componentStore.allStructureList, id)
        if (o) orgModel.value[f.key] = [{ id: o.id, name: o.name }]
      }
    }
  }
  watch(() => componentStore.allStructureList, restoreOrgs)
  const onOrg = (f, v) => {
    orgModel.value[f.key] = v
    const id = v?.[0]?.id ?? null
    if (f.key === 'organization_id' && data.value.organization_id !== id) {
      delete data.value.department_id
      delete data.value.department_position_id
      positions.value = []
    }
    data.value[f.key] = id
  }

  // ---- Bo'lim → lavozim ----
  const positions = ref([])
  const positionsLoading = ref(false)
  const loadPositions = (deptId) => {
    positions.value = []
    if (!deptId) return
    positionsLoading.value = true
    $ApiService.componentService
      ._allPosition({ params: { department_id: deptId } })
      .then((res) => {
        positions.value = res.data.data.map((v) => ({ id: v.id, name: v.position?.name }))
      })
      .finally(() => (positionsLoading.value = false))
  }
  const onDepartment = (id) => {
    data.value.department_id = id ?? null
    delete data.value.department_position_id
    loadPositions(id)
  }

  // ---- Farzand: ro'yxatdan yoki qo'lda ----
  const children = ref([])
  const childMode = ref('list')
  const loadChildren = () => {
    $ApiService.applicationService._myChildren().then((res) => {
      children.value = res.data.data ?? []
      if (!children.value.length) childMode.value = 'manual'
    })
  }
  const onChild = (id) => {
    const c = children.value.find((v) => v.id === id)
    data.value.child_relative_id = id
    data.value.child_full_name = c?.full_name ?? null
    // Kartochkada sana bo'lmasa — xodim o'zi tanlaydi.
    data.value.child_birthday = c?.birthday ? String(c.birthday).slice(0, 10) : null
  }
  const childHasBirthday = computed(() => {
    const c = children.value.find((v) => v.id === data.value.child_relative_id)
    return !!c?.birthday
  })
  const onChildMode = (mode) => {
    childMode.value = mode
    data.value.child_relative_id = null
    data.value.child_full_name = null
    data.value.child_birthday = null
  }

  // ---- Oraliqlar: [boshi, oxiri] ↔ data[keys] ----
  const rangeValue = (f) => {
    const [a, b] = f.keys
    return data.value[a] && data.value[b] ? [data.value[a], data.value[b]] : null
  }
  const setRange = (f, v) => {
    const [a, b] = f.keys
    data.value[a] = v?.[0] ?? null
    data.value[b] = v?.[1] ?? null
  }
  const countOf = (f) => {
    const [a, b] = f.keys
    const from = data.value[a]
    const to = data.value[b]
    if (!from || !to) return null
    if (f.days_key) return Math.round((Date.parse(to) - Date.parse(from)) / 86400000) + 1
    const [fy, fm] = from.split('-').map(Number)
    const [ty, tm] = to.split('-').map(Number)
    return (ty - fy) * 12 + (tm - fm) + 1
  }

  const selectOptions = (f) =>
    f.other ? [...f.options, { value: OTHER, label: t('applicationPage.schema.other') }] : f.options

  const isBlank = (v) => v === undefined || v === null || (typeof v === 'string' && !v.trim())

  // Majburiy maydonlar — xato shu maydon ostida.
  const validate = () => {
    const e = {}
    for (const f of fields.value) {
      if (f.kind === 'child') {
        if (isBlank(data.value.child_full_name)) e.child_full_name = true
        if (isBlank(data.value.child_birthday)) e.child_birthday = true
        continue
      }
      if (!f.required) continue
      const keys = f.keys ?? [f.key]
      if (keys.some((k) => isBlank(data.value[k]))) e[f.key] = true
      else if ((f.kind === 'select' || f.kind === 'organization') && f.other && Number(data.value[f.key]) === OTHER) {
        if (isBlank(data.value[`${f.key}_text`])) e[`${f.key}_text`] = true
      }
    }
    errors.value = e
    return Object.keys(e).length === 0
  }
  defineExpose({ validate })

  // Xato ko'rsatilgandan keyin — to'ldirilgan maydon xatosi darrov o'chadi.
  watch(
    data,
    () => {
      if (Object.keys(errors.value).length) validate()
    },
    { deep: true }
  )

  const status = (key) => (errors.value[key] ? 'error' : undefined)
  const feedback = (key) => (errors.value[key] ? t('rules.requiredField') : undefined)

  watch(
    () => def.value?.id,
    () => {
      errors.value = {}
      positions.value = []
      if (fields.value.some((f) => f.kind === 'child')) loadChildren()
      if (data.value.department_id) loadPositions(data.value.department_id)
      if (componentStore.allStructureList.length === 0) componentStore._allStructures()
      else restoreOrgs()
    },
    { immediate: true }
  )
</script>

<template>
  <div class="grid grid-cols-12 gap-x-4" v-if="def">
    <template v-for="f in fields" :key="f.key">
      <!-- Korxona (daraxt), «Boshqa» bo'lsa — matn -->
      <div class="col-span-12 pr-3" v-if="f.kind === 'organization'">
        <n-form-item :label="f.label" :show-require-mark="f.required" :validation-status="status(f.key)" :feedback="feedback(f.key)">
          <div class="w-full flex flex-col gap-2">
            <UISelect
              v-if="Number(data[f.key]) !== OTHER || !f.other"
              :options="componentStore.allStructureList"
              :model-v="orgModel[f.key] || []"
              @defaultValue="() => {}"
              @updateModel="(v) => onOrg(f, v)"
              :checked-val="orgCheck[f.key] || []"
              @updateCheck="(v) => (orgCheck[f.key] = v)"
              v-model:search="componentStore.structureParams.search"
              @onSearch="componentStore._allStructures"
              @onSubmit="componentStore._allStructures"
              :loading="componentStore.allStructureLoading"
              :multiple="false"
            />
            <n-checkbox
              v-if="f.other"
              :checked="Number(data[f.key]) === OTHER"
              @update:checked="(v) => (data[f.key] = v ? OTHER : null)"
            >
              {{ $t('applicationPage.schema.otherOrganization') }}
            </n-checkbox>
            <n-input
              v-if="f.other && Number(data[f.key]) === OTHER"
              v-model:value="data[`${f.key}_text`]"
              :status="status(`${f.key}_text`)"
              :placeholder="$t('applicationPage.schema.otherText')"
            />
          </div>
        </n-form-item>
      </div>

      <!-- Bo'lim (daraxt) -->
      <div class="col-span-12 pr-3" v-else-if="f.kind === 'department'">
        <n-form-item :label="f.label" :show-require-mark="f.required" :validation-status="status(f.key)" :feedback="feedback(f.key)">
          <UIDepartmentSelect
            :model-value="data.department_id ?? null"
            @update:model-value="onDepartment"
            :organization="deptOrg"
            source="all"
            :disabled="!deptOrg"
          />
        </n-form-item>
      </div>

      <!-- Bo'lim lavozimlari -->
      <div class="col-span-12" v-else-if="f.kind === 'department_position'">
        <n-form-item :label="f.label" :show-require-mark="f.required" :validation-status="status(f.key)" :feedback="feedback(f.key)">
          <n-select
            v-model:value="data[f.key]"
            :disabled="!data.department_id"
            filterable
            :options="positions"
            label-field="name"
            value-field="id"
            :loading="positionsLoading"
          />
        </n-form-item>
      </div>

      <!-- Farzand: ro'yxatdan yoki qo'lda -->
      <div class="col-span-12" v-else-if="f.kind === 'child'">
        <n-form-item :label="f.label" :show-require-mark="true">
          <n-radio-group :value="childMode" @update:value="onChildMode">
            <n-radio value="list" :disabled="!children.length">{{ $t('applicationPage.schema.childFromList') }}</n-radio>
            <n-radio value="manual">{{ $t('applicationPage.schema.childManual') }}</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item
          v-if="childMode === 'list'"
          :label="$t('applicationPage.schema.childName')"
          :show-require-mark="true"
          :validation-status="status('child_full_name')"
          :feedback="feedback('child_full_name')"
        >
          <n-select
            :value="data.child_relative_id ?? null"
            @update:value="onChild"
            :options="children.map((c) => ({ value: c.id, label: c.full_name + (c.birthday ? ' · ' + String(c.birthday).slice(0, 10) : '') }))"
          />
        </n-form-item>
        <n-form-item
          v-else
          :label="$t('applicationPage.schema.childName')"
          :show-require-mark="true"
          :validation-status="status('child_full_name')"
          :feedback="feedback('child_full_name')"
        >
          <n-input v-model:value="data.child_full_name" />
        </n-form-item>
        <n-form-item
          :label="$t('applicationPage.schema.childBirthday')"
          :show-require-mark="true"
          :validation-status="status('child_birthday')"
          :feedback="feedback('child_birthday')"
        >
          <n-date-picker
            class="w-full"
            type="date"
            v-model:formatted-value="data.child_birthday"
            :value-format="DATE_FMT"
            :format="useAppSetting.datePicketFormat"
            :disabled="childMode === 'list' && childHasBirthday"
          />
        </n-form-item>
      </div>

      <!-- Sana oralig'i (+ kunlar/oylar soni) -->
      <div class="col-span-12" v-else-if="f.kind === 'daterange'">
        <n-form-item :label="f.label" :show-require-mark="f.required" :validation-status="status(f.key)" :feedback="feedback(f.key)">
          <div class="w-full flex flex-col gap-1">
            <n-date-picker
              class="w-full"
              type="daterange"
              :formatted-value="rangeValue(f)"
              @update:formatted-value="(v) => setRange(f, v)"
              :value-format="DATE_FMT"
              :format="useAppSetting.datePicketFormat"
            />
            <span v-if="(f.days_key || f.months_key) && countOf(f)" class="text-xs text-gray-500">
              {{ f.days_key ? $t('applicationPage.schema.days', { n: countOf(f) }) : $t('applicationPage.schema.months', { n: countOf(f) }) }}
            </span>
          </div>
        </n-form-item>
      </div>

      <!-- Vaqt oralig'i -->
      <div class="col-span-12" v-else-if="f.kind === 'timerange'">
        <n-form-item :label="f.label" :show-require-mark="f.required" :validation-status="status(f.key)" :feedback="feedback(f.key)">
          <div class="w-full grid grid-cols-2 gap-2">
            <n-time-picker v-for="k in f.keys" :key="k" class="w-full" v-model:formatted-value="data[k]" value-format="HH:mm" format="HH:mm" />
          </div>
        </n-form-item>
      </div>

      <!-- Sana -->
      <div class="col-span-12" v-else-if="f.kind === 'date'">
        <n-form-item :label="f.label" :show-require-mark="f.required" :validation-status="status(f.key)" :feedback="feedback(f.key)">
          <n-date-picker
            class="w-full"
            type="date"
            v-model:formatted-value="data[f.key]"
            :value-format="DATE_FMT"
            :format="useAppSetting.datePicketFormat"
          />
        </n-form-item>
      </div>

      <!-- Variantlar (+ «Boshqa» → matn) -->
      <div class="col-span-12" v-else-if="f.kind === 'select'">
        <n-form-item :label="f.label" :show-require-mark="f.required" :validation-status="status(f.key)" :feedback="feedback(f.key)">
          <div class="w-full flex flex-col gap-2">
            <n-select v-model:value="data[f.key]" :options="selectOptions(f)" />
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

      <!-- Son -->
      <div class="col-span-12" v-else-if="f.kind === 'number'">
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
