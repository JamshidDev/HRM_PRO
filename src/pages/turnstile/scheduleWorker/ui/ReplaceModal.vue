<script setup>
  import { useAccountStore, useScheduleGroupWorkerStore } from '@/store/modules/index.js'
  import { UIModal, UINSelect } from '@/components/index.js'
  import validationRules from '@/utils/validationRules.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import { findDayConflicts, findNewGaps, findSwapConflicts } from './conflicts.js'
  import { showAlert } from '@/components/notify/alertDialog.js'

  const store = useScheduleGroupWorkerStore()
  const accStore = useAccountStore()
  const formRef = ref(null)
  const { t } = i18n.global

  const conflictLines = (conflicts) => [
    ...new Set(
      conflicts.map(
        (c) =>
          `${c.title}: ${c.first.name} (${c.first.start}–${c.first.end}) ⟷ ${c.second.name} (${c.second.start}–${c.second.end})`
      )
    )
  ]
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
  // Kesishma yoki yangi bo'shliq bo'lsa ovozli ogohlantirish, tasdiqlansa saqlanadi.
  const confirmIfConflicts = (conflicts, save, gaps = []) => {
    if (!conflicts.length && !gaps.length) return save()
    showAlert({
      type: 'warning',
      title: t('shiftType.groupView.conflictTitle'),
      message: conflicts.length ? t('shiftType.groupView.conflictHint') : t('shiftType.groupView.gapHint'),
      listHint: '',
      errors: [
        ...new Set([
          ...conflictLines(conflicts),
          ...gaps.map((g) => t('shiftType.groupView.gapLine', { group: g.title, shift: g.shift }))
        ])
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
      out.push({ key: `${st}-${et}`, label: `${st}–${et}`, plan: { work_status: true, start_time: st, end_time: et } })
    }
    out.push({ key: 'custom', label: t('shiftType.groupView.customTime'), plan: null })
    return out
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
    const conflicts = findDayConflicts({
      list: store.list,
      crewMap: store.crewMap,
      wp: data.worker_position_id,
      date: data.date,
      plan
    })
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
    confirmIfConflicts(conflicts, () => store._editDay(data), gaps)
  }

  const partnerGroupAt = (w, date) =>
    w.ranges?.find((r) => r.date_from <= date && date <= r.date_to)?.group_id || undefined

  const onSubmit = () => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsGroupsWrite)) return
    formRef.value?.validate((error) => {
      if (!error) {
        const newWorker = store.workerList.find(
          (v) => v.positionId === store.replacePayload.positonId
        )
        const data = {
          group_1: store.params.group,
          worker_1: store.selectedWorker.workerId,
          worker_position_1: store.selectedWorker.workerPositionId,

          worker_2: newWorker.id,
          worker_position_2: newWorker.positionId,
          // Sherikning o'sha sanadagi grafigi (eski/o'chirilgan bog'lanish emas).
          group_2: partnerGroupAt(newWorker, Utils.timeToZone(store.replacePayload.date)),
          status: store.replacePayload.status,
          date: Utils.timeToZone(store.replacePayload.date)
        }
        // Guruhda soat kesishsa — ogohlantirish; foydalanuvchi tasdiqlasa saqlanadi.
        const conflicts = findSwapConflicts({
          list: store.list,
          crewMap: store.crewMap,
          a: data.worker_position_1,
          b: data.worker_position_2,
          from: data.date,
          to: data.status ? data.date : store.monthRange.to
        })
        // Almashishdan keyingi holat — yangi bo'shliqlar uchun.
        const to = data.status ? data.date : store.monthRange.to
        const before = daysMap(store.list)
        const swapDays = (own, other) =>
          (own ?? []).map((d) =>
            d.date >= data.date && d.date <= to
              ? ((other ?? []).find((x) => x.date === d.date) ?? { ...d, id: null, work_status: false })
              : d
          )
        const after = {
          ...before,
          [data.worker_position_1]: swapDays(before[data.worker_position_1], before[data.worker_position_2])
        }
        if (before[data.worker_position_2]) {
          after[data.worker_position_2] = swapDays(before[data.worker_position_2], before[data.worker_position_1])
        }
        const dates = (before[data.worker_position_1] ?? []).map((d) => d.date).filter((d) => d >= data.date && d <= to)
        const gaps = findNewGaps({
          before,
          after,
          crewMap: store.crewMap,
          wps: [data.worker_position_1, data.worker_position_2],
          dates,
          shifts: typeShifts.value
        })
        confirmIfConflicts(conflicts, () => store._replaceWorker(data), gaps)
      }
    })
  }

  // Bir kunlik almashishda xodimning o'sha kuni dam bo'lsa — ogohlantirish.
  // Faqat ma'nosiz holatda: sherik grafiksiz yoki uning ham shu kuni dami.
  const isRestDay = computed(() => {
    if (store.replacePayload.status !== true || !store.replacePayload.positonId) return false
    const date = Utils.timeToZone(store.replacePayload.date)
    const day = store.selectedWorker?.days?.find((d) => d.date === date)
    if (!day || day.isEmpty || day.isWorkDay || day.sub) return false
    const partner = store.workerList.find((v) => v.positionId === store.replacePayload.positonId)
    if (!partner?.ranges?.length) return true
    const row = store.list.find((v) => v.worker_position_id === partner.positionId)
    const pd = row?.days?.find((d) => d.date === date)
    return !!pd && pd.id !== null && !Number(pd.work_status)
  })

  // Sana faqat tanlangan oy ichida.
  const disabledDate = (ts) => {
    const d = Utils.timeToZone(ts)
    return d < store.monthRange.from || d > store.monthRange.to
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
    :title="store.replaceMode === 'edit' ? $t('shiftType.groupView.editDay') : $t('shiftType.form.replaceWorker')"
  >
    <n-form
      class="grid grid-cols-12"
      ref="formRef"
      :rules="validationRules.common"
      :model="store.replacePayload"
    >
      <div
        class="col-span-12 border border-surface-line px-4 py-2 mb-6 rounded-xl bg-surface-ground/40"
      >
        <div class="line-clamp-1 leading-[1.2] font-semibold">
          {{ store.selectedWorker.fullName }}
        </div>
        <div class="line-clamp-1 leading-[1.2] text-secondary">
          {{ store.selectedWorker.position }}
        </div>
      </div>
      <div v-if="store.replaceModeSwitch" class="col-span-12 mb-5">
        <n-radio-group v-model:value="store.replaceMode" class="w-full flex!">
          <n-radio-button value="edit" class="flex-1 text-center">{{ $t('shiftType.groupView.editDay') }}</n-radio-button>
          <n-radio-button value="swap" class="flex-1 text-center">{{ $t('shiftType.groupView.swapMode') }}</n-radio-button>
        </n-radio-group>
      </div>

      <template v-if="store.replaceMode === 'edit'">
        <div class="col-span-12 flex justify-between text-sm mb-3">
          <span class="text-secondary">{{ Utils.timeOnlyDate(dayDate) }}</span>
          <span>
            <span class="text-secondary">{{ $t('shiftType.groupView.actual') }}:</span>
            <span class="font-medium ml-1">{{ currentLabel }}</span>
          </span>
        </div>
        <div class="col-span-12 flex flex-wrap gap-2 mb-4">
          <n-button
            v-for="c in shiftChoices"
            :key="c.key"
            :type="store.dayEdit.choice === c.key ? 'primary' : 'default'"
            :secondary="store.dayEdit.choice !== c.key"
            @click="store.dayEdit.choice = c.key"
          >
            {{ c.label }}
          </n-button>
        </div>
        <div v-if="store.dayEdit.choice === 'custom'" class="col-span-12 grid grid-cols-2 gap-3 mb-4">
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
        <div class="col-span-12 flex justify-end gap-4">
          <n-button @click="store.replaceVisible = false" type="error" secondary>
            {{ $t('content.cancel') }}
          </n-button>
          <n-button @click="onSaveDay" :disabled="!editPlan" :loading="store.replaceLoading" type="primary">
            {{ $t('content.save') }}
          </n-button>
        </div>
      </template>

      <template v-else>
      <n-form-item
        class="col-span-12"
        :label="$t('shiftType.groupView.swapWith')"
        path="positonId"
        :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <UINSelect
          @onSearch="onSearch"
          :query="store.workerParams.search"
          :options="store.workerList"
          v-model:value="store.replacePayload.positonId"
          value-field="positionId"
          :render-label="UIHelper.selectRender.label"
          :render-tag="UIHelper.selectRender.value"
          :loading="store.workerLoading"
          :total-count="store.totalWorker"
          @onScrollEv="store._workers(true)"
        />
      </n-form-item>
      <n-form-item
        class="col-span-12"
        :label="$t('shiftType.groupView.swapFrom')"
        path="date"
        :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-date-picker
          clearable
          v-model:value="store.replacePayload.date"
          type="date"
          class="w-full"
          :is-date-disabled="disabledDate"
        />
      </n-form-item>
      <n-radio-group
        v-model:value="store.replacePayload.status"
        class="col-span-12 grid! grid-cols-2 gap-2 mb-6"
      >
        <n-radio :value="true" class="border px-2 py-1 border-surface-line rounded-lg">
          {{ $t('shiftType.groupView.swapOneDay') }}
        </n-radio>
        <n-radio :value="false" class="border px-2 py-1 border-surface-line rounded-lg">
          {{ $t('shiftType.groupView.swapToMonthEnd') }}
        </n-radio>
      </n-radio-group>
      <n-alert v-if="isRestDay" type="warning" class="col-span-12 mb-4">
        {{ $t('shiftType.groupView.restDayWarn') }}
      </n-alert>
      <div class="col-span-12 flex justify-end gap-4">
        <n-button @click="store.replaceVisible = false" type="error" secondary>
          {{ $t('content.cancel') }}
        </n-button>
        <n-button @click="onSubmit" :loading="store.replaceLoading" type="primary">
          {{ $t('content.save') }}
        </n-button>
      </div>
      </template>
    </n-form>
  </UIModal>
</template>
