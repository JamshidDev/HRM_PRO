<script setup>
  import dayjs from 'dayjs'
  import { useAccountStore, useShiftTypeStore } from '@/store/modules/index.js'
  import { UIModal } from '@/components/index.js'
  import validationRules from '@/utils/validationRules.js'
  import Utils from '@/utils/Utils.js'
  import { useAppSetting } from '@/utils/index.js'
  import { crewSizeOf, cycleDays, isRotating } from '@/pages/turnstile/scheduleWorker/ui/navbat.js'

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


  // Grafik chegarasi — tanlangan oyning birinchi va oxirgi kuni.
  const monthRange = () => {
    const m = dayjs(store.generatePayload.month ?? Date.now())
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
  const monthOptions = computed(() =>
    Utils.monthList.map((m) => ({
      ...m,
      disabled: isMonthDisabled(new Date(year.value, m.id - 1, 1).getTime())
    }))
  )
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
    get: () => dayjs(store.generatePayload.month ?? Date.now()).month() + 1,
    set: (m) => setMonth(year.value, m)
  })

  // Bitta saqlashda ko'pi bilan 100 xodim (backend ham tekshiradi); smenada brigada buzilmasin — brigadaga karrali.
  const BATCH_MAX = 100
  const maxWorkers = computed(() => (rotating.value ? Math.floor(BATCH_MAX / crewSize.value) * crewSize.value : BATCH_MAX))
  watch(
    () => store.generatePayload.workers_count,
    (v) => {
      if (Number(v) > maxWorkers.value) store.generatePayload.workers_count = maxWorkers.value
    }
  )

  // Guruhni yakunlash: tugash sanasi guruh boshlanishidan oldin bo'lmasin
  // (o'tgan kunlar ruxsat — guruhni orqa sana bilan yopish mumkin).
  const groupStart = computed(() => store.generatePayload.start_date)
  const isEndDateDisabled = (ts) => !!groupStart.value && dayjs(ts).isBefore(dayjs(groupStart.value), 'day')
  const groupStartLabel = computed(() => (groupStart.value ? dayjs(groupStart.value).format('DD.MM.YYYY') : '—'))

  const onSubmit = () => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsWorkersWrite)) return
    formRef.value?.validate((error) => {
      if (error) return
      if (!store.visibleType) {
        store._editGroup({ end_date: Utils.timeToZone(store.generatePayload.end_date) })
        return
      }
      const range = monthRange()
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
        <!-- Qaysi guruh yakunlanayotgani -->
        <div class="mb-4 p-3 rounded-xl border border-surface-line bg-surface-ground/40">
          <div class="font-semibold line-clamp-1" :title="store.generatePayload.name">
            {{ store.generatePayload.name }}
          </div>
          <div class="mt-1 text-xs text-secondary">{{ $t('content.startDate') }}: {{ groupStartLabel }}</div>
        </div>
        <n-form-item
          :label="$t('shiftType.form.groupEndDate')"
          path="end_date"
          :rule-path="validationRules.rulesNames.requiredNumberField"
        >
          <n-date-picker
            :format="useAppSetting.datePicketFormat"
            v-model:value="store.generatePayload.end_date"
            type="date"
            class="w-full"
            :is-date-disabled="isEndDateDisabled"
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
            />
          </n-form-item>
          <n-form-item class="col-span-7 sm:col-span-8" :label="$t('content.month')">
            <n-select v-model:value="month" :options="monthOptions" label-field="name" value-field="id" />
          </n-form-item>

          <n-form-item
            v-if="slotted"
            class="col-span-12"
            :label="$t('shiftType.generate.workersCount')"
            path="workers_count"
            :rule-path="validationRules.rulesNames.requiredNumberField"
          >
            <n-input-number
              :min="1"
              :max="maxWorkers"
              :step="1"
              class="w-full"
              :show-button="false"
              :allow-input="Utils.onlyAllowNumber"
              v-model:value="store.generatePayload.workers_count"
            />
            <template #feedback>
              <span class="text-secondary">{{ $t('shiftType.generate.maxHint', { n: maxWorkers }) }}</span>
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
      </template>

      <div class="grid grid-cols-1 mt-6">
        <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
          {{ $t(store.visibleType ? 'shiftType.form.generate' : 'content.save') }}
        </n-button>
      </div>
    </n-form>
  </UIModal>
</template>
