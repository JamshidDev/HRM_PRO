<script setup>
  import { useComponentStore } from '@/store/modules/index.js'
  import { UIModal, UISelect } from '@/components/index.js'
  import {
    ArrowDownload24Regular,
    CalendarClock24Regular,
    Table24Regular,
    PeopleTeam24Regular
  } from '@vicons/fluent'
  import { useMessage } from 'naive-ui'
  import { useAppSetting } from '@/utils/AppSetting.js'
  import i18n from '@/i18n/index.js'

  const componentStore = useComponentStore()
  const message = useMessage()
  const { t } = i18n.global
  const { proxy } = getCurrentInstance()

  // Submit tugmalari ref'i — $flyUpload (job navbatga uchish effekti) uchun.
  const submitBtn1Ref = ref(null)
  const submitBtn2Ref = ref(null)
  const submitBtn3Ref = ref(null)
  const flyFrom = (btnRef) => {
    const el = btnRef.value?.$el || btnRef.value
    if (el) proxy.$flyUpload(el)
  }

  // ===== Umumiy: access_level ro'yxati (eventsV2 bilan bir manba) =====
  const accessLevelOptions = ref([])
  const accessLevelLoading = ref(false)
  const loadAccessLevels = () => {
    if (accessLevelOptions.value.length) return
    accessLevelLoading.value = true
    $ApiService.turnstileHikCentralAccessService
      ._index({ params: { per_page: 1000 } })
      .then((res) => {
        const raw = res.data?.data
        const list = Array.isArray(raw) ? raw : (raw?.data ?? [])
        accessLevelOptions.value = list.map((a) => ({
          label: a.name ?? `#${a.id}`,
          value: a.id
        }))
      })
      .catch(() => (accessLevelOptions.value = []))
      .finally(() => (accessLevelLoading.value = false))
  }
  const loadStructure = () => {
    if (componentStore.structureList.length === 0) componentStore._structures()
  }
  const openCommon = () => {
    loadStructure()
    loadAccessLevels()
  }

  const fmtDate = (ts) => {
    const d = new Date(ts)
    const p = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
  }
  const fmtMonth = (ts) => {
    const d = new Date(ts)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  // ===== Card 1: davr bo'yicha (har-xodim detali) =====
  const d1 = reactive({
    show: false,
    loading: false,
    orgs: [],
    orgChecked: [],
    access: [],
    from: null,
    to: null,
    startTime: '09:10'
  })
  const openD1 = () => {
    const now = new Date()
    Object.assign(d1, {
      show: true,
      loading: false,
      orgs: [],
      orgChecked: [],
      access: [],
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime(),
      to: new Date(now.getFullYear(), now.getMonth(), 0).getTime(),
      startTime: '09:10'
    })
    openCommon()
  }
  const submitD1 = () => {
    if (d1.orgs.length === 0)
      return message.error(t('workerReport.validation.organizations'))
    if (d1.access.length === 0)
      return message.error(t('workerReport.validation.accessLevels'))
    if (!d1.from || !d1.to)
      return message.error(t('workerReport.validation.period'))
    if (d1.to < d1.from)
      return message.error(t('workerReport.validation.dateOrder'))
    if (!d1.startTime)
      return message.error(t('workerReport.validation.startTime'))
    // Validatsiyadan o'tdi → uchish effekti + so'rov.
    flyFrom(submitBtn1Ref)
    d1.loading = true
    $ApiService.lateWorkersReportService
      ._lateWorkersExport({
        params: {
          from: fmtDate(d1.from),
          to: fmtDate(d1.to),
          start_time: d1.startTime,
          organizations: d1.orgs.map((o) => o.id).join(','),
          access_levels: d1.access.join(',')
        }
      })
      .then(() => {
        message.success(t('workerReport.queued'))
        d1.show = false
      })
      .catch(() => message.error(t('workerReport.failed')))
      .finally(() => (d1.loading = false))
  }

  // ===== Card 2: yarim yillik (korxona × oy matritsa) =====
  const d2 = reactive({
    show: false,
    loading: false,
    orgs: [],
    orgChecked: [],
    access: [],
    from: null,
    to: null,
    startTime: '09:10'
  })
  const openD2 = () => {
    const now = new Date()
    Object.assign(d2, {
      show: true,
      loading: false,
      orgs: [],
      orgChecked: [],
      access: [],
      from: new Date(now.getFullYear(), now.getMonth() - 5, 1).getTime(),
      to: new Date(now.getFullYear(), now.getMonth(), 1).getTime(),
      startTime: '09:10'
    })
    openCommon()
  }
  const submitD2 = () => {
    if (d2.orgs.length === 0)
      return message.error(t('workerReport.validation.organizations'))
    if (d2.access.length === 0)
      return message.error(t('workerReport.validation.accessLevels'))
    if (!d2.from || !d2.to)
      return message.error(t('workerReport.validation.period'))
    if (d2.to < d2.from)
      return message.error(t('workerReport.validation.monthOrder'))
    const spanMonths = (() => {
      const a = new Date(d2.from)
      const b = new Date(d2.to)
      return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
    })()
    if (spanMonths > 23)
      return message.error(t('workerReport.validation.maxSpan'))
    if (!d2.startTime)
      return message.error(t('workerReport.validation.startTime'))
    // Validatsiyadan o'tdi → uchish effekti + so'rov.
    flyFrom(submitBtn2Ref)
    d2.loading = true
    $ApiService.lateWorkersHalfYearReportService
      ._export({
        params: {
          organizations: d2.orgs.map((o) => o.id).join(','),
          access_levels: d2.access.join(','),
          from: fmtMonth(d2.from),
          to: fmtMonth(d2.to),
          start_time: d2.startTime
        }
      })
      .then(() => {
        message.success(t('workerReport.queued'))
        d2.show = false
      })
      .catch(() => message.error(t('workerReport.failed')))
      .finally(() => (d2.loading = false))
  }

  // ===== Card 3: yaqin qarindoshi kam xodimlar (parametrsiz, to'g'ridan async) =====
  const d3 = reactive({ loading: false })
  const submitD3 = () => {
    // Filtr yo'q → to'g'ridan-to'g'ri: uchish effekti + so'rov.
    flyFrom(submitBtn3Ref)
    d3.loading = true
    $ApiService.relativesShortageReportService
      ._export()
      .then(() => message.success(t('workerReport.queued')))
      .catch(() => message.error(t('workerReport.failed')))
      .finally(() => (d3.loading = false))
  }
</script>

<template>
  <div class="p-4">
    <div class="grid grid-cols-12 gap-4">
      <!-- Card 1: davr bo'yicha -->
      <div
        class="col-span-3 h-full bg-surface-section border border-surface-line rounded-2xl p-5 flex flex-col relative overflow-hidden"
      >
        <div
          class="absolute -bottom-8 right-3 text-[140px] font-black leading-none text-success/20 pointer-events-none select-none z-0"
        >
          1
        </div>
        <div class="relative z-[1] flex flex-col h-full">
          <div class="flex items-center gap-3">
            <div
              class="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl bg-success/10 text-success"
            >
              <n-icon size="24"><CalendarClock24Regular /></n-icon>
            </div>
            <h3 class="text-[15px] font-semibold text-textColor0 leading-snug">
              {{ $t('workerReport.byDate.title') }}
            </h3>
          </div>
          <div class="flex-1 min-h-[48px]"></div>
          <n-button type="success" size="small" class="w-full" @click="openD1">
            <template #icon><n-icon><ArrowDownload24Regular /></n-icon></template>
            {{ $t('workerReport.createButton') }}
          </n-button>
        </div>
      </div>

      <!-- Card 2: yarim yillik -->
      <div
        class="col-span-3 h-full bg-surface-section border border-surface-line rounded-2xl p-5 flex flex-col relative overflow-hidden"
      >
        <div
          class="absolute -bottom-8 right-3 text-[140px] font-black leading-none text-success/20 pointer-events-none select-none z-0"
        >
          2
        </div>
        <div class="relative z-[1] flex flex-col h-full">
          <div class="flex items-center gap-3">
            <div
              class="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl bg-success/10 text-success"
            >
              <n-icon size="24"><Table24Regular /></n-icon>
            </div>
            <h3 class="text-[15px] font-semibold text-textColor0 leading-snug">
              {{ $t('workerReport.halfYear.title') }}
            </h3>
          </div>
          <div class="flex-1 min-h-[48px]"></div>
          <n-button type="success" size="small" class="w-full" @click="openD2">
            <template #icon><n-icon><ArrowDownload24Regular /></n-icon></template>
            {{ $t('workerReport.createButton') }}
          </n-button>
        </div>
      </div>

      <!-- Card 3: yaqin qarindoshi kam xodimlar (parametrsiz) -->
      <div
        class="col-span-3 h-full bg-surface-section border border-surface-line rounded-2xl p-5 flex flex-col relative overflow-hidden"
      >
        <div
          class="absolute -bottom-8 right-3 text-[140px] font-black leading-none text-success/20 pointer-events-none select-none z-0"
        >
          3
        </div>
        <div class="relative z-[1] flex flex-col h-full">
          <div class="flex items-center gap-3">
            <div
              class="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl bg-success/10 text-success"
            >
              <n-icon size="24"><PeopleTeam24Regular /></n-icon>
            </div>
            <h3 class="text-[15px] font-semibold text-textColor0 leading-snug">
              {{ $t('workerReport.relativesShortage.title') }}
            </h3>
          </div>
          <div class="flex-1 min-h-[48px]"></div>
          <n-button
            ref="submitBtn3Ref"
            type="success"
            size="small"
            class="w-full"
            :loading="d3.loading"
            @click="submitD3"
          >
            <template #icon><n-icon><ArrowDownload24Regular /></n-icon></template>
            {{ $t('workerReport.createButton') }}
          </n-button>
        </div>
      </div>
    </div>

    <!-- Modal 1: davr bo'yicha -->
    <UIModal
      v-model:visible="d1.show"
      :title="$t('workerReport.byDate.title')"
      width="560"
    >
      <div class="py-1 flex flex-col gap-4">
        <div>
          <label class="text-xs text-textColor3 mb-1 block">
            {{ $t('workerReport.organizations') }}
          </label>
          <UISelect
            :options="componentStore.structureList"
            :modelV="d1.orgs"
            :checkedVal="d1.orgChecked"
            :multiple="true"
            :loading="componentStore.structureLoading"
            v-model:search="componentStore.structureParams.search"
            @updateModel="(v) => (d1.orgs = v)"
            @updateCheck="(v) => (d1.orgChecked = v)"
            @onSearch="componentStore._structures"
          />
        </div>
        <div>
          <label class="text-xs text-textColor3 mb-1 block">
            {{ $t('workerReport.accessLevels') }}
          </label>
          <n-select
            v-model:value="d1.access"
            :options="accessLevelOptions"
            :loading="accessLevelLoading"
            multiple
            filterable
            clearable
            :placeholder="$t('workerReport.accessLevels')"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-textColor3 mb-1 block">
              {{ $t('workerReport.from') }}
            </label>
            <n-date-picker
              v-model:value="d1.from"
              type="date"
              clearable
              class="w-full"
              :format="useAppSetting.datePicketFormat"
            />
          </div>
          <div>
            <label class="text-xs text-textColor3 mb-1 block">
              {{ $t('workerReport.to') }}
            </label>
            <n-date-picker
              v-model:value="d1.to"
              type="date"
              clearable
              class="w-full"
              :format="useAppSetting.datePicketFormat"
            />
          </div>
        </div>
        <div>
          <label class="text-xs text-textColor3 mb-1 block">
            {{ $t('workerReport.startTime') }}
          </label>
          <n-time-picker
            v-model:formatted-value="d1.startTime"
            format="HH:mm"
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <div class="grid grid-cols-2 gap-3 pt-2">
          <n-button @click="d1.show = false" :disabled="d1.loading" type="error" ghost>
            {{ $t('content.cancel') }}
          </n-button>
          <n-button ref="submitBtn1Ref" type="success" :loading="d1.loading" @click="submitD1">
            <template #icon><n-icon><ArrowDownload24Regular /></n-icon></template>
            {{ $t('workerReport.download') }}
          </n-button>
        </div>
      </template>
    </UIModal>

    <!-- Modal 2: yarim yillik -->
    <UIModal
      v-model:visible="d2.show"
      :title="$t('workerReport.halfYear.title')"
      width="560"
    >
      <div class="py-1 flex flex-col gap-4">
        <div>
          <label class="text-xs text-textColor3 mb-1 block">
            {{ $t('workerReport.organizations') }}
          </label>
          <UISelect
            :options="componentStore.structureList"
            :modelV="d2.orgs"
            :checkedVal="d2.orgChecked"
            :multiple="true"
            :loading="componentStore.structureLoading"
            v-model:search="componentStore.structureParams.search"
            @updateModel="(v) => (d2.orgs = v)"
            @updateCheck="(v) => (d2.orgChecked = v)"
            @onSearch="componentStore._structures"
          />
        </div>
        <div>
          <label class="text-xs text-textColor3 mb-1 block">
            {{ $t('workerReport.accessLevels') }}
          </label>
          <n-select
            v-model:value="d2.access"
            :options="accessLevelOptions"
            :loading="accessLevelLoading"
            multiple
            filterable
            clearable
            :placeholder="$t('workerReport.accessLevels')"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-textColor3 mb-1 block">
              {{ $t('workerReport.fromMonth') }}
            </label>
            <n-date-picker v-model:value="d2.from" type="month" clearable class="w-full" />
          </div>
          <div>
            <label class="text-xs text-textColor3 mb-1 block">
              {{ $t('workerReport.toMonth') }}
            </label>
            <n-date-picker v-model:value="d2.to" type="month" clearable class="w-full" />
          </div>
        </div>
        <div>
          <label class="text-xs text-textColor3 mb-1 block">
            {{ $t('workerReport.startTime') }}
          </label>
          <n-time-picker
            v-model:formatted-value="d2.startTime"
            format="HH:mm"
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <div class="grid grid-cols-2 gap-3 pt-2">
          <n-button @click="d2.show = false" :disabled="d2.loading" type="error" ghost>
            {{ $t('content.cancel') }}
          </n-button>
          <n-button ref="submitBtn2Ref" type="success" :loading="d2.loading" @click="submitD2">
            <template #icon><n-icon><ArrowDownload24Regular /></n-icon></template>
            {{ $t('workerReport.download') }}
          </n-button>
        </div>
      </template>
    </UIModal>
  </div>
</template>
