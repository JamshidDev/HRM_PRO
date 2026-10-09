<script setup>
  import { useAccountStore, useScheduleGroupWorkerStore } from '@/store/modules/index.js'
  import { UIModal, UINSelect } from '@/components/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { cycleOf } from './navbat.js'

  // Bo'sh navbatga xodim: tanlangan sanadan smena oxirigacha shu navbat naqshi yoziladi.
  const store = useScheduleGroupWorkerStore()
  const accStore = useAccountStore()

  const workers = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const search = ref(null)
  const positionId = ref(null)
  const date = ref(null)

  const monthDays = computed(() => store.list[0]?.days ?? [])
  const firstDay = computed(() => monthDays.value[0]?.date ?? null)
  const lastDay = computed(() => monthDays.value[monthDays.value.length - 1]?.date ?? null)
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
      search.value = null
      const today = Utils.timeToZone(Date.now())
      const start = firstDay.value && today >= firstDay.value && today <= lastDay.value ? today : firstDay.value
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
    const phase0 = (store.addSlot.fam ?? 0) + (store.addSlot.phase - 1) * step
    const start = Utils.timeToZone(date.value)
    const diff = Math.round((new Date(`${start}T00:00:00`) - new Date(`${firstDay.value}T00:00:00`)) / 86400000)
    const index = (((phase0 + diff) % n) + n) % n
    return (index - 1 + n) % n
  }

  const onSave = () => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsGroupsWrite)) return
    if (!positionId.value || !date.value) return
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
    return !firstDay.value || d < firstDay.value || d > lastDay.value
  }
</script>

<template>
  <UIModal
    v-model:visible="store.addSlot.visible"
    :width="500"
    :title="$t('shiftType.groupView.addWorkerTitle', { n: store.addSlot.phase })"
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
      <div class="col-span-12 flex justify-end gap-4">
        <n-button @click="store.addSlot.visible = false" type="error" secondary>
          {{ $t('content.cancel') }}
        </n-button>
        <n-button @click="onSave" :loading="saving" :disabled="!positionId || !date" type="primary">
          {{ $t('content.save') }}
        </n-button>
      </div>
    </div>
  </UIModal>
</template>
