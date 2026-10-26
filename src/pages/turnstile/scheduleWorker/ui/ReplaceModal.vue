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
    store._editDay(data)
  }

  // O'rinbosarlik: tanlangan ish kuni xodim dam, o'rniga boshqa xodim uning smenasida ishlaydi.
  const swapDate = computed(() => (store.replacePayload.date ? Utils.timeToZone(store.replacePayload.date) : null))
  const swapDay = computed(() => store.selectedWorker?.days?.find((d) => d.date === swapDate.value))
  const picked = computed(() => store.workerList.find((v) => v.positionId === store.replacePayload.positonId))
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
  const fmtDate = (d) => (d ? `${d.slice(8, 10)}.${d.slice(5, 7)}` : '')
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
        <div class="col-span-12 flex justify-end gap-3 pt-6">
          <n-button @click="store.replaceVisible = false" type="error" secondary>
            {{ $t('content.cancel') }}
          </n-button>
          <n-button @click="onSaveDay" :disabled="!editPlan" :loading="store.replaceLoading" type="primary">
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
                from: fmtDate(swapDate),
                to: fmtDate(transferEnd),
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
