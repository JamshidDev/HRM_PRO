<script setup>
  import { useTurnstileScheduleStore } from '@/store/modules/index.js'
  import { UIPagination } from '@/components/index.js'
  import SearchElement from './SearchElement.vue'
  import WorkerColumn from './WorkerColumn.vue'
  import ScheduleBox from './ScheduleBox.vue'

  const store = useTurnstileScheduleStore()
  const scheduleContainer = ref(null)

  const showDropdown = ref(false)
  const dropdownX = ref(0)
  const dropdownY = ref(0)

  const handleContextMenu = (e, workerIndex, dayIndex) => {
    e.preventDefault()
    showDropdown.value = false

    if (store.contextOptions.length === 0) {
      store.contextOptions = store.defaultOptions
    }
    store.workerIndex = workerIndex
    store.dayIndex = dayIndex

    store.selectedCellSet.clear()
    store.selectedCellSet.add(`${workerIndex}-${dayIndex}`)

    setTimeout(() => {
      showDropdown.value = true
      dropdownX.value = e.clientX
      dropdownY.value = e.clientY
    })
  }

  const handleSelect = (key) => {
    store.selectedOption = store.contextOptions.find((v) => v.key === key)

    let dayOption = {
      isWorkDay: false,
      startTime: null,
      endTime: null,
      workTime: 0,
      empty: false,
      dayTime: 0,
      eveningTime: 0
    }

    if (store.selectedOption && store.selectedOption.key === 'otherTime') {
      //   other time
      store.timeVisible = true
      store._resetTimePayload()
      showDropdown.value = false
      return
    } else if (store.selectedOption && store.selectedOption.key === 'clearTime') {
      dayOption.empty = true
    } else if (store.selectedOption && store.selectedOption.key === 'copyTime') {
      dayOption = store.workerList[store.workerIndex].days[store.dayIndex]
    } else if (store.selectedOption && store.selectedOption.key === 0) {
      //   holiday
    } else {
      dayOption.isWorkDay = true
      dayOption.startTime = store.selectedOption.startTime
      dayOption.endTime = store.selectedOption.endTime
      dayOption.workTime = store.selectedOption.workTime
      dayOption.dayTime = store.selectedOption.dayTime
      dayOption.eveningTime = store.selectedOption.eveningTime
    }
    store.isSelectedContext = true
    store.workerList[store.workerIndex].isEdit = true
    store.savedOption = dayOption
    store.workerList[store.workerIndex].days[store.dayIndex] = dayOption

    store.selectedCellSet.clear()
    showDropdown.value = false
  }

  const handleClickOutside = () => {
    store.selectedCellSet.clear()
    showDropdown.value = false
  }

  const changePage = (v) => {
    store.workerParams.page = v.page
    store._allWorkers()
  }

  let currentDay = new Date().getDate()

  const handleDragSelect = (v) => {
    if (!store.isSelectedContext) return

    let dayOption = store.savedOption || {
      isWorkDay: false,
      startTime: null,
      endTime: null,
      workTime: 0,
      empty: false
    }
    for (let item of v) {
      store.workerList[item.workerIndex].isEdit = true
      store.workerList[item.workerIndex].days[item.dayIndex] = { ...dayOption }
    }
  }

  const scrollToCurrentDay = () => {
    if (!scheduleContainer.value) return
    const currentDayIndex = store.dayOfMonth.findIndex((d) => d.day === currentDay)

    if (currentDayIndex === -1) return

    const fixedLeftWidth = 20
    const columnWidth = 200

    const scrollPosition = currentDayIndex * columnWidth - fixedLeftWidth
    scheduleContainer.value.scrollTo({
      left: Math.max(0, scrollPosition),
      behavior: 'smooth'
    })
  }

  watchEffect(async () => {
    if (store.workerList.length && store.workerParams.page === 1) {
      await nextTick(() => {
        scrollToCurrentDay()
      })
    }
  })
</script>

<template>
  <div class="flex flex-col">
    <slot name="filter-section"></slot>
    <n-spin :show="store.workerLoading">
      <div
        ref="scheduleContainer"
        class="w-full flex flex-col overflow-x-auto overflow-y-auto h-[calc(100vh-256px)] relative rounded-tl-lg rounded-tr-lg"
      >
        <div
          class="no-selectable-item schedule-header-row flex z-[202] w-fit min-w-full sticky top-0"
        >
          <div
            class="font-bold flex justify-center items-center rounded-tl-lg border-r border-t border-l border-b border-surface-line p-2 w-[60px] min-w-[60px] h-[50px] sticky left-0 top-0 z-[20] bg-surface-section flex-shrink-0"
          >
            #
          </div>
          <div
            class="border-r border-t border-l-[0] border-b border-surface-line flex text-secondary font-medium justify-center items-center w-[300px] min-w-[300px] h-[50px] sticky left-[60px] top-0 z-[20] bg-surface-section flex-shrink-0"
          >
            <SearchElement />
          </div>
          <template v-for="item in store.dayOfMonth" :key="`header-${item}`">
            <div
              :class="[[6, 0].includes(item.weekDay) ? 'bg-[#FAD8D6]' : 'bg-[#ECEFF3]']"
              class="border-r border-t font-bold border-l border-b -ml-[1px] border-surface-line w-[200px] min-w-[200px] h-[50px] text-xs text-secondary flex-shrink-0"
            >
              <div class="text-center p-1 font-bold">{{ item?.day }}</div>
              <div class="text-center p-1">{{ store.shortNameOfWeek[item.weekDay] || '-' }}</div>
            </div>
          </template>
          <div
            class="rounded-tr-lg border-r border-t border-l border-b -ml-[1px] font-bold text-xs text-white flex justify-center items-center p-2 border-surface-line w-[80px] min-w-[80px] h-[50px] sticky right-0 top-0 bg-secondary flex-shrink-0 z-[20]"
          >
            {{ $t('schedule.form.workTime') }}
          </div>
        </div>

        <div class="relative">
          <div
            v-for="worker in store.workerList"
            :key="worker?.id"
            class="schedule-header-body-row flex w-fit min-w-full bg-surface-section hover:!bg-surface-ground select-none"
          >
            <div
              class="no-selectable-item border-r border-l border-b-0 border-surface-line text-center p-2 w-[60px] min-w-[60px] h-[50px] border sticky left-0 bg-surface-section flex-shrink-0 z-[200] flex items-center justify-center"
            >
              <span class="leading-[1.2] text-secondary font-medium">{{ worker.number }}</span>
            </div>

            <div
              class="no-selectable-item border-r border-l-[0] border-b-0 border-surface-line p-2 w-[300px] min-w-[300px] h-[50px] border sticky left-[60px] bg-surface-section flex-shrink-0 z-[200] flex items-center"
            >
              <WorkerColumn :worker="worker" />
            </div>

            <template
              v-for="(day, dayIndex) in store.dayOfMonth"
              :key="`${worker.id}-${dayIndex}-${store.nextTickKey}`"
            >
              <!--              @contextmenu="handleContextMenu($event,worker.index, dayIndex)"-->
              <div
                data-selectable
                :data-day-index="dayIndex"
                :data-worker-index="worker.index"
                :class="[
                  day.day === currentDay && '!bg-success/10',
                  store.selectedCellSet.has(`${worker.index}-${dayIndex}`) && 'selected-cell-bg'
                ]"
                class="border-r text-center border-b-0 -ml-[1px] border-surface-line border-l-[3px] w-[200px] min-w-[200px] h-[50px] border text-xs text-secondary pb-0 flex-shrink-0 cursor-pointer relative"
              >
                <ScheduleBox :worker="worker" :dayIndex="dayIndex" />
              </div>
            </template>

            <div
              class="no-selectable-item border-r font-bold border-l border-t -ml-[1px] border-surface-line w-[80px] min-w-[80px] h-[50px] sticky right-0 bg-[#ECEFF3] flex-shrink-0 z-[200]"
            >
              <div class="w-full !h-1/2 border-b border-dashed border-secondary/30 px-2">
                {{ store.calculateWorkTime(worker.index) }}
              </div>
              <div class="w-full !h-1/2 px-2 text-secondary">
                {{ store.calculateFactTime(worker.index) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <slot name="loading-place"></slot>
    </n-spin>

    <n-dropdown
      size="small"
      placement="bottom-start"
      trigger="manual"
      :x="dropdownX"
      :y="dropdownY"
      :options="store.contextOptions"
      :show="showDropdown"
      :on-clickoutside="handleClickOutside"
      @select="handleSelect"
    />
    <UIPagination
      :page="store.workerParams.page"
      :per_page="store.workerParams.per_page"
      :total="store.totalWorkerCount"
      @change-page="changePage"
      :show-size-picker="false"
    />
  </div>
</template>

<style scoped>
  /* Optional: Scrollbar styling */
  .schedule-header-row,
  .schedule-header-body-row {
    scrollbar-width: thin;
  }

  .schedule-header-row::-webkit-scrollbar,
  .schedule-header-body-row::-webkit-scrollbar {
    height: 8px;
  }

  .schedule-header-row::-webkit-scrollbar-thumb,
  .schedule-header-body-row::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  .selected-cell-bg {
    background-color: #bbe0ff;
  }

  .holiday-cell-bg {
    background-color: #ffbbf1 !important;
  }
</style>
