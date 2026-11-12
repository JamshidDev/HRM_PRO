<script setup>
  // Eski (qog'oz) buyruqni ro'yxatdan o'tkazish: PDF yuklanadi, generatsiya/imzo yo'q.
  import { Info16Regular } from '@vicons/fluent'
  import { UISelect, SuperSelect } from '@/components/index.js'
  import FileTiles from './ui/FileTiles.vue'
  import { useCommandStore, useComponentStore } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useCommandStore()
  const componentStore = useComponentStore()

  const formRef = ref(null)
  const emptyForm = () => ({
    organization: [],
    command_type: null,
    legacy_award: null,
    command_number: '',
    command_date: null,
    workers: [],
    files: [],
    attachments: []
  })
  const form = ref(emptyForm())
  const structureCheck = ref([])

  // Xodimlar — tanlangan korxonada ishlagan (bo'shatilganlar ham), bitta xodim bir marta.
  const workerList = ref([])
  const workerLoading = ref(false)
  const workerTotal = ref(0)
  const workerParams = ref({ page: 1, per_page: 50, search: null })
  let workerReqId = 0

  // Hozircha faqat shu turlar ro'yxatdan o'tkaziladi (backend ham tekshiradi).
  const LEGACY_TYPES = [71, 72, 73]
  const typeOptions = computed(() =>
    componentStore.commandTypes.filter((v) => LEGACY_TYPES.includes(v.id))
  )

  // Rag'batlantirish (71) — mukofot turi majburiy; ro'yxat guruhlab ko'rsatiladi.
  const INCENTIVE_TYPE = 71
  const AWARD_GROUPS = ['title', 'order', 'medal', 'honorary', 'other']
  const awards = ref([])
  const awardLoading = ref(false)
  const isIncentive = computed(() => form.value.command_type === INCENTIVE_TYPE)
  const awardOptions = computed(() =>
    AWARD_GROUPS.map((g) => ({
      type: 'group',
      key: g,
      label: t(`commandPage.legacy.awardGroups.${g}`),
      children: awards.value
        .filter((a) => a.group === g)
        .map((a) => ({ label: a.name, value: a.id }))
    })).filter((g) => g.children.length)
  )
  watch(isIncentive, (v) => {
    if (!v) form.value.legacy_award = null
    if (!v || awards.value.length || awardLoading.value) return
    awardLoading.value = true
    $ApiService.commandService
      ._legacyAwards()
      .then((res) => (awards.value = res.data.data || []))
      .finally(() => (awardLoading.value = false))
  })

  const organizationId = computed(() => form.value.organization?.[0]?.id ?? null)

  const loadWorkers = (append = false) => {
    if (!organizationId.value) return
    const reqId = ++workerReqId
    workerLoading.value = true
    $ApiService.workerService
      ._search({
        params: {
          ...workerParams.value,
          organization_id: organizationId.value,
          include_inactive: 1
        }
      })
      .then((res) => {
        if (reqId !== workerReqId) return
        const rows = res.data.data.data
          .filter((v) => v.worker?.id)
          .map((v) => ({
            id: v.worker.id,
            name: [v.worker.last_name, v.worker.first_name, v.worker.middle_name]
              .filter(Boolean)
              .join(' '),
            position: v.position?.name || v?.post_name,
            photo: v.worker?.photo
          }))
        const merged = append ? [...workerList.value, ...rows] : rows
        workerList.value = [...new Map(merged.map((w) => [w.id, w])).values()]
        workerTotal.value = res.data.data.total
      })
      .finally(() => {
        if (reqId === workerReqId) workerLoading.value = false
      })
  }

  const onSearchWorker = () => {
    workerParams.value.page = 1
    loadWorkers()
  }

  const onScrollWorker = () => {
    if (workerList.value.length >= workerTotal.value) return
    workerParams.value.page += 1
    loadWorkers(true)
  }

  const onChangeOrganization = (v) => {
    form.value.organization = v
    form.value.workers = []
    workerList.value = []
    workerParams.value = { page: 1, per_page: 50, search: null }
    loadWorkers()
  }

  // Faqat 2024-12-31 gacha (shu kun ham) sana; backend ham tekshiradi.
  const LEGACY_BEFORE = new Date(2025, 0, 1).getTime()
  const isDateDisabled = (ts) => ts >= LEGACY_BEFORE

  // Ilovalar: PDF/rasm, har biri 10 MB gacha, ko'pi bilan 3 ta; asosiy fayl ham 10 MB (backend bilan bir xil).
  const ATTACH_MAX = 3
  const ATTACH_MAX_MB = 10

  const toYmd = (ts) => {
    const d = new Date(ts)
    const p = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
  }

  const rules = computed(() => ({
    organization: {
      required: true,
      validator: () => (organizationId.value ? true : new Error(t('rules.requiredField'))),
      trigger: ['change', 'blur']
    },
    command_type: {
      required: true,
      type: 'number',
      message: t('rules.requiredField'),
      trigger: 'change'
    },
    command_number: { required: true, message: t('rules.requiredField'), trigger: 'blur' },
    command_date: {
      required: true,
      type: 'number',
      message: t('rules.requiredField'),
      trigger: 'change'
    },
    legacy_award: {
      validator: () =>
        !isIncentive.value || form.value.legacy_award ? true : new Error(t('rules.requiredField')),
      trigger: 'change'
    },
    workers: {
      required: true,
      type: 'array',
      min: 1,
      message: t('rules.requiredField'),
      trigger: 'change'
    },
    files: {
      required: true,
      validator: () => {
        if (!form.value.files.length) return new Error(t('commandPage.legacy.fileRequired'))
        if (form.value.files[0].file?.size > ATTACH_MAX_MB * 1024 * 1024)
          return new Error(t('commandPage.legacy.fileSize', { mb: ATTACH_MAX_MB }))
        return true
      },
      trigger: 'change'
    },
    attachments: {
      validator: () => {
        const list = form.value.attachments
        if (list.length > ATTACH_MAX)
          return new Error(t('commandPage.legacy.attachmentsMax', { max: ATTACH_MAX }))
        if (list.some((f) => f.file?.size > ATTACH_MAX_MB * 1024 * 1024))
          return new Error(t('commandPage.legacy.attachmentsSize', { mb: ATTACH_MAX_MB }))
        return true
      },
      trigger: 'change'
    }
  }))

  const reset = () => {
    form.value = emptyForm()
    structureCheck.value = []
    workerList.value = []
    workerTotal.value = 0
    workerParams.value = { page: 1, per_page: 50, search: null }
    formRef.value?.restoreValidation()
  }

  const submit = () => {
    formRef.value?.validate((errors) => {
      if (errors) return
      const fd = new FormData()
      fd.append('organization_id', organizationId.value)
      fd.append('command_type', form.value.command_type)
      if (isIncentive.value) fd.append('legacy_award', form.value.legacy_award)
      fd.append('command_number', form.value.command_number.trim())
      fd.append('command_date', toYmd(form.value.command_date))
      form.value.workers.forEach((id) => fd.append('workers[]', id))
      fd.append('file', form.value.files[0].file)
      form.value.attachments.forEach((f) => fd.append('attachments', f.file))
      store._createLegacy(fd)
    })
  }

  // Oyna har ochilganda forma toza.
  watch(
    () => store.visible,
    (open) => open && reset()
  )

  onMounted(() => {
    if (!componentStore.structureList.length) componentStore._structures()
    if (!componentStore.commandTypes.length) componentStore._enumsAdmin()
  })

  defineExpose({ submit })
</script>

<template>
  <div class="legacy-command-body">
    <div
      class="mb-3 flex items-center gap-2 rounded-md border border-surface-line border-dashed bg-surface-ground p-2"
    >
      <span
        class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fig-chip-brand text-primary"
      >
        <n-icon size="14"><Info16Regular /></n-icon>
      </span>
      <span class="text-xs leading-4 text-textColor1">{{ $t('commandPage.legacy.notice') }}</span>
    </div>

    <n-form ref="formRef" :model="form" :rules="rules" label-placement="top">
      <div
        class="grid grid-cols-12 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground"
      >
        <n-form-item
          class="col-span-6 md:col-span-2"
          :label="$t('documentPage.command.form.command_number')"
          path="command_number"
        >
          <n-input class="w-full" type="text" v-model:value="form.command_number" :maxlength="15" />
        </n-form-item>

        <n-form-item
          class="col-span-6 md:col-span-2"
          :label="$t('documentPage.command.form.command_date')"
          path="command_date"
        >
          <n-date-picker
            v-model:value="form.command_date"
            type="date"
            class="w-full"
            :format="useAppSetting.datePicketFormat"
            :is-date-disabled="isDateDisabled"
            :default-calendar-start-time="new Date(2024, 11, 1).getTime()"
          />
        </n-form-item>

        <n-form-item
          class="col-span-12 md:col-span-8"
          :label="$t('documentPage.command.form.type')"
          path="command_type"
        >
          <n-select
            v-model:value="form.command_type"
            :options="typeOptions"
            :loading="componentStore.enumAdminLoading"
            label-field="name"
            value-field="id"
            filterable
            :consistent-menu-width="false"
          />
        </n-form-item>

        <n-form-item
          v-if="isIncentive"
          class="col-span-12"
          :label="$t('commandPage.legacy.award')"
          path="legacy_award"
          required
        >
          <n-select
            v-model:value="form.legacy_award"
            :options="awardOptions"
            :loading="awardLoading"
            filterable
          />
        </n-form-item>
      </div>

      <div
        class="mt-4 grid grid-cols-12 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground"
      >
        <n-form-item
          class="col-span-12 md:col-span-6"
          :label="$t('documentPage.form.organization')"
          path="organization"
        >
          <UISelect
            :options="componentStore.structureList"
            :model-v="form.organization"
            @updateModel="onChangeOrganization"
            :checked-val="structureCheck"
            @updateCheck="(v) => (structureCheck = v)"
            v-model:search="componentStore.structureParams.search"
            @onSearch="componentStore._structures"
            :loading="componentStore.structureLoading"
            :multiple="false"
          />
        </n-form-item>

        <n-form-item
          class="col-span-12 md:col-span-6"
          :label="$t('documentPage.form.worker')"
          path="workers"
        >
          <SuperSelect
            multiple
            :disabled="!organizationId"
            :max-tag-count="2"
            :options="workerList"
            :loading="workerLoading"
            :total-count="workerTotal"
            :per-page="workerParams.per_page"
            v-model:value="form.workers"
            v-model:search="workerParams.search"
            value-field="id"
            @onSearch="onSearchWorker"
            @onScrollEv="onScrollWorker"
          />
        </n-form-item>
      </div>

      <div
        class="mt-4 grid grid-cols-12 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground"
      >
        <n-form-item
          class="col-span-12 md:col-span-3"
          :label="$t('commandPage.legacy.file')"
          path="files"
        >
          <FileTiles
            v-model:files="form.files"
            accept="application/pdf,.pdf"
            hint="PDF · 10 MB"
            @update:files="formRef?.validate(undefined, (r) => r.key === 'files')"
          />
        </n-form-item>

        <n-form-item
          class="col-span-12 md:col-span-9"
          :label="$t('commandPage.legacy.attachments')"
          path="attachments"
        >
          <FileTiles
            v-model:files="form.attachments"
            multiple
            :max="ATTACH_MAX"
            accept="application/pdf,.pdf,image/png,image/jpeg,.png,.jpg,.jpeg"
            hint="PDF, PNG, JPG · 10 MB"
            @update:files="formRef?.validate(undefined, (r) => r.key === 'attachments')"
          />
        </n-form-item>
      </div>
    </n-form>
  </div>
</template>
