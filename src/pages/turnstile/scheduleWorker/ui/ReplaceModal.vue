<script setup>
  import { useAccountStore, useScheduleGroupWorkerStore } from '@/store/modules/index.js'
  import { UIModal, UINSelect } from '@/components/index.js'
  import validationRules from '@/utils/validationRules.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import { findNewGaps } from './conflicts.js'
  import { showAlert } from '@/components/notify/alertDialog.js'
  import {
    ArrowDown16Regular,
    ArrowRight16Regular,
    Clock16Regular,
    Edit16Regular,
    Info16Regular,
    WeatherMoon16Regular
  } from '@vicons/fluent'

  const store = useScheduleGroupWorkerStore()
  const accStore = useAccountStore()
  const formRef = ref(null)
  const { t } = i18n.global

  // Smena turidagi ish smenalari (bo'shliq tekshiruvi uchun).
  const typeShifts = computed(() => {
    const seen = new Map()
    for (const d of store.shiftType?.days ?? []) {
      if (!d?.work_status) continue
      const st = String(d.start_time).slice(0, 5)
      const et = String(d.end_time).slice(0, 5)
      seen.set(`${st}-${et}`, { start: st, end: et })
    }
    return [...seen.values()]
  })
  const daysMap = (list) => Object.fromEntries(list.map((v) => [v.worker_position_id, v.days]))
  // Smenada hech kim qolmasa ogohlantirish, tasdiqlansa saqlanadi (vaqt kesishmasi tekshirilmaydi).
  const confirmIfGaps = (save, gaps) => {
    if (!gaps.length) return save()
    showAlert({
      type: 'warning',
      title: t('shiftType.groupView.conflictTitle'),
      message: t('shiftType.groupView.gapHint'),
      listHint: '',
      errors: [
        ...new Set(gaps.map((g) => t('shiftType.groupView.gapLine', { group: g.title, shift: g.shift })))
      ],
      confirmText: t('shiftType.groupView.conflictSave'),
      onConfirm: save
    })
  }

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
      const br = d.break_times?.start_time && d.break_times?.end_time
        ? `${String(d.break_times.start_time).slice(0, 5)}–${String(d.break_times.end_time).slice(0, 5)}`
        : null
      out.push({
        key: `${st}-${et}`,
        label: `${st}–${et}`,
        lunch: br,
        hours: d.daily_minutes ? Math.round((d.daily_minutes / 60) * 10) / 10 : null,
        plan: { work_status: true, start_time: st, end_time: et }
      })
    }
    out.push({ key: 'custom', label: t('shiftType.groupView.customTime'), plan: null })
    return out
  })
  // Smena turidagi shu vaqtli kunning tushligi.
  const lunchOf = (st, et) => shiftChoices.value.find((c) => c.key === `${st}-${et}`)?.lunch ?? null
  const currentLunch = computed(() => {
    const d = currentDay.value
    return d?.isWorkDay ? lunchOf(d.startTime, d.endTime) : null
  })
  const newLunch = computed(() => {
    const p = editPlan.value
    return p?.work_status ? lunchOf(p.start_time, p.end_time) : null
  })
  const newLabel = computed(() => {
    const p = editPlan.value
    if (!p) return '—'
    return p.work_status ? `${p.start_time}–${p.end_time}` : t('shiftType.groupView.rest')
  })
  const editPlan = computed(() => {
    const c = store.dayEdit.choice
    if (!c) return null
    if (c !== 'custom') return shiftChoices.value.find((x) => x.key === c)?.plan ?? null
    if (!store.dayEdit.start || !store.dayEdit.end) return null
    return { work_status: true, start_time: store.dayEdit.start, end_time: store.dayEdit.end }
  })
  const onSaveDay = () => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsGroupsWrite)) return
    const plan = editPlan.value
    if (!plan) return
    const data = {
      worker_position_id: store.selectedWorker.workerPositionId,
      date: dayDate.value,
      group_id: store.params.group,
      ...plan
    }
    const before = daysMap(store.list)
    const after = {
      ...before,
      [data.worker_position_id]: (before[data.worker_position_id] ?? []).map((d) =>
        d.date === data.date ? { ...d, id: d.id ?? -1, work_status: plan.work_status ? 1 : 0, start_time: plan.start_time, end_time: plan.end_time } : d
      )
    }
    const gaps = findNewGaps({
      before,
      after,
      crewMap: store.crewMap,
      wps: [data.worker_position_id],
      dates: [data.date],
      shifts: typeShifts.value
    })
    confirmIfGaps(() => store._editDay(data), gaps)
  }

  // O'rinbosarlik: tanlangan ish kuni xodim dam, o'rniga shu kuni dam bo'lgan xodim chiqadi — grafiklar o'zgarmaydi.
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
    () => [store.replaceVisible, store.replaceMode, swapDate.value],
    ([visible, mode], old) => {
      if (!visible || mode !== 'swap' || (old && old[0] === visible && old[1] === mode && old[2] === swapDate.value)) return
      store.replacePayload.positonId = null
      store._workers()
    }
  )

  // Faqat shu oydagi xodimning ish kunlari.
  const disabledDate = (ts) => {
    const d = Utils.timeToZone(ts)
    if (d < store.monthRange.from || d > store.monthRange.to) return true
    if (store.replaceMode !== 'swap') return false
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
    :width="500"
    :title="store.replaceMode === 'edit' ? $t('shiftType.groupView.editDay') : $t('shiftType.groupView.subTitle')"
  >
    <n-form
      class="grid grid-cols-12"
      ref="formRef"
      :rules="validationRules.common"
      :model="store.replacePayload"
    >

      <template v-if="store.replaceMode === 'edit'">
        <div class="col-span-12 flex flex-col gap-3 text-sm">
          <div class="flex items-center gap-3 rounded-xl border border-surface-line px-3 py-2.5">
            <div class="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold bg-primary/10 text-primary">
              {{ initials(store.selectedWorker.fullName) }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="font-medium leading-[1.25] line-clamp-2">{{ store.selectedWorker.fullName }}</div>
              <div class="text-xs text-secondary line-clamp-1">{{ store.selectedWorker.position }}</div>
            </div>
          </div>

          <n-date-picker
            v-model:value="store.replacePayload.date"
            type="date"
            class="w-full"
            format="dd.MM.yyyy"
            :is-date-disabled="disabledDate"
          />

          <div class="text-xs text-secondary">{{ $t('shiftType.groupView.dayNewState') }}</div>
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

          <div v-if="store.dayEdit.choice === 'custom'" class="grid grid-cols-2 gap-3">
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
          </div>

          <div class="flex items-center justify-center gap-3 rounded-xl bg-surface-ground px-3 py-2.5">
            <div class="text-center">
              <div class="text-[11px] text-secondary">{{ $t('shiftType.groupView.dayNow') }}</div>
              <div class="font-medium">{{ currentLabel }}</div>
              <div v-if="currentLunch" class="text-[11px] text-secondary">{{ $t('shiftType.groupView.lunch', { t: currentLunch }) }}</div>
            </div>
            <n-icon size="16" class="text-secondary"><ArrowRight16Regular /></n-icon>
            <div class="text-center">
              <div class="text-[11px] text-secondary">{{ $t('shiftType.groupView.dayAfter') }}</div>
              <div class="font-medium" :class="editPlan ? 'text-primary' : 'text-secondary'">{{ newLabel }}</div>
              <div v-if="newLunch" class="text-[11px] text-secondary">{{ $t('shiftType.groupView.lunch', { t: newLunch }) }}</div>
            </div>
          </div>

          <n-alert v-if="currentDay?.substitution" type="warning" :show-icon="false">
            {{ $t('shiftType.groupView.dayHasSub') }}
          </n-alert>
        </div>
        <div class="col-span-12 flex justify-end gap-4 mt-5">
          <n-button @click="store.replaceVisible = false" type="error" secondary>
            {{ $t('content.cancel') }}
          </n-button>
          <n-button @click="onSaveDay" :disabled="!editPlan" :loading="store.replaceLoading" type="primary">
            {{ $t('content.save') }}
          </n-button>
        </div>
      </template>

      <template v-else>
        <div class="col-span-12 flex flex-col gap-2 text-sm mb-5">
          <!-- 1. Dam oladigan xodim (ish kuni) -->
          <div class="flex items-center gap-3 rounded-xl border border-surface-line px-3 py-2.5">
            <div class="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold bg-fig-red-50 text-fig-text-red">
              {{ initials(store.selectedWorker.fullName) }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="font-medium leading-[1.25] line-clamp-2">{{ store.selectedWorker.fullName }}</div>
              <div class="text-xs text-secondary line-clamp-1">{{ store.selectedWorker.position }}</div>
            </div>
            <div class="shrink-0 flex flex-col items-end gap-1 text-xs">
              <span v-if="swapTime" class="text-secondary line-through">{{ swapTime }}</span>
              <span class="px-1.5 py-0.5 rounded font-medium bg-fig-red-50 text-fig-text-red">
                {{ $t('shiftType.groupView.subAbsentLabel') }}
              </span>
            </div>
          </div>

          <n-form-item
            :show-label="false"
            path="date"
            :rule-path="validationRules.rulesNames.requiredNumberField"
            class="-mb-4"
          >
            <n-date-picker
              v-model:value="store.replacePayload.date"
              type="date"
              class="w-full"
              format="dd.MM.yyyy"
              :placeholder="$t('shiftType.groupView.subDate')"
              :is-date-disabled="disabledDate"
            />
          </n-form-item>

          <div class="flex items-center gap-2 pl-3 text-xs text-warning font-medium">
            <span class="w-7 h-7 rounded-full bg-warning/10 flex items-center justify-center">
              <n-icon size="14"><ArrowDown16Regular /></n-icon>
            </span>
            {{ $t('shiftType.groupView.subArrow') }}
          </div>

          <!-- 2. O'rniga chiqadigan xodim (shu kuni dam) -->
          <n-form-item
            :show-label="false"
            path="positonId"
            :rule-path="validationRules.rulesNames.requiredNumberField"
            class="-mb-4"
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
          </n-form-item>
          <div
            v-if="picked"
            class="flex items-center gap-3 rounded-xl border border-success/40 bg-success/5 px-3 py-2.5"
          >
            <div class="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold bg-success/10 text-success">
              {{ initials(picked.name) }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="font-medium leading-[1.25] line-clamp-2">{{ picked.name }}</div>
              <div class="text-xs text-secondary line-clamp-1">{{ picked.position }}</div>
            </div>
            <div class="shrink-0 flex flex-col items-end gap-1 text-xs">
              <span class="text-secondary line-through">{{ $t('shiftType.groupView.rest') }}</span>
              <span class="px-1.5 py-0.5 rounded font-medium bg-success/10 text-success">{{ swapTime }}</span>
            </div>
          </div>
          <div
            v-else
            class="rounded-xl border border-dashed border-surface-line px-3 py-3 text-xs text-secondary text-center"
          >
            {{ $t('shiftType.groupView.subPickHint') }}
          </div>

          <div v-if="swapTime" class="flex items-start gap-1.5 text-xs text-secondary mt-1">
            <n-icon size="14" class="mt-px shrink-0"><Info16Regular /></n-icon>
            {{ $t('shiftType.groupView.subKeepsPlan') }}
          </div>
          <n-alert v-else type="warning" class="mt-1">
            {{ $t('shiftType.groupView.subNotWorkDay') }}
          </n-alert>
        </div>
        <div class="col-span-12 flex justify-end gap-4">
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
