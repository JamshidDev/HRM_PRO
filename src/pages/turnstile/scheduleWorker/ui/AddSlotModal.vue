<script setup>
  import { useAccountStore, useScheduleGroupWorkerStore } from '@/store/modules/index.js'
  import { UIModal, UINSelect } from '@/components/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { cycleOf } from './navbat.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  // Bo'sh navbatga xodim: tanlangan sanadan smena oxirigacha shu navbat naqshi yoziladi.
  const store = useScheduleGroupWorkerStore()
  const accStore = useAccountStore()

  const workers = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const search = ref(null)
  const positionId = ref(null)
  const date = ref(null)
  // Navbat noma'lum bo'lsa — foydalanuvchi naqshning qaysi kunidan boshlanishini tanlaydi.
  const startIndex = ref(null)
  const phaseKnown = computed(() => !!store.addSlot.phase)
  const patternOptions = computed(() => {
    const days = store.shiftType?.days ?? []
    const rest = t('shiftType.groupView.rest')
    const opts = days.map((d, i) => ({
      value: i + 1,
      label: `${i + 1}-kun · ${d.work_status ? `${d.start_time ?? ''}–${d.end_time ?? ''}` : rest}`
    }))
    // «1 haftalik»: ish kunlaridan keyin shuncha dam kunlari.
    if (store.shiftType?.type?.id === 4) {
      days.forEach((_, i) => opts.push({ value: days.length + i + 1, label: `${days.length + i + 1}-kun · ${rest}` }))
    }
    return opts
  })

  const monthDays = computed(() => store.list[0]?.days ?? [])
  const firstDay = computed(() => monthDays.value[0]?.date ?? null)
  const lastDay = computed(() => monthDays.value[monthDays.value.length - 1]?.date ?? null)
  // Tanlash mumkin bo'lgan eng erta sana: oy boshi yoki smena boshlanishi (qaysi keyin bo'lsa).
  const minDay = computed(() => {
    const start = store.params.startDate ? String(store.params.startDate).slice(0, 10) : null
    return start && firstDay.value && start > firstDay.value ? start : firstDay.value
  })
  const endDate = computed(() => {
    const end = store.params.endDate ? String(store.params.endDate).slice(0, 10) : null
    return end && end >= (Utils.timeToZone(date.value) || '') ? end : lastDay.value
  })

  const load = () => {
    const start = Utils.timeToZone(date.value)
    if (!start || !endDate.value) return
    loading.value = true
    $ApiService.shiftTypeService
      ._getWorkers({
        params: {
          page: 1,
          per_page: 100,
          search: search.value || undefined,
          has_schedule: 'No',
          start_date: start,
          end_date: endDate.value
        }
      })
      .then((res) => {
        workers.value = res.data.data.data.map((v) => ({
          name: Utils.combineFullName(v.worker),
          positionId: v.id,
          position: v.position
        }))
      })
      .finally(() => {
        loading.value = false
      })
  }

  watch(
    () => store.addSlot.visible,
    (v) => {
      if (!v) return
      positionId.value = null
      startIndex.value = null
      search.value = null
      const today = Utils.timeToZone(Date.now())
      const start = minDay.value && today >= minDay.value && today <= lastDay.value ? today : minDay.value
      date.value = start ? new Date(`${start}T00:00:00`).getTime() : null
      load()
    }
  )

  const onSearch = (v) => {
    search.value = v
    load()
  }

  // Navbat raqami oyning birinchi kuniga nisbatan; backend birinchi kunda (day+1)%n naqshini oladi.
  const dayOffset = () => {
    const { pattern, crewSize } = cycleOf(store.shiftType)
    const n = pattern.length
    const step = n / crewSize
    let index
    if (phaseKnown.value) {
      const phase0 = (store.addSlot.fam ?? 0) + (store.addSlot.phase - 1) * step
      const start = Utils.timeToZone(date.value)
      const diff = Math.round((new Date(`${start}T00:00:00`) - new Date(`${firstDay.value}T00:00:00`)) / 86400000)
      index = (((phase0 + diff) % n) + n) % n
    } else {
      index = (startIndex.value - 1) % n
    }
    return (index - 1 + n) % n
  }

  const onSave = () => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsGroupsWrite)) return
    if (!positionId.value || !date.value || (!phaseKnown.value && !startIndex.value)) return
    saving.value = true
    $ApiService.shiftTypeService
      ._generateWorkerSchedule({
        data: {
          schedule_type: store.shiftType.id,
          group_id: store.params.group,
          start_date: Utils.timeToZone(date.value),
          end_date: endDate.value,
          schedule_workers: [{ worker_position_id: positionId.value, day: dayOffset() }]
        }
      })
      .then(() => {
        store.addSlot.visible = false
        store._index()
      })
      .finally(() => {
        saving.value = false
      })
  }

  const disabledDate = (ts) => {
    const d = Utils.timeToZone(ts)
    return !minDay.value || d < minDay.value || d > lastDay.value
  }
</script>

<template>
  <UIModal
    v-model:visible="store.addSlot.visible"
    :width="500"
    :title="phaseKnown ? $t('shiftType.groupView.addWorkerTitle', { n: store.addSlot.phase }) : $t('shiftType.groupView.addWorker')"
  >
    <div class="grid grid-cols-12 gap-y-4">
      <div class="col-span-12">
        <div class="text-xs text-secondary mb-1">{{ $t('content.worker') }}</div>
        <UINSelect
          @onSearch="onSearch"
          :query="search"
          :options="workers"
          v-model:value="positionId"
          value-field="positionId"
          :render-label="UIHelper.selectRender.label"
          :render-tag="UIHelper.selectRender.value"
          :loading="loading"
        />
      </div>
      <div class="col-span-12">
        <div class="text-xs text-secondary mb-1">{{ $t('shiftType.form.fromThisDate') }}</div>
        <n-date-picker
          v-model:value="date"
          type="date"
          class="w-full"
          :is-date-disabled="disabledDate"
          @update:value="load"
        />
      </div>
      <div v-if="!phaseKnown" class="col-span-12">
        <div class="text-xs text-secondary mb-1">{{ $t('shiftType.groupView.patternStart') }}</div>
        <n-select v-model:value="startIndex" :options="patternOptions" />
      </div>
      <div class="col-span-12 flex justify-end gap-4">
        <n-button @click="store.addSlot.visible = false" type="error" secondary>
          {{ $t('content.cancel') }}
        </n-button>
        <n-button @click="onSave" :loading="saving" :disabled="!positionId || !date || (!phaseKnown && !startIndex)" type="primary">
          {{ $t('content.save') }}
        </n-button>
      </div>
    </div>
  </UIModal>
</template>
