<script setup>
  import { useAccountStore, useScheduleGroupWorkerStore } from '@/store/modules/index.js'
  import { UIFigField, UIModal, UINSelect } from '@/components/index.js'
  import QuickDates from './QuickDates.vue'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { cycleOf, toAnchored } from './navbat.js'
  import { scheduleLabel } from '@/store/modules/turnstile/scheduleGroupWorkerStore.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  // Bo'sh navbatga xodim: tanlangan sanadan smena oxirigacha shu navbat naqshi yoziladi.
  const store = useScheduleGroupWorkerStore()
  const accStore = useAccountStore()

  const workers = ref([])
  const page = ref(1)
  const total = ref(0)
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
  // Faqat shu oy: grafik oxiri va oy oxiridan qaysi oldin bo'lsa.
  const endDate = computed(() => {
    const end = store.params.endDate ? String(store.params.endDate).slice(0, 10) : null
    const monthEnd = store.monthRange.to || lastDay.value
    return end && end < monthEnd ? end : monthEnd
  })

  // append=true — skrolda keyingi sahifa.
  const load = (append = false) => {
    const start = Utils.timeToZone(date.value)
    if (!start || !endDate.value) return
    page.value = append === true ? page.value + 1 : 1
    loading.value = true
    $ApiService.shiftTypeService
      ._getWorkers({
        params: {
          page: page.value,
          per_page: 50,
          search: search.value || undefined,
          start_date: store.monthRange.from,
          end_date: store.monthRange.to,
          // Faqat guruh korxonasi xodimlari — grafik xodim korxonasiga bog'lanadi.
          priority_group: store.params.group
        }
      })
      .then((res) => {
        total.value = res.data.data.total
        const list = res.data.data.data.map((v) => ({
          name: Utils.combineFullName(v.worker),
          positionId: v.id,
          position: [v.position, scheduleLabel(v.rangeSchedules)].filter(Boolean).join(' · '),
          ranges: v.rangeSchedules ?? []
        }))
        workers.value = append === true ? [...workers.value, ...list] : list
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
      // Bo'shagan o'ringa — egasi ketgan kundan; aks holda bugun (davr ichida bo'lsa) yoki davr boshi.
      setDate(store.addSlot.from || (todayAllowed.value ? today : minDay.value))
      store.addSlot.from = null
      load()
    }
  )

  const today = Utils.timeToZone(Date.now())
  const todayAllowed = computed(() => !!minDay.value && today >= minDay.value && today <= endDate.value)
  const setDate = (d) => (date.value = d ? new Date(`${d}T00:00:00`).getTime() : null)
  const startStr = computed(() => (date.value ? Utils.timeToZone(date.value) : null))
  const disabledDate = (ts) => {
    const d = Utils.timeToZone(ts)
    return !minDay.value || d < minDay.value || d > endDate.value
  }

  // Boshqa grafikdagi xodim — tanlangan sanadan shu o'ringa o'tadi.
  const moveInfo = computed(() => {
    const w = workers.value.find((v) => v.positionId === positionId.value)
    const r = w?.ranges?.find((x) => x.group_id !== Number(store.params.group))
    if (!r) return null
    const f = (d) => d.slice(8, 10) + '.' + d.slice(5, 7)
    return t('shiftType.groupView.movesHere', { name: r.type_name, from: f(r.date_from), to: f(r.date_to) })
  })

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
      .then(async () => {
        // Tanlangan ekipaj o'rni saqlanadi — ko'rinishda aynan shu joyda turadi.
        if (phaseKnown.value && store.addSlot.crew) {
          const { pattern, crewSize } = cycleOf(store.shiftType)
          const n = pattern.length
          const k = (store.addSlot.fam ?? 0) + (store.addSlot.phase - 1) * (n / crewSize) + 1
          await store._saveSlots(
            [
              {
                worker_position_id: positionId.value,
                crew: store.addSlot.crew,
                navbat: toAnchored(k, firstDay.value ?? store.monthRange.from, n),
                owner_worker_position_id: null
              }
            ],
            true
          )
        }
        store.addSlot.visible = false
        store._index()
      })
      .finally(() => {
        saving.value = false
      })
  }

</script>

<template>
  <UIModal
    v-model:visible="store.addSlot.visible"
    :width="480"
    :title="phaseKnown ? $t('shiftType.groupView.addWorkerTitle', { n: store.addSlot.pos ?? store.addSlot.phase }) : $t('shiftType.groupView.addWorker')"
  >
    <div class="flex flex-col gap-4 text-sm">
      <UIFigField :label="$t('content.worker')" editing>
        <UINSelect
          @onSearch="onSearch"
          :query="search"
          :options="workers"
          v-model:value="positionId"
          value-field="positionId"
          :render-label="UIHelper.selectRender.label"
          :render-tag="UIHelper.selectRender.value"
          :loading="loading"
          :total-count="total"
          @onScrollEv="load(true)"
        />
      </UIFigField>

      <UIFigField :label="$t('shiftType.groupView.workFrom')" editing>
        <n-date-picker
          v-model:value="date"
          type="date"
          class="w-full"
          format="dd.MM.yyyy"
          :clearable="false"
          :is-date-disabled="disabledDate"
        />
        <QuickDates class="mt-2" :current="startStr" :today="today" :today-allowed="todayAllowed" :min-day="minDay" @pick="setDate" />
      </UIFigField>

      <n-alert v-if="moveInfo" type="warning" :show-icon="false">{{ moveInfo }}</n-alert>

      <UIFigField v-if="!phaseKnown" :label="$t('shiftType.groupView.patternStart')" editing>
        <n-select v-model:value="startIndex" :options="patternOptions" />
      </UIFigField>

      <div class="flex justify-end gap-3 pt-2">
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
