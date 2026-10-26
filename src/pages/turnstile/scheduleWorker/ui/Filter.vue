<script setup>
  import { useAccountStore, useScheduleGroupWorkerStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { ArrowReset20Regular, Search20Regular } from '@vicons/fluent'
  import MonthTab from './MonthTab.vue'
  import { isRotating } from './navbat.js'

  // Qidiruv brauzerda (Table.vue `visibleList`) — so'rov yuborilmaydi.
  const store = useScheduleGroupWorkerStore()
  const accStore = useAccountStore()

  // Qayta generatsiya — faqat aylanma smenada va faqat joriy oy ochiq bo'lganda.
  const currentMonth = Utils.timeToZone(Date.now()).slice(0, 7)
  const canGroupRegen = computed(
    () =>
      isRotating(store.shiftType) &&
      String(store.selectedDate || '').slice(0, 7) === currentMonth &&
      store.list.length > 0 &&
      accStore.checkPermission(accStore.pn.turnstileSheetsGroupsWrite)
  )
  const onGroupRegen = () => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsGroupsWrite)) return
    store.groupRegen.visible = true
  }

  const onChangeMonth = () => {
    store.params.page = 1
    store._dayOfMonth(() => {
      store._index()
    })
  }
</script>

<template>
  <div class="flex flex-col md:flex-row md:items-center gap-3">
    <n-input
      v-model:value="store.params.search"
      clearable
      class="md:w-[264px]! shrink-0"
      :placeholder="$t('content.search')"
    >
      <template #prefix>
        <n-icon size="16" class="text-secondary"><Search20Regular /></n-icon>
      </template>
    </n-input>
    <MonthTab
      v-if="store.selectedDate"
      class="flex-1 min-w-0"
      :options="store.monthsList"
      v-model:date="store.selectedDate"
      @update:date="onChangeMonth"
    />
    <n-button v-if="canGroupRegen" secondary type="primary" class="shrink-0" @click="onGroupRegen">
      <template #icon><ArrowReset20Regular /></template>
      {{ $t('shiftType.groupView.groupRegen') }}
    </n-button>
  </div>
</template>
