<script setup>
import {useScheduleTableStore} from "@/store/modules/index.js"
import {ScanCamera48Regular, ErrorCircle16Filled} from "@vicons/fluent"
import {UIPagination} from "@/components/index.js"
import SearchElement from "./SearchElement.vue"
const store = useScheduleTableStore()


const ROW_HEIGHT = 50
const BUFFER = 5

const scrollContainer = ref(null)
const scrollTop = ref(0)
const containerHeight = ref(0)



const visibleRange = computed(() => {
  if (!containerHeight.value) return { start: 0, end: 0 }

  const visibleCount = Math.ceil(containerHeight.value / ROW_HEIGHT)
  const start = Math.max(0, Math.floor(scrollTop.value / ROW_HEIGHT) - BUFFER)
  const end = Math.min(store.totalWorkerCount, start + visibleCount + BUFFER * 2)
  return { start, end }
})
const visibleWorkers = computed(() => {
  const { start, end } = visibleRange.value
  return store.workerList.slice(start, end).map((worker, index) => {
    const totalTime = worker.days?.reduce((sum, day) => {
      return sum + (day?.workerTime || 0)
    }, 0) || 0

    return {
      ...worker,
      offsetTop: (start + index) * ROW_HEIGHT,
      totalWorkTime: totalTime
    }
  })
})

const totalHeight = computed(() => store.totalWorkerCount * ROW_HEIGHT)

const onHideColumnEv = ()=>{
  scrollContainer.value.scrollBy({
    left: 260,
    behavior: 'smooth'
  });
}

// Scroll handler with RAF
let rafId = null
const handleScroll = () => {
  if (rafId) return

  rafId = requestAnimationFrame(() => {
    scrollTop.value = scrollContainer.value.scrollTop
    rafId = null
  })
}



// Resize observer
let resizeObserver = null



onMounted(() => {
  if (scrollContainer.value) {
    // Initial height
    containerHeight.value = scrollContainer.value.clientHeight

    // Scroll listener
    scrollContainer.value.addEventListener('scroll', handleScroll, { passive: true })

    // Resize observer
    resizeObserver = new ResizeObserver((entries) => {
      containerHeight.value = entries[0].contentRect.height
    })
    resizeObserver.observe(scrollContainer.value)
  }
})

onUnmounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', handleScroll)
  }
  resizeObserver?.disconnect()
  if (rafId) cancelAnimationFrame(rafId)
})



const showDropdown = ref(false)
const dropdownX = ref(0)
const dropdownY = ref(0)



const handleContextMenu = (e, workerIndex, dayIndex) => {
  e.preventDefault()
  showDropdown.value = false

  if(store.contextOptions.length === 0){
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

  store.selectedOption = store.contextOptions.find(v=>v.key === key)

  let dayOption = {
    isWorkDay:false,
    startTime:null,
    endTime:null,
    workTime:0,
    empty:false,
  }

  if(store.selectedOption && store.selectedOption.key === 'otherTime'){
  //   other time
    store.timeVisible =true
    showDropdown.value = false
    return
  }
  else if(store.selectedOption && store.selectedOption.key === 0){
  //   holiday
  }else{
    dayOption.isWorkDay = true
    dayOption.startTime =store.selectedOption.startTime
    dayOption.endTime = store.selectedOption.endTime
    dayOption.workTime = store.selectedOption.workTime

  }
  store.workerList[store.workerIndex].isEdit = true
  store.workerList[store.workerIndex].days[store.dayIndex] = dayOption


  store.selectedCellSet.clear()
  showDropdown.value = false

}

const handleClickOutside = () => {
  store.selectedCellSet.clear()
  showDropdown.value = false
}

const onSelectWorkDay = (day, index)=>{
  store._generateSchedule(day, index)
}

const changePage = (v)=>{
    store.workerParams.page = v.page
    store._allWorkers()
}

const updateWorkerTurnstile = (v) =>{
  store._updateTurnstile(v.id, v.canRecognize)
}

const currentDay = new Date().getDate()

</script>

<template>
  <div class="flex flex-col">
    <slot name="filter-section"></slot>
    <n-spin :show="store.workerLoading">
      <div
          @click="handleClickOutside"
          ref="scrollContainer"
          class="w-full flex flex-col overflow-x-auto overflow-y-auto h-[calc(100vh-256px)] relative rounded-tl-lg rounded-tr-lg"
      >
        <!-- Header Row - Sticky -->
        <div class="schedule-header-row flex z-[10] w-fit min-w-full sticky top-0">
          <div class="rounded-tl-lg border-r border-t border-l border-b border-surface-line p-2 w-[60px] min-w-[60px] h-[50px] sticky left-0 top-0 z-[20] bg-surface-section flex-shrink-0">
            N0
          </div>
          <div class="border-r border-t border-l-[0] border-b border-surface-line flex text-secondary font-medium justify-center items-center w-[300px] min-w-[300px] h-[50px] sticky left-[60px] top-0 z-[20] bg-surface-section flex-shrink-0">
            <SearchElement/>
          </div>
          <div class="border-r border-t border-l-[0] border-b flex gap-2 text-secondary font-medium justify-center items-center border-surface-line p-2 w-[260px] min-w-[260px] h-[50px] sticky top-0 z-[10] bg-surface-section flex-shrink-0">
<!--            <div @click="onHideColumnEv" class="cursor-pointer bg-surface-ground w-[30px] h-[30px] rounded-lg flex justify-center items-center">-->
<!--              <n-icon size="24">-->
<!--                <ChevronLeft16Filled/>-->
<!--              </n-icon>-->
<!--            </div>-->
          </div>
          <template v-for="item in store.dayOfMonth" :key="`header-${item}`">
            <div
                :class="[[6,0].includes(item.weekDay)? 'bg-[#ffe5e2]' : 'bg-[#fff9e2]']"
                class="border-r border-t border-l border-b -ml-[1px] border-surface-line w-[60px] min-w-[60px] h-[50px] text-xs text-secondary  flex-shrink-0">
              <div class="text-center p-1 font-bold">{{ item?.day }}</div>
              <div class="text-center p-1">{{store.shortNameOfWeek[item.weekDay] || '-'}}</div>
            </div>
          </template>
          <div class="rounded-tr-lg border-r border-t border-l border-b -ml-[1px] text-xs text-secondary flex justify-center items-center p-2 border-surface-line w-[80px] min-w-[80px] h-[50px] sticky right-0 top-0 bg-surface-section flex-shrink-0 z-[20]">
            {{$t('schedule.form.workTime')}}
          </div>
        </div>

        <!-- Virtual Scroll Body -->
        <div :style="{ height: totalHeight + 'px' }" class="relative">
          <div
              v-for="worker in visibleWorkers"
              :key="worker?.id"
              class="schedule-header-body-row absolute flex w-fit min-w-full bg-surface-section"
              :style="{
          transform: `translate3d(0, ${worker.offsetTop}px, 0)`,
          height: ROW_HEIGHT + 'px'
        }"
          >
            <!-- Worker Name - Sticky Left -->
            <div class="border-r  border-l border-b-0  border-surface-line text-center  p-2 w-[60px] min-w-[60px] h-[50px] border sticky left-0 bg-surface-section flex-shrink-0 z-[5] flex items-center justify-center">
              <span class="leading-[1.2] text-secondary font-medium">{{worker.number}}</span>
            </div>
            <div class="border-r  border-l-[0] border-b-0  border-surface-line  p-2 w-[300px] min-w-[300px] h-[50px] border sticky left-[60px] bg-surface-section flex-shrink-0 z-[5] flex items-center">


              <n-tooltip
                  placement="top"
                  trigger="hover"
              >
                <template #trigger>
                  <n-icon @click="updateWorkerTurnstile(worker)"  size="26" class="mr-2 cursor-pointer" :class="[worker.canRecognize? 'text-success':'text-danger']">
                    <ScanCamera48Regular v-if="worker.canRecognize"/>
                    <ErrorCircle16Filled v-else/>
                  </n-icon>
                </template>
                <span>{{$t(worker.canRecognize? 'shiftType.form.turnstileActive' : 'shiftType.form.turnstileUnActive')}}</span>
              </n-tooltip>
             <div class="flex flex-col w-[calc(100%-40px)]">
               <span class="leading-[1.2] text-textColor2 font-medium text-xs line-clamp-1">{{ worker?.fullName }}</span>
               <span class="leading-[1.2] text-textColor3 text-xs line-clamp-1">{{ worker?.position }}</span>
             </div>
            </div>
            <div class="border-r  border-l-[0] border-b-0  border-surface-line  p-2 w-[260px] min-w-[260px] h-[50px] border sticky bg-surface-section flex-shrink-0 z-[4]">
              <div class="leading-[1.2] line-clamp-1 font-medium text-xs">{{worker.scheduleType}}</div>
              <div class="leading-[1.2] line-clamp-1 text-xs text-secondary" >{{worker.type}}</div>
            </div>

            <!-- Day Cells -->
            <template v-for="(day, dayIndex) in store.dayOfMonth" :key="`${worker.id}-${dayIndex}-${store.nextTickKey}`">
              <div
                  @contextmenu="handleContextMenu($event,worker.index, dayIndex)"
                  :class="[day.day === currentDay && '!bg-success/10', store.selectedCellSet.has(`${worker.index}-${dayIndex}`) && 'selected-cell-bg',worker.isEdit? 'bg-surface-ground/80':'bg-surface-ground/20']"
                  class="border-r text-center  border-l border-b-0 -ml-[1px] border-surface-line w-[60px] min-w-[60px] h-[50px] border text-xs text-secondary p-2 pb-0 flex-shrink-0 cursor-pointer relative"
              >
                <template v-if="worker?.days?.[dayIndex]?.empty">
<!--                  Empty box-->
                </template>
                <template v-else-if="worker?.days?.[dayIndex]?.isWorkDay">
                  <div class="leading-[1.2] pt-3">{{worker?.days?.[dayIndex]?.startTime}}</div>
                  <div class="leading-[1.2]">{{worker?.days?.[dayIndex]?.endTime}}</div>
                  <div class="absolute top-[0] left-[0] w-[16px] h-[16px] bg-secondary/80 text-white text-xs rounded"> {{Math.floor(worker?.days?.[dayIndex]?.workTime/60)}}</div>
                </template>
                <template v-else>
                  <div class="absolute top-[0] left-[0] w-[16px] h-[16px] bg-success/10 text-white text-xs rounded hover:bg-success/50"> D</div>
                </template>

              </div>
            </template>

            <!-- Total - Sticky Right -->
            <div class="border-r border-l border-t -ml-[1px] border-surface-line  w-[80px] min-w-[80px] h-[50px] sticky right-0 bg-surface-section flex-shrink-0 z-[5] flex items-center justify-center">
              {{store.calculateWorkTime(worker.index)}}
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