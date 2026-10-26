<script setup>
  import { useAccountStore, useScheduleGroupWorkerStore } from '@/store/modules/index.js'
  import { RubberSegment, UIFigField, UIModal, UINSelect } from '@/components/index.js'
  import WorkerCard from './WorkerCard.vue'
  import { RUBBER_THEME } from '@/components/ui/rubberSegmentTheme.js'
  import validationRules from '@/utils/validationRules.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import {
    CalendarArrowRight16Regular,
    CalendarDay16Regular,
    ArrowRight16Regular,
    Clock16Regular,
    Edit16Regular,
    Food16Regular,
    Info16Regular,
    PeopleSwap20Regular,
    WeatherMoon16Regular
  } from '@vicons/fluent'

  const store = useScheduleGroupWorkerStore()
  const accStore = useAccountStore()
  const formRef = ref(null)
  const { t } = i18n.global

  // Kunni o'zgartirish: Dam, smena turidagi smenalar yoki boshqa vaqt.
  const dayDate = computed(() => Utils.timeToZone(store.replacePayload.date))
  const currentDay = computed(() => store.selectedWorker?.days?.find((d) => d.date === dayDate.value))
  const currentLabel = computed(() => {
    const d = currentDay.value
    if (!d || d.isEmpty) return '—'
    return d.isWorkDay ? `${d.startTime}–${d.endTime}` : t('shiftType.groupView.rest')
  })
  const shiftChoices = computed(() => {
    const seen = new Set()
    const out = [{ key: 'rest', label: t('shiftType.groupView.rest'), plan: { work_status: false } }]
    for (const d of store.shiftType?.days ?? []) {
      if (!d?.work_status) continue
      const st = String(d.start_time).slice(0, 5)
      const et = String(d.end_time).slice(0, 5)
      if (seen.has(`${st}-${et}`)) continue
      seen.add(`${st}-${et}`)
      const bs = d.break_times?.start_time ? String(d.break_times.start_time).slice(0, 5) : null
      const be = d.break_times?.end_time ? String(d.break_times.end_time).slice(0, 5) : null
      const br = bs && be ? `${bs}–${be}` : null
      out.push({
        key: `${st}-${et}`,
        label: `${st}–${et}`,
        lunch: br,
        hours: d.daily_minutes ? Math.round((d.daily_minutes / 60) * 10) / 10 : null,
        // Smena tushligi ham yuboriladi — kun o'z tushligini saqlasin (backend qo'llab-quvvatlaganda).
        plan: { work_status: true, start_time: st, end_time: et, break_start_time: br ? bs : null, break_end_time: br ? be : null }
      })
    }
    out.push({ key: 'custom', label: t('shiftType.groupView.customTime'), plan: null })
    return out
  })
  // Smena turidagi shu vaqtli kunning tushligi.
  const lunchOf = (st, et) => shiftChoices.value.find((c) => c.key === `${st}-${et}`)?.lunch ?? null
  // Hozirgi tushlik: kunning o'zinikini (backend qaytarsa), bo'lmasa smena turidagini ko'rsatamiz.
  const currentLunch = computed(() => {
    const d = currentDay.value
    if (!d?.isWorkDay) return null
    if (d.breakStart && d.breakEnd) return `${d.breakStart}–${d.breakEnd}`
    return lunchOf(d.startTime, d.endTime)
  })
  const newLunch = computed(() => {
    const p = editPlan.value
    return p?.work_status && p.break_start_time && p.break_end_time ? `${p.break_start_time}–${p.break_end_time}` : null
  })
  const newLabel = computed(() => {
    const p = editPlan.value
    if (!p) return '—'
    return p.work_status ? `${p.start_time}–${p.end_time}` : t('shiftType.groupView.rest')
  })

  // Vaqtlar smena boshidan hisoblanadi (tungi smena yarim tundan o'tishi mumkin).
  const toMin = (hm) => Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3, 5))
  const fromStart = (start, hm) => (toMin(hm) - toMin(start) + 1440) % 1440
  const spanOf = (start, end) => fromStart(start, end) || 1440
  // «Boshqa vaqt» tushligi: ikkalasi bo'sh (tushliksiz) yoki ikkalasi ish vaqti ichida, boshi < oxiri.
  const customLunchError = computed(() => {
    const { start, end, breakStart: bs, breakEnd: be, hasBreak } = store.dayEdit
    if (store.dayEdit.choice !== 'custom' || !start || !end || !hasBreak) return false
    if (!bs || !be) return true
    const a = fromStart(start, bs)
    const b = fromStart(start, be)
    return !(a > 0 && a < b && b < spanOf(start, end))
  })
  const editPlan = computed(() => {
    const c = store.dayEdit.choice
    if (!c) return null
    if (c !== 'custom') return shiftChoices.value.find((x) => x.key === c)?.plan ?? null
    const { start, end, breakStart, breakEnd, hasBreak } = store.dayEdit
    if (!start || !end || customLunchError.value) return null
    // Belgi olib tashlansa — tushliksiz kun (masalan 4 soatlik ish), maydonlar `null` ketadi.
    const lunch = hasBreak && breakStart && breakEnd
    return {
      work_status: true,
      start_time: start,
      end_time: end,
      break_start_time: lunch ? breakStart : null,
      break_end_time: lunch ? breakEnd : null
    }
  })
  // Saqlangandan keyingi ish soati = ish vaqti − tushlik. Faqat ko'rsatish uchun:
  // haqiqiy `daily_minutes` ni backend hisoblaydi (tabel shundan foydalanadi).
  const newHours = computed(() => {
    const p = editPlan.value
    if (!p?.work_status) return null
    let m = spanOf(p.start_time, p.end_time)
    if (p.break_start_time && p.break_end_time) m -= fromStart(p.start_time, p.break_end_time) - fromStart(p.start_time, p.break_start_time)
    return Math.round((m / 60) * 10) / 10
  })
  const currentHours = computed(() => {
    const d = currentDay.value
    return d?.isWorkDay && d.workTime ? Math.round((d.workTime / 60) * 10) / 10 : null
  })
  // «Boshqa vaqt» tanlanganda tushlikni smena turidagi birinchi tushlik bilan to'ldiramiz (o'zgartirsa bo'ladi).
  watch(
    () => store.dayEdit.choice,
    (c) => {
      if (c !== 'custom' || store.dayEdit.breakStart || store.dayEdit.breakEnd) return
      const def = shiftChoices.value.find((x) => x.plan?.break_start_time)?.plan
      // Belgi doim olinmagan holda boshlanadi; vaqtlar oldindan to'ldiriladi — belgi qo'yilsa tayyor turadi.
      store.dayEdit.hasBreak = false
      if (!def) return
      store.dayEdit.breakStart = def.break_start_time
      store.dayEdit.breakEnd = def.break_end_time
    }
  )
  // Tanlangan holat kunning hozirgi holati bilan bir xil — saqlashdan ma'no yo'q.
  // Bir kunlik almashtirish bo'lsa saqlash uni bekor qiladi, shuning uchun u holda ruxsat.
  const isUnchanged = computed(() => {
    const d = currentDay.value
    const p = editPlan.value
    if (!d || d.isEmpty || !p || d.substitution) return false
    if (!p.work_status) return !d.isWorkDay
    return d.isWorkDay && d.startTime === p.start_time && d.endTime === p.end_time && currentLunch.value === newLunch.value
  })
  // Shu kundagi bir kunlik almashtirish: kim dam oladi, kim o'rniga chiqadi (ChangeInfoModal'dagi kabi).
  const subPair = computed(() => {
    const s = currentDay.value?.substitution
    if (!s) return null
    const me = { name: store.selectedWorker.fullName, position: store.selectedWorker.position, self: true }
    const other = { name: s.name, position: s.position, self: false }
    const time = s.start_time && s.end_time ? `${String(s.start_time).slice(0, 5)}–${String(s.end_time).slice(0, 5)}` : ''
    return s.role === 'absent' ? { absent: me, substitute: other, time } : { absent: other, substitute: me, time }
  })
  const fmtDate = (d) => (d ? `${d.slice(8, 10)}.${d.slice(5, 7)}.${d.slice(0, 4)}` : '')
  const onSaveDay = () => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsGroupsWrite)) return
    const plan = editPlan.value
    if (!plan) return
    // BACKEND (docs/api/turnstile-day-break.md): `plan` ichida endi `break_start_time` /
    // `break_end_time` ("HH:mm" yoki null — tanaffussiz) ham bor. UI'da «Tanaffus (ovqatlanish uchun)».
    // schedule-day ularni kun bilan saqlashi va `daily_minutes = (end − start) − tanaffus` deb hisoblashi kerak.
    // `null` = tanaffus yo'q («Tanaffus bor» belgisi olingan); maydon umuman kelmasa — smena turidan olinsin.
    // Dam kuni uchun bu maydonlar yuborilmaydi.
    const data = {
      worker_position_id: store.selectedWorker.workerPositionId,
      date: dayDate.value,
      group_id: store.params.group,
      ...plan
    }
    store._editDay(data)
  }

  // O'rinbosarlik: tanlangan ish kuni xodim dam, o'rniga boshqa xodim uning smenasida ishlaydi.
  const swapDate = computed(() => (store.replacePayload.date ? Utils.timeToZone(store.replacePayload.date) : null))
  const swapDay = computed(() => store.selectedWorker?.days?.find((d) => d.date === swapDate.value))
  const picked = computed(() => store.workerList.find((v) => v.positionId === store.replacePayload.positonId))
  const initials = (name) =>
    String(name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0])
      .join('')
      .toUpperCase()
  const swapTime = computed(() => (swapDay.value?.isWorkDay ? `${swapDay.value.startTime}–${swapDay.value.endTime}` : null))
  // Almashtirish turi: bir kunlik o'rinbosarlik yoki tanlangan kundan oy oxirigacha o'ringa boshqa xodim (egasi grafigi o'zgarmaydi).
  const tabTheme = { ...RUBBER_THEME, thumbColor: 'var(--fig-block-bg)', activeTextColor: 'var(--fig-text-primary)' }
  const kindItems = computed(() => [
    { value: 'day', label: t('shiftType.groupView.swapKindDay'), icon: CalendarDay16Regular },
    { value: 'full', label: t('shiftType.groupView.swapKindFull'), icon: CalendarArrowRight16Regular }
  ])
  const isFull = computed(() => store.transferMode)
  const transferEnd = computed(() => {
    const end = store.params.endDate ? String(store.params.endDate).slice(0, 10) : null
    return end && end < store.monthRange.to ? end : store.monthRange.to
  })
  const fmtShort = (d) => (d ? `${d.slice(8, 10)}.${d.slice(5, 7)}` : '')
  const setKind = (full) => {
    store.transferMode = full
    store.replacePayload.positonId = null
    if (full) store.replacePayload.date = new Date(`${store.defaultDate}T00:00:00`).getTime()
  }
  const onTransfer = () => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsGroupsWrite)) return
    if (!picked.value || !swapDate.value) return
    store._transferSlot({
      group_id: store.params.group,
      worker_position_id: store.selectedWorker.workerPositionId,
      new_worker_position_id: store.replacePayload.positonId,
      from: swapDate.value,
      owner_mode: 'keep'
    })
  }

  const onSubmit = () => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsGroupsWrite)) return
    formRef.value?.validate((error) => {
      if (error || !swapTime.value) return
      store._replaceWorker({
        worker_position_1: store.selectedWorker.workerPositionId,
        worker_position_2: store.replacePayload.positonId,
        date: swapDate.value
      })
    })
  }
  // Kun yoki rejim almashsa — nomzodlar shu kun bo'yicha qayta yuklanadi.
  watch(
    () => [store.replaceVisible, store.replaceMode, swapDate.value, store.transferMode],
    ([visible, mode], old) => {
      if (!visible || mode !== 'swap') return
      if (old && old[0] === visible && old[1] === mode && old[2] === swapDate.value && old[3] === store.transferMode) return
      store.replacePayload.positonId = null
      store._workers()
    }
  )

  // Faqat shu oydagi xodimning ish kunlari.
  const disabledDate = (ts) => {
    const d = Utils.timeToZone(ts)
    if (d < store.monthRange.from || d > store.monthRange.to) return true
    if (store.replaceMode !== 'swap') return false
    // To'liq almashtirishda — o'rin egasining shu guruhdagi istalgan kuni.
    if (store.transferMode) return d < store.monthRange.from || d > transferEnd.value
    const day = store.selectedWorker?.days?.find((x) => x.date === d)
    return !day?.isWorkDay || !!day?.substitution
  }

  const onSearch = (v) => {
    store.workerParams.search = v
    store._workers()
  }
</script>

<template>
  <UIModal
    v-model:visible="store.replaceVisible"
    :width="480"
    :title="
      store.replaceMode === 'edit'
        ? $t('shiftType.groupView.editDay')
        : isFull
          ? $t('shiftType.groupView.transferTitle')
          : $t('shiftType.groupView.subTitle')
    "
  >
    <n-form
      class="grid grid-cols-12"
      ref="formRef"
      :rules="validationRules.common"
      :model="store.replacePayload"
    >

      <template v-if="store.replaceMode === 'edit'">
        <div class="col-span-12 flex flex-col gap-4 text-sm">
          <WorkerCard :name="store.selectedWorker.fullName" :position="store.selectedWorker.position" />

          <UIFigField :label="$t('content.date')" editing>
            <n-date-picker
              v-model:value="store.replacePayload.date"
              type="date"
              class="w-full"
              format="dd.MM.yyyy"
              :is-date-disabled="disabledDate"
            />
          </UIFigField>

          <!-- Bu kunda almashtirish bor — avval nima bo'layotganini tushuntiramiz -->
          <div v-if="subPair" class="flex flex-col gap-2 rounded-xl border border-warning/40 bg-warning/5 px-3 py-2.5">
            <div class="flex items-center gap-1.5 text-xs font-medium text-warning">
              <n-icon size="14"><PeopleSwap20Regular /></n-icon>
              {{ $t('shiftType.groupView.subTitle') }}
            </div>
            <div class="text-[13px] leading-[1.4]">
              {{
                $t('shiftType.groupView.subSummary', {
                  date: fmtDate(dayDate),
                  sub: subPair.substitute.name,
                  absent: subPair.absent.name,
                  time: subPair.time
                })
              }}
            </div>
            <div
              v-for="key in ['absent', 'substitute']"
              :key="key"
              class="flex items-center gap-2 rounded-lg px-2 py-1.5"
              :class="subPair[key].self ? 'bg-primary/5' : ''"
            >
              <div
                class="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[11px] font-semibold"
                :class="key === 'absent' ? 'bg-fig-red-50 text-fig-text-red' : 'bg-success/10 text-success'"
              >
                {{ initials(subPair[key].name) }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-[13px] font-medium leading-[1.25] line-clamp-1">{{ subPair[key].name }}</div>
                <div v-if="subPair[key].position" class="text-[11px] text-secondary line-clamp-1">{{ subPair[key].position }}</div>
              </div>
              <span
                class="shrink-0 px-1.5 py-0.5 rounded text-xs font-medium"
                :class="key === 'absent' ? 'bg-fig-red-50 text-fig-text-red' : 'bg-success/10 text-success'"
              >
                {{ key === 'absent' ? $t('shiftType.groupView.subAbsentLabel') : $t('shiftType.groupView.subWorksLabel') }}
              </span>
            </div>
            <div class="flex items-start gap-1.5 text-xs text-secondary">
              <n-icon size="14" class="mt-px shrink-0"><Info16Regular /></n-icon>
              {{ $t('shiftType.groupView.dayHasSub') }}
            </div>
          </div>

          <UIFigField :label="$t('shiftType.groupView.dayNewState')" editing>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="c in shiftChoices"
              :key="c.key"
              type="button"
              class="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors"
              :class="
                store.dayEdit.choice === c.key
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-surface-line hover:border-primary/50'
              "
              @click="store.dayEdit.choice = c.key"
            >
              <n-icon size="16" class="shrink-0">
                <WeatherMoon16Regular v-if="c.key === 'rest'" />
                <Edit16Regular v-else-if="c.key === 'custom'" />
                <Clock16Regular v-else />
              </n-icon>
              <span class="min-w-0">
                <span class="block font-medium">{{ c.label }}</span>
                <span v-if="c.lunch || c.hours" class="block text-[11px] text-secondary font-normal">
                  {{ [c.hours ? $t('shiftType.groupView.hoursShort', { n: c.hours }) : null, c.lunch ? $t('shiftType.groupView.lunch', { t: c.lunch }) : null].filter(Boolean).join(' · ') }}
                </span>
              </span>
            </button>
          </div>
          </UIFigField>

          <div v-if="store.dayEdit.choice === 'custom'" class="grid grid-cols-2 gap-x-3 gap-y-1.5">
            <div class="col-span-2 flex items-center gap-1.5 text-xs text-secondary">
              <n-icon size="14"><Clock16Regular /></n-icon>
              {{ $t('shiftType.groupView.subShift') }}
            </div>
            <n-time-picker
              v-model:formatted-value="store.dayEdit.start"
              value-format="HH:mm"
              format="HH:mm"
              :placeholder="$t('shiftType.groupView.startTime')"
            />
            <n-time-picker
              v-model:formatted-value="store.dayEdit.end"
              value-format="HH:mm"
              format="HH:mm"
              :placeholder="$t('shiftType.groupView.endTime')"
            />
            <!-- Tushlik: belgi qo'yilsa vaqti kiritiladi, olinsa — tushliksiz kun -->
            <div class="col-span-2 mt-1.5 flex items-center justify-between gap-2 text-xs text-secondary">
              <span class="flex items-center gap-1.5">
                <n-icon size="14"><Food16Regular /></n-icon>
                {{ $t('shiftType.groupView.lunchLabel') }}
                <!-- Tanaffus asosan ovqatlanish uchun ekanini tushuntiramiz -->
                <n-tooltip trigger="hover" :style="{ maxWidth: '260px' }">
                  <template #trigger>
                    <n-icon size="14" class="cursor-help"><Info16Regular /></n-icon>
                  </template>
                  {{ $t('shiftType.groupView.lunchHint') }}
                </n-tooltip>
              </span>
              <n-checkbox v-model:checked="store.dayEdit.hasBreak" size="small">
                <span class="text-xs">{{ $t('shiftType.groupView.hasLunch') }}</span>
              </n-checkbox>
            </div>
            <n-time-picker
              v-model:formatted-value="store.dayEdit.breakStart"
              value-format="HH:mm"
              format="HH:mm"
              :disabled="!store.dayEdit.hasBreak"
              :status="customLunchError ? 'error' : undefined"
              :placeholder="$t('shiftType.groupView.lunchStart')"
            />
            <n-time-picker
              v-model:formatted-value="store.dayEdit.breakEnd"
              value-format="HH:mm"
              format="HH:mm"
              :disabled="!store.dayEdit.hasBreak"
              :status="customLunchError ? 'error' : undefined"
              :placeholder="$t('shiftType.groupView.lunchEnd')"
            />
            <div v-if="customLunchError" class="col-span-2 text-xs text-error">
              {{ $t('shiftType.groupView.lunchInvalid') }}
            </div>
          </div>

          <div
            v-if="isUnchanged"
            class="flex items-center justify-center gap-2 rounded-xl bg-surface-ground px-3 py-3 text-sm text-secondary"
          >
            <n-icon size="16" class="shrink-0"><Info16Regular /></n-icon>
            {{ $t('shiftType.groupView.dayUnchanged') }}
          </div>
          <div v-else class="flex items-center justify-center gap-3 rounded-xl bg-surface-ground px-3 py-2.5">
            <div class="text-center">
              <div class="text-[11px] text-secondary">{{ $t('shiftType.groupView.dayNow') }}</div>
              <div class="font-medium">{{ currentLabel }}</div>
              <div v-if="currentHours || currentLunch" class="text-[11px] text-secondary">
                {{ [currentHours ? $t('shiftType.groupView.hoursShort', { n: currentHours }) : null, currentLunch ? $t('shiftType.groupView.lunch', { t: currentLunch }) : null].filter(Boolean).join(' · ') }}
              </div>
            </div>
            <n-icon size="16" class="text-secondary"><ArrowRight16Regular /></n-icon>
            <div class="text-center">
              <div class="text-[11px] text-secondary">{{ $t('shiftType.groupView.dayAfter') }}</div>
              <div class="font-medium" :class="editPlan ? 'text-primary' : 'text-secondary'">{{ newLabel }}</div>
              <div v-if="newHours || newLunch" class="text-[11px] text-secondary">
                {{ [newHours ? $t('shiftType.groupView.hoursShort', { n: newHours }) : null, newLunch ? $t('shiftType.groupView.lunch', { t: newLunch }) : $t('shiftType.groupView.noLunch')].filter(Boolean).join(' · ') }}
              </div>
            </div>
          </div>
        </div>
        <div class="col-span-12 flex justify-end gap-3 pt-6">
          <n-button @click="store.replaceVisible = false" type="error" secondary>
            {{ $t('content.cancel') }}
          </n-button>
          <n-button @click="onSaveDay" :disabled="!editPlan || isUnchanged" :loading="store.replaceLoading" type="primary">
            {{ $t('content.save') }}
          </n-button>
        </div>
      </template>

      <template v-else>
        <div class="col-span-12 mb-4">
          <RubberSegment
            v-bind="tabTheme"
            :items="kindItems"
            :value="isFull ? 'full' : 'day'"
            size="md"
            class-name="w-full"
            @change="(v) => setKind(v === 'full')"
          />
        </div>

        <!-- To'liq almashtirish: tanlangan kundan oy oxirigacha o'ringa boshqa xodim -->
        <div v-if="isFull" class="col-span-12 flex flex-col gap-4 text-sm mb-5">
          <WorkerCard :name="store.selectedWorker.fullName" :position="store.selectedWorker.position" />

          <UIFigField :label="$t('shiftType.groupView.transferFrom')" editing>
            <n-date-picker
              v-model:value="store.replacePayload.date"
              type="date"
              class="w-full"
              format="dd.MM.yyyy"
              :clearable="false"
              :is-date-disabled="disabledDate"
            />
          </UIFigField>

          <UIFigField :label="$t('shiftType.groupView.transferNew')" editing>
            <UINSelect
              @onSearch="onSearch"
              :query="store.workerParams.search"
              :options="store.workerList.filter((v) => v.positionId !== store.selectedWorker.workerPositionId)"
              v-model:value="store.replacePayload.positonId"
              value-field="positionId"
              :placeholder="$t('shiftType.groupView.transferNew')"
              :render-label="UIHelper.selectRender.label"
              :render-tag="UIHelper.selectRender.value"
              :loading="store.workerLoading"
              :total-count="store.totalWorker"
              @onScrollEv="store._workers(true)"
            />
          </UIFigField>

          <div v-if="picked && swapDate" class="text-xs text-secondary">
            {{
              $t('shiftType.groupView.transferSummary', {
                name: picked.name,
                from: fmtShort(swapDate),
                to: fmtShort(transferEnd),
                owner: store.selectedWorker.fullName
              })
            }}
          </div>
        </div>
        <div v-if="isFull" class="col-span-12 flex justify-end gap-3 pt-2">
          <n-button @click="store.replaceVisible = false" type="error" secondary>
            {{ $t('content.cancel') }}
          </n-button>
          <n-button @click="onTransfer" :disabled="!picked || !swapDate" :loading="store.replaceLoading" type="primary">
            {{ $t('content.save') }}
          </n-button>
        </div>

        <div v-if="!isFull" class="sub-fields col-span-12 flex flex-col gap-4 text-sm mb-2">
          <!-- 1. Dam oladigan xodim (ish kuni) -->
          <WorkerCard :name="store.selectedWorker.fullName" :position="store.selectedWorker.position" tone="danger">
            <template #aside>
              <span v-if="swapTime" class="text-secondary line-through">{{ swapTime }}</span>
              <span class="px-1.5 py-0.5 rounded font-medium bg-fig-red-50 text-fig-text-red">
                {{ $t('shiftType.groupView.subAbsentLabel') }}
              </span>
            </template>
          </WorkerCard>

          <UIFigField
            :label="$t('shiftType.groupView.subDate')"
            editing
            path="date"
            :rule-path="validationRules.rulesNames.requiredNumberField"
          >
            <n-date-picker
              v-model:value="store.replacePayload.date"
              type="date"
              class="w-full"
              format="dd.MM.yyyy"
              :placeholder="$t('shiftType.groupView.subDate')"
              :is-date-disabled="disabledDate"
            />
          </UIFigField>

          <!-- 2. O'rniga chiqadigan xodim (shu kuni dam) -->
          <UIFigField
            :label="$t('shiftType.groupView.subWorker')"
            editing
            path="positonId"
            :rule-path="validationRules.rulesNames.requiredNumberField"
          >
            <UINSelect
              @onSearch="onSearch"
              :query="store.workerParams.search"
              :options="store.workerList"
              v-model:value="store.replacePayload.positonId"
              value-field="positionId"
              :placeholder="$t('shiftType.groupView.subWorker')"
              :render-label="UIHelper.selectRender.label"
              :render-tag="UIHelper.selectRender.value"
              :loading="store.workerLoading"
              :total-count="store.totalWorker"
              @onScrollEv="store._workers(true)"
            />
          </UIFigField>
          <WorkerCard v-if="picked" :name="picked.name" :position="picked.position" tone="success" highlight>
            <template #aside>
              <span class="px-1.5 py-0.5 rounded font-medium bg-success/10 text-success">{{ swapTime }}</span>
            </template>
          </WorkerCard>

          <n-alert v-if="!swapTime" type="warning" :show-icon="false">
            {{ $t('shiftType.groupView.subNotWorkDay') }}
          </n-alert>
        </div>
        <div v-if="!isFull" class="col-span-12 flex justify-end gap-3 pt-2">
          <n-button @click="store.replaceVisible = false" type="error" secondary>
            {{ $t('content.cancel') }}
          </n-button>
          <n-button @click="onSubmit" :disabled="!swapTime" :loading="store.replaceLoading" type="primary">
            {{ $t('content.save') }}
          </n-button>
        </div>
      </template>
    </n-form>
  </UIModal>
</template>

<style scoped>
  /* Validatsiya xabari bo'lmasa — maydonlar orasi boshqa modallardagidek. */
  .sub-fields :deep(.n-form-item-feedback-wrapper:empty) {
    min-height: 0;
  }
</style>
