<script setup>
  import dayjs from 'dayjs'
  import { useAccountStore, useShiftTypeStore } from '@/store/modules/index.js'
  import { UIModal } from '@/components/index.js'
  import validationRules from '@/utils/validationRules.js'
  import Utils from '@/utils/Utils.js'
  import { useAppSetting } from '@/utils/index.js'
  import { crewSizeOf, cycleDays, isRotating } from '@/pages/turnstile/scheduleWorker/ui/navbat.js'
  import { Checkmark12Filled, Flash16Regular, PersonAdd16Regular } from '@vicons/fluent'
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
    return Utils.yearList.map((y) => ({ ...y, disabled: y.id < now.year() || y.id > last }))
  })
  const PERIOD = 'period'
  const monthOptions = computed(() => [
    ...Utils.monthList.map((m) => ({
      ...m,
      disabled: isMonthDisabled(new Date(year.value, m.id - 1, 1).getTime())
    })),
    { name: t('shiftType.generate.byPeriod'), id: PERIOD }
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

  // Joylashtirish: tizim xodimlarni o'zi tasodifiy qo'yadi yoki o'rinlar bo'sh qoladi (HR o'zi biriktiradi).
  const placementOptions = computed(() => [
    {
      value: 'auto',
      icon: Flash16Regular,
      label: t('shiftType.generate.placementAuto'),
      hint: t('shiftType.generate.placementAutoHint')
    },
    {
      value: 'empty',
      icon: PersonAdd16Regular,
      label: t('shiftType.generate.placementEmpty'),
      hint: t('shiftType.generate.placementEmptyHint')
    }
  ])

  // Xodimlar soni: aniq son yoki hisoblab to'ldiriladi — shu davrda smenasi yo'qlar / barcha shtat xodimlari.
  const countLoading = ref(false)
  const countModeOptions = computed(() => [
    { label: t('shiftType.generate.byCount'), value: 'count' },
    { label: t('shiftType.generate.freeWorkersMode'), value: 'free' },
    { label: t('shiftType.generate.allWorkersMode'), value: 'all' }
  ])

  const totalOf = (params) =>
    $ApiService.shiftTypeService
      ._getWorkers({ params: { page: 1, per_page: 1, ...params } })
      .then((res) => Number(res.data.data.total) || 0)

  // Bitta saqlashda ko'pi bilan 100 xodim (backend ham tekshiradi); smenada brigada buzilmasin — brigadaga karrali.
  const BATCH_MAX = 100
  const maxWorkers = computed(() => (rotating.value ? Math.floor(BATCH_MAX / crewSize.value) * crewSize.value : BATCH_MAX))
  const totalFound = ref(null)
  watch(
    () => store.generatePayload.workers_count,
    (v) => {
      if (Number(v) > maxWorkers.value) store.generatePayload.workers_count = maxWorkers.value
    }
  )

  const loadCounts = () => {
    const mode = store.generatePayload.count_mode
    if (mode === 'count' || !store.visible) return
    const range = monthRange()
    countLoading.value = true
    totalOf(
      mode === 'free' ? { has_schedule: 'No', ...range } : { exclude_schedule_type: store.elementId, ...range }
    )
      .then((n) => {
        if (store.generatePayload.count_mode !== mode) return
        totalFound.value = n
        store.generatePayload.workers_count = Math.min(n, maxWorkers.value)
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
            <n-select
              v-model:value="year"
              :options="yearOptions"
              label-field="name"
              value-field="id"
              :disabled="store.generatePayload.period"
            />
          </n-form-item>
          <n-form-item class="col-span-7 sm:col-span-8" :label="$t('content.month')">
            <n-select v-model:value="month" :options="monthOptions" label-field="name" value-field="id" />
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
                :max="maxWorkers"
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
            <template #feedback>
              <span
                v-if="store.generatePayload.count_mode !== 'count' && totalFound > maxWorkers"
                class="text-warning"
              >
                {{ $t('shiftType.generate.batchHint', { total: totalFound, n: maxWorkers, rest: totalFound - maxWorkers }) }}
              </span>
              <span v-else class="text-secondary">{{ $t('shiftType.generate.maxHint', { n: maxWorkers }) }}</span>
            </template>
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

        <n-form-item v-if="slotted" :label="$t('shiftType.generate.placement')" :show-feedback="false" class="mb-4">
          <div class="w-full grid grid-cols-2 gap-2">
            <button
              v-for="o in placementOptions"
              :key="o.value"
              type="button"
              class="relative text-left pl-3 pr-9 py-2.5 rounded-lg border transition-colors"
              :class="
                store.generatePayload.placement === o.value
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-surface-line hover:border-primary/40'
              "
              @click="store.generatePayload.placement = o.value"
            >
              <span
                class="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                :class="
                  store.generatePayload.placement === o.value
                    ? 'bg-primary text-white'
                    : 'border-2 border-surface-line'
                "
              >
                <n-icon v-if="store.generatePayload.placement === o.value" size="12"><Checkmark12Filled /></n-icon>
              </span>
              <div class="flex items-center gap-1.5 text-sm font-medium">
                <n-icon size="16" :class="store.generatePayload.placement === o.value ? 'text-primary' : 'text-secondary'">
                  <component :is="o.icon" />
                </n-icon>
                {{ o.label }}
              </div>
              <div class="mt-0.5 text-xs text-secondary leading-[1.3]">{{ o.hint }}</div>
            </button>
          </div>
        </n-form-item>
      </template>

      <div class="grid grid-cols-1 mt-6">
        <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
          {{ $t(store.visibleType ? 'shiftType.form.generate' : 'content.save') }}
        </n-button>
      </div>
    </n-form>
  </UIModal>
</template>
