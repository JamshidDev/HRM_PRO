<script setup>
  import dayjs from 'dayjs'
  import { useAccountStore, useShiftTypeStore } from '@/store/modules/index.js'
  import { UIModal } from '@/components/index.js'
  import validationRules from '@/utils/validationRules.js'
  import Utils from '@/utils/Utils.js'
  import { useAppSetting } from '@/utils/index.js'
  import { crewSizeOf, cycleDays, isRotating } from '@/pages/turnstile/scheduleWorker/ui/navbat.js'
  import CrewInfo from './CrewInfo.vue'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useShiftTypeStore()
  const accStore = useAccountStore()
  const formRef = ref(null)

  // Grafik oldinga ko'pi bilan shuncha oyga tuziladi.
  const MAX_MONTHS_AHEAD = 3

  const shiftType = computed(() => store.list.find((v) => v.id === store.elementId) ?? null)
  const rotating = computed(() => isRotating(shiftType.value))
  const crewSize = computed(() => crewSizeOf(shiftType.value) ?? 1)
  const pattern = computed(() => cycleDays(shiftType.value))
  // Aylanma va har kunlik smenada xodimlar o'rinlarga joylanadi.
  const slotted = computed(() => rotating.value || store.isDailySchedule)


  // Grafik chegarasi — tanlangan oyning birinchi va oxirgi kuni yoki shu oy ichidagi davr.
  const monthRange = () => {
    const p = store.generatePayload
    if (p.period && p.period_from && p.period_to) {
      return {
        start_date: dayjs(p.period_from).format('YYYY-MM-DD'),
        end_date: dayjs(p.period_to).format('YYYY-MM-DD')
      }
    }
    const m = dayjs(p.month)
    return {
      start_date: m.startOf('month').format('YYYY-MM-DD'),
      end_date: m.endOf('month').format('YYYY-MM-DD')
    }
  }

  const isMonthDisabled = (ts) => {
    const m = dayjs(ts).startOf('month')
    const now = dayjs().startOf('month')
    return m.isBefore(now) || m.isAfter(now.add(MAX_MONTHS_AHEAD, 'month'))
  }

  // Yil va oy alohida tanlanadi; ichkarida bitta `month` (oy boshi timestamp) saqlanadi.
  const yearOptions = computed(() => {
    const now = dayjs()
    const last = now.add(MAX_MONTHS_AHEAD, 'month').year()
    const out = []
    for (let y = now.year(); y <= last; y++) out.push({ label: String(y), value: y })
    return out
  })
  const PERIOD = 'period'
  const monthOptions = computed(() => [
    ...Utils.monthList.map((m) => ({
      label: m.name,
      value: m.id,
      disabled: isMonthDisabled(new Date(year.value, m.id - 1, 1).getTime())
    })),
    { label: t('shiftType.generate.byPeriod'), value: PERIOD }
  ])
  const setMonth = (y, m) => {
    let ts = new Date(y, m - 1, 1).getTime()
    // Yil almashganda ruxsat etilmagan oy — eng yaqin ruxsat etilganiga suriladi.
    if (isMonthDisabled(ts)) {
      const first = Utils.monthList.find((x) => !isMonthDisabled(new Date(y, x.id - 1, 1).getTime()))
      ts = new Date(y, (first?.id ?? 1) - 1, 1).getTime()
    }
    store.generatePayload.month = ts
  }
  const year = computed({
    get: () => dayjs(store.generatePayload.month ?? Date.now()).year(),
    set: (y) => setMonth(y, month.value)
  })
  const month = computed({
    get: () => (store.generatePayload.period ? PERIOD : dayjs(store.generatePayload.month ?? Date.now()).month() + 1),
    set: (m) => {
      const p = store.generatePayload
      if (m === PERIOD) {
        // Davr standart holatda — tanlangan oyning birinchi va oxirgi kuni.
        const base = dayjs(p.month ?? Date.now())
        p.period_from = base.startOf('month').valueOf()
        p.period_to = base.endOf('month').startOf('day').valueOf()
        p.period = true
        return
      }
      p.period = false
      setMonth(year.value, m)
    }
  })

  // Davr bitta oy ichida: «gacha» sanasi «dan» oyidan chiqmaydi.
  const isFromDisabled = (ts) => isMonthDisabled(ts)
  const isToDisabled = (ts) => {
    const from = dayjs(store.generatePayload.period_from)
    const d = dayjs(ts)
    return d.isBefore(from, 'day') || !d.isSame(from, 'month')
  }
  watch(
    () => store.generatePayload.period_from,
    (v) => {
      const p = store.generatePayload
      if (!v || !p.period) return
      p.month = dayjs(v).startOf('month').valueOf()
      if (!p.period_to || isToDisabled(p.period_to)) p.period_to = dayjs(v).endOf('month').startOf('day').valueOf()
    }
  )

  // Xodimlar soni: aniq son, shu davrda umuman smenasi yo'qlar yoki korxonaning barcha shtat xodimlari.
  const counts = reactive({ free: null, all: null })
  const countLoading = ref(false)
  const countModeOptions = computed(() => [
    { label: t('shiftType.generate.byCount'), value: 'count' },
    { label: withCount(t('shiftType.generate.freeWorkersMode'), counts.free), value: 'free' },
    { label: withCount(t('shiftType.generate.allWorkersMode'), counts.all), value: 'all' }
  ])
  const withCount = (label, n) => (n == null ? label : `${label} (${n})`)

  const totalOf = (params) =>
    $ApiService.shiftTypeService
      ._getWorkers({ params: { page: 1, per_page: 1, ...params } })
      .then((res) => Number(res.data.data.total) || 0)

  const loadCounts = () => {
    const mode = store.generatePayload.count_mode
    if (mode === 'count' || !store.visible) return
    const range = monthRange()
    countLoading.value = true
    Promise.all([totalOf({ has_schedule: 'No', ...range }), totalOf({})])
      .then(([free, all]) => {
        counts.free = free
        counts.all = all
        if (store.generatePayload.count_mode !== 'count') {
          store.generatePayload.workers_count = store.generatePayload.count_mode === 'all' ? all : free
        }
      })
      .finally(() => {
        countLoading.value = false
      })
  }
  watch(
    () => [
      store.generatePayload.count_mode,
      store.generatePayload.month,
      store.generatePayload.period,
      store.generatePayload.period_from,
      store.generatePayload.period_to
    ],
    loadCounts
  )
  watch(
    () => store.visible,
    (v) => {
      if (v) {
        counts.free = null
        counts.all = null
      }
    }
  )

  const onSubmit = () => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsWorkersWrite)) return
    formRef.value?.validate((error) => {
      if (error) return
      if (!store.visibleType) {
        store._editGroup({ end_date: Utils.timeToZone(store.generatePayload.end_date) })
        return
      }
      const range = monthRange()
      if (slotted.value && !(Number(store.generatePayload.workers_count) > 0)) {
        $Toast.warning(t('shiftType.generate.noFreeWorkers'))
        return
      }
      store.generatePayload.start_date = range.start_date
      store.generatePayload.end_date = range.end_date

      if (slotted.value) {
        store.visible = false
        store.rotatingVisible = true
        return
      }

      store._generateSchedule({
        ...range,
        schedule_type: store.elementId,
        count: store.showGroupCountField ? store.generatePayload.count : undefined
      })
    })
  }
</script>

<template>
  <UIModal
    v-model:visible="store.visible"
    :width="580"
    :title="$t(store.visibleType ? 'shiftType.createTitle' : 'shiftType.updateTitle')"
  >
    <n-form ref="formRef" :rules="validationRules.common" :model="store.generatePayload">
      <template v-if="!store.visibleType">
        <n-form-item
          :label="$t(`content.date`)"
          path="end_date"
          :rule-path="validationRules.rulesNames.requiredNumberField"
        >
          <n-date-picker
            :format="useAppSetting.datePicketFormat"
            v-model:value="store.generatePayload.end_date"
            type="date"
            class="w-full"
          />
        </n-form-item>
      </template>

      <template v-else>
        <div v-if="shiftType" class="mb-5 p-3 rounded-xl border border-surface-line bg-surface-ground/40">
          <div class="flex items-center gap-2 min-w-0">
            <span class="px-1.5 py-px rounded bg-primary/10 text-primary text-xs font-medium shrink-0">
              {{ shiftType.type?.name }}
            </span>
            <span class="font-semibold line-clamp-1" :title="shiftType.name">{{ shiftType.name }}</span>
            <span
              v-if="rotating"
              class="ml-auto shrink-0 px-2 py-0.5 rounded-full bg-primary text-white text-xs font-medium"
            >
              {{ $t('shiftType.groupView.crewSize', { n: crewSize }) }}
            </span>
          </div>
          <div v-if="rotating" class="mt-3">
            <div class="text-xs text-secondary mb-1.5">
              {{ $t('shiftType.groupView.cycle', { n: pattern.length }) }}
            </div>
            <div class="flex flex-wrap gap-1">
              <div
                v-for="(d, i) in pattern"
                :key="i"
                class="w-[52px] h-[40px] rounded-md flex flex-col items-center justify-center text-[10px] leading-[1.15]"
                :class="d.work_status ? 'bg-primary/10 text-primary' : 'bg-surface-section text-secondary border border-dashed border-surface-line'"
              >
                <span class="opacity-70">{{ i + 1 }}</span>
                <template v-if="d.work_status">
                  <span class="font-medium">{{ d.start_time?.slice(0, 5) }}</span>
                  <span>{{ d.end_time?.slice(0, 5) }}</span>
                </template>
                <span v-else class="font-medium">{{ $t('shiftType.groupView.rest') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-12 gap-x-4">
          <n-form-item class="col-span-5 sm:col-span-4" :label="$t('content.year')">
            <n-select v-model:value="year" :options="yearOptions" :disabled="store.generatePayload.period" />
          </n-form-item>
          <n-form-item class="col-span-7 sm:col-span-8" :label="$t('content.month')">
            <n-select v-model:value="month" :options="monthOptions" />
          </n-form-item>
          <template v-if="store.generatePayload.period">
            <n-form-item class="col-span-6" :label="$t('shiftType.generate.periodFrom')">
              <n-date-picker
                v-model:value="store.generatePayload.period_from"
                type="date"
                class="w-full"
                :format="useAppSetting.datePicketFormat"
                :is-date-disabled="isFromDisabled"
              />
            </n-form-item>
            <n-form-item class="col-span-6" :label="$t('shiftType.generate.periodTo')">
              <n-date-picker
                v-model:value="store.generatePayload.period_to"
                type="date"
                class="w-full"
                :format="useAppSetting.datePicketFormat"
                :is-date-disabled="isToDisabled"
              />
            </n-form-item>
          </template>

          <n-form-item
            v-if="slotted"
            class="col-span-12"
            :label="$t('shiftType.generate.workersCount')"
            path="workers_count"
            :rule-path="validationRules.rulesNames.requiredNumberField"
          >
            <n-input-group>
              <n-input-number
                :min="1"
                :max="500"
                :step="1"
                class="flex-1"
                :disabled="store.generatePayload.count_mode !== 'count'"
                :show-button="false"
                :allow-input="Utils.onlyAllowNumber"
                v-model:value="store.generatePayload.workers_count"
              />
              <n-select
                v-model:value="store.generatePayload.count_mode"
                :options="countModeOptions"
                :loading="countLoading"
                :consistent-menu-width="false"
                class="w-[210px]!"
              />
            </n-input-group>
          </n-form-item>

          <n-form-item
            v-else-if="store.showGroupCountField"
            class="col-span-12"
            :label="$t(`shiftType.form.howMuchGroup`)"
            path="count"
            :rule-path="validationRules.rulesNames.requiredNumberField"
          >
            <n-input-number
              :max="50"
              :min="1"
              :step="1"
              :show-button="false"
              class="w-full"
              :allow-input="Utils.onlyAllowNumber"
              v-model:value="store.generatePayload.count"
            />
          </n-form-item>
        </div>

        <CrewInfo
          v-if="rotating"
          :size="crewSize"
          :workers="Number(store.generatePayload.workers_count) || 0"
        />
      </template>

      <div class="grid grid-cols-1 mt-6">
        <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
          {{ $t(store.visibleType ? 'shiftType.form.generate' : 'content.save') }}
        </n-button>
      </div>
    </n-form>
  </UIModal>
</template>
